package com.sfit.garment;

import java.net.URI;
import java.util.List;
import java.util.Map;

/**
 * Myntra product pages.
 *
 * <p>Myntra renders the product client-side but ships the whole payload inline as
 * {@code window.__myx = { pdpData: { ... } }}, which is far richer than the page's
 * OpenGraph tags: brand, article type (a direct category signal), colour, price and
 * the full media album. Image {@code src} values contain size placeholders such as
 * {@code h_($height),q_($qualityPercentage),w_($width)} that
 * {@link ImageUrlEnhancer} substitutes with full-resolution values.
 */
public final class MyntraParser implements ProductPageParser {

    private static final String[] ANCHORS = {"__myxPdpData", "__myx =", "__myx=", "\"pdpData\""};

    @Override
    public String platform() {
        return "myntra";
    }

    @Override
    public String displayName() {
        return "Myntra";
    }

    @Override
    public String[] hostPatterns() {
        return new String[]{"myntra.com"};
    }

    @Override
    public boolean supports(URI url) {
        return ProductPageParser.hostMatches(url, "myntra.com");
    }

    @Override
    public ParsedProduct parse(HtmlDoc doc, URI pageUrl) {
        ParsedProduct product = ParsedProduct.create()
                .platform(platform(), displayName())
                .sourceUrl(pageUrl == null ? null : pageUrl.toString());

        Map<String, Object> pdp = findPdpData(doc.raw());
        if (pdp != null) {
            product.name(JsonQuery.text(JsonQuery.get(pdp, "name")));
            product.brand(JsonQuery.deepText(JsonQuery.get(pdp, "brand"), "name", "brandName"));
            product.color(JsonQuery.text(JsonQuery.get(pdp, "baseColour")));
            product.color(JsonQuery.deepText(pdp, "colour", "color"));
            product.price(JsonQuery.deepText(JsonQuery.get(pdp, "price"), "discounted", "discountedPrice", "mrp"));
            product.price(JsonQuery.deepText(pdp, "discountedPrice", "mrp"));
            product.currency("INR");

            // articleType/subCategory are Myntra's own taxonomy: "Tshirts", "Dresses", "Trousers"
            String articleType = JsonQuery.deepText(JsonQuery.get(pdp, "analytics"), "articleType");
            if (articleType == null) {
                articleType = JsonQuery.deepText(pdp, "articleType", "subCategory", "masterCategory");
            }
            product.categoryHint(articleType);

            List<String> media = JsonQuery.deepCollect(JsonQuery.get(pdp, "media"), 20, "secureSrc", "src");
            product.addImages(media);
            if (!product.hasImage()) {
                product.addImages(JsonQuery.deepCollect(pdp, 20, "secureSrc", "src"));
            }
        }

        // Raw sweep of the CDN host catches layouts the JSON walk misses.
        if (!product.hasImage()) {
            product.addImages(doc.allMatches("(https?://[^\"'\\\\\\s]*myntassets\\.com/[^\"'\\\\\\s]+)", 20));
        }
        GenericStoreParser.applyStructuredData(doc, pageUrl, product);
        return product;
    }

    /** Locates and parses the inline {@code __myx} blob, trying each known anchor. */
    private static Map<String, Object> findPdpData(String html) {
        for (String anchor : ANCHORS) {
            String block = MiniJson.extractJsObject(html, anchor);
            if (block == null) {
                continue;
            }
            Object parsed = MiniJson.parse(block);
            if (parsed == null) {
                continue;
            }
            Map<String, Object> pdp = JsonQuery.asMap(JsonQuery.get(parsed, "pdpData"));
            if (pdp != null) {
                return pdp;
            }
            Map<String, Object> root = JsonQuery.asMap(parsed);
            if (root != null && (JsonQuery.get(root, "name") != null || JsonQuery.get(root, "media") != null)) {
                return root;
            }
        }
        return null;
    }
}
