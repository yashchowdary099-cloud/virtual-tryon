package com.sfit.garment;

import java.net.URI;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Last parser in the chain, and the shared structured-data engine for all the others.
 *
 * <p>Reads schema.org {@code Product} JSON-LD, OpenGraph/Twitter cards and microdata —
 * the three things almost every modern storefront emits (Shopify, WooCommerce,
 * Magento, BigCommerce, most D2C brand sites). Because {@link ParsedProduct} setters
 * only fill blank fields, site-specific parsers run first and then call
 * {@link #applyStructuredData} to top up whatever they could not find.
 */
public final class GenericStoreParser implements ProductPageParser {

    @Override
    public String platform() {
        return "generic";
    }

    @Override
    public String displayName() {
        return "Other online stores";
    }

    @Override
    public String[] hostPatterns() {
        return new String[]{"*"};
    }

    @Override
    public boolean supports(URI url) {
        return true; // catch-all
    }

    @Override
    public ParsedProduct parse(HtmlDoc doc, URI pageUrl) {
        ParsedProduct product = ParsedProduct.create()
                .platform("generic", storeName(doc, pageUrl))
                .sourceUrl(pageUrl == null ? null : pageUrl.toString());
        applyStructuredData(doc, pageUrl, product);
        return product;
    }

    /** The store's own name if it declares one, else a label derived from the host. */
    private static String storeName(HtmlDoc doc, URI pageUrl) {
        String declared = doc == null ? null : doc.metaAny("og:site_name", "application-name");
        if (declared != null && declared.trim().length() > 1 && declared.trim().length() <= 40) {
            return declared.trim();
        }
        return storeLabel(pageUrl);
    }

    /** Runs the JSON-LD → OpenGraph → microdata → title/sweep ladder. */
    public static void applyStructuredData(HtmlDoc doc, URI pageUrl, ParsedProduct product) {
        if (doc == null || product == null) {
            return;
        }
        applyJsonLd(doc, product);
        applyOpenGraph(doc, product);
        applyMicrodata(doc, product);
        if (product.name() == null) {
            product.name(cleanTitle(doc.title()));
        }
        if (!product.hasImage()) {
            sweepImages(doc, product);
        }
        product.canonicalUrl(doc.canonicalUrl());
    }

    /** schema.org Product, wherever it sits in the graph (bare, array or {@code @graph}). */
    public static void applyJsonLd(HtmlDoc doc, ParsedProduct product) {
        for (String block : doc.jsonLdBlocks()) {
            Object root = MiniJson.parse(block);
            if (root == null) {
                continue;
            }
            Map<String, Object> node = JsonQuery.findByType(root, "Product");
            if (node == null) {
                node = JsonQuery.findByType(root, "ProductGroup");
            }
            if (node == null) {
                continue;
            }
            product.name(JsonQuery.text(JsonQuery.get(node, "name")));
            product.brand(JsonQuery.text(JsonQuery.get(node, "brand")));
            product.description(JsonQuery.text(JsonQuery.get(node, "description")));
            product.color(JsonQuery.text(JsonQuery.get(node, "color")));
            product.size(JsonQuery.text(JsonQuery.get(node, "size")));
            product.canonicalUrl(JsonQuery.text(JsonQuery.get(node, "url")));

            Object offers = JsonQuery.get(node, "offers");
            product.price(JsonQuery.deepText(offers, "price", "lowPrice", "highPrice"));
            product.currency(JsonQuery.deepText(offers, "priceCurrency"));
            if (product.price() == null) {
                product.price(JsonQuery.deepText(node, "price"));
            }

            collectImages(JsonQuery.get(node, "image"), product);
            // schema.org category is a direct taxonomy signal for garment detection
            product.categoryHint(JsonQuery.deepText(node, "category"));
            if (product.hasImage() && product.name() != null) {
                return;
            }
        }
    }

    /** Handles image values that are strings, arrays, ImageObjects or arrays of those. */
    private static void collectImages(Object imageNode, ParsedProduct product) {
        if (imageNode == null) {
            return;
        }
        if (imageNode instanceof String) {
            product.addImage((String) imageNode);
            return;
        }
        List<Object> list = JsonQuery.asList(imageNode);
        if (list != null) {
            for (Object item : list) {
                collectImages(item, product);
            }
            return;
        }
        Map<String, Object> map = JsonQuery.asMap(imageNode);
        if (map != null) {
            product.addImages(JsonQuery.deepCollect(map, 12, "url", "contentUrl"));
        }
    }

    /** OpenGraph and Twitter card tags — the most reliable cross-site source of a hero image. */
    public static void applyOpenGraph(HtmlDoc doc, ParsedProduct product) {
        product.addImage(doc.metaAny("og:image:secure_url", "og:image", "og:image:url"));
        product.addImage(doc.metaAny("twitter:image", "twitter:image:src"));
        product.name(cleanTitle(doc.metaAny("og:title", "twitter:title")));
        product.brand(doc.metaAny("product:brand", "og:brand", "brand"));
        product.description(doc.metaAny("og:description", "twitter:description", "description"));
        product.price(doc.metaAny("product:price:amount", "og:price:amount", "twitter:data1"));
        product.currency(doc.metaAny("product:price:currency", "og:price:currency"));
        product.color(doc.meta("product:color"));
    }

    /** Microdata: {@code <meta itemprop>} is handled by HtmlDoc; images need tag scanning. */
    public static void applyMicrodata(HtmlDoc doc, ParsedProduct product) {
        product.name(doc.meta("name"));
        product.price(doc.metaAny("price", "lowPrice"));
        String withSrcLast = doc.firstMatch(
                "<img\\b[^>]*itemprop\\s*=\\s*[\"']image[\"'][^>]*?\\ssrc\\s*=\\s*[\"']([^\"']+)[\"']");
        String withSrcFirst = doc.firstMatch(
                "<img\\b[^>]*\\ssrc\\s*=\\s*[\"']([^\"']+)[\"'][^>]*itemprop\\s*=\\s*[\"']image[\"']");
        product.addImage(withSrcLast);
        product.addImage(withSrcFirst);
    }

    /**
     * Final fallback: pull gallery {@code <img>} sources (including lazy-load attributes and
     * the largest {@code srcset} entry). Only used when nothing structured was found.
     */
    public static void sweepImages(HtmlDoc doc, ParsedProduct product) {
        product.addImages(doc.allMatches("<img\\b[^>]*\\bsrc\\s*=\\s*[\"']([^\"']+)[\"']", 24));
        product.addImages(doc.allMatches("\\bdata-(?:src|zoom-image|large_image|image)\\s*=\\s*[\"']([^\"']+)[\"']", 16));
        for (String srcset : doc.allMatches("\\bsrcset\\s*=\\s*[\"']([^\"']+)[\"']", 8)) {
            product.addImage(largestFromSrcset(srcset));
        }
    }

    /** Picks the highest-width entry out of a {@code srcset} attribute. */
    static String largestFromSrcset(String srcset) {
        if (srcset == null) {
            return null;
        }
        String best = null;
        int bestWidth = -1;
        for (String entry : srcset.split(",")) {
            String trimmed = entry.trim();
            if (trimmed.isEmpty()) {
                continue;
            }
            String[] parts = trimmed.split("\\s+");
            int width = 0;
            if (parts.length > 1) {
                String descriptor = parts[parts.length - 1].toLowerCase(Locale.ROOT);
                try {
                    width = Integer.parseInt(descriptor.replaceAll("[^0-9]", ""));
                } catch (NumberFormatException ignored) {
                    width = 0;
                }
            }
            if (width > bestWidth) {
                bestWidth = width;
                best = parts[0];
            }
        }
        return best;
    }

    /**
     * Strips the boilerplate storefronts bolt onto page titles
     * ("Buy … Online at Best Price | Site.com") so the name reads like a garment.
     */
    public static String cleanTitle(String title) {
        if (title == null) {
            return null;
        }
        String out = title.trim();
        int separator = indexOfAny(out, new String[]{" | ", " – ", " — ", " :: "});
        if (separator > 12) {
            out = out.substring(0, separator);
        }
        out = out.replaceAll("(?i)^buy\\s+", "");
        out = out.replaceAll("(?i)\\s*[-–|]\\s*buy\\s+.*$", "");
        out = out.replaceAll("(?i)\\s*[-–|]?\\s*(buy|shop)\\s+online.*$", "");
        out = out.replaceAll("(?i)\\s*online\\s+at\\s+best\\s+price.*$", "");
        out = out.replaceAll("(?i)\\s*at\\s+best\\s+prices?\\s+in\\s+india.*$", "");
        out = out.replaceAll("(?i)\\s*price\\s+in\\s+india.*$", "");
        out = out.replaceAll("(?i)\\s*free\\s+shipping.*$", "");
        out = out.replaceAll("\\s+", " ").trim();
        out = out.replaceAll("[\\s,;:|\\-–]+$", "").trim();
        return out.isEmpty() ? null : out;
    }

    private static int indexOfAny(String value, String[] separators) {
        int best = -1;
        for (String separator : separators) {
            int at = value.indexOf(separator);
            if (at >= 0 && (best < 0 || at < best)) {
                best = at;
            }
        }
        return best;
    }

    /** "www.shop.nike.com" → "Nike", used as the platform label for unknown stores. */
    public static String storeLabel(URI url) {
        if (url == null || url.getHost() == null) {
            return "Online store";
        }
        String host = url.getHost().toLowerCase(Locale.ROOT).replaceAll("^www\\d?\\.", "");
        String[] labels = host.split("\\.");
        String core = labels.length >= 2 ? labels[labels.length - 2] : labels[0];
        if ("co".equals(core) || "com".equals(core) || "in".equals(core)) {
            core = labels.length >= 3 ? labels[labels.length - 3] : core;
        }
        if (core.isEmpty()) {
            return "Online store";
        }
        return Character.toUpperCase(core.charAt(0)) + core.substring(1);
    }
}



