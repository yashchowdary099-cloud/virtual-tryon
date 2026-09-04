package com.sfit.garment;

import java.net.URI;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Amazon product pages (all locales: .in, .com, .co.uk …).
 *
 * <p>Amazon server-renders the detail page, so the reliable hooks are element ids and
 * data attributes rather than CSS classes: {@code #productTitle},
 * {@code data-a-dynamic-image} (a JSON map of image URL → {@code [width, height]},
 * which is also the best available resolution signal) and {@code data-old-hires}.
 * The {@code ._AC_UL320_.} size modifier in the URL is stripped by
 * {@link ImageUrlEnhancer} to fetch the original asset.
 */
public final class AmazonParser implements ProductPageParser {

    @Override
    public String platform() {
        return "amazon";
    }

    @Override
    public String displayName() {
        return "Amazon";
    }

    @Override
    public String[] hostPatterns() {
        return new String[]{"amazon.in", "amazon.com", "amazon.co.uk", "amzn.to", "amazon."};
    }

    @Override
    public boolean supports(URI url) {
        return ProductPageParser.hostMatches(url, "amazon.", "amzn.to", "amzn.in");
    }

    @Override
    public ParsedProduct parse(HtmlDoc doc, URI pageUrl) {
        ParsedProduct product = ParsedProduct.create()
                .platform(platform(), displayName())
                .sourceUrl(pageUrl == null ? null : pageUrl.toString());

        product.name(doc.textOfElementWithId("productTitle"));
        product.brand(cleanByline(doc.textOfElementWithId("bylineInfo")));
        product.color(doc.firstMatch("id=\"variation_color_name\".*?class=\"selection\"[^>]*>([^<]{2,40})<"));
        product.size(doc.firstMatch("id=\"variation_size_name\".*?class=\"selection\"[^>]*>([^<]{1,20})<"));

        product.addImage(doc.findAttribute("data-old-hires"));
        product.addImages(imagesFromDynamicAttribute(doc.findAttribute("data-a-dynamic-image")));
        product.addImages(doc.allMatches("\"hiRes\"\\s*:\\s*\"([^\"]+)\"", 12));
        product.addImages(doc.allMatches("\"large\"\\s*:\\s*\"([^\"]+)\"", 12));

        product.price(doc.firstMatch("class=\"a-price-whole\"[^>]*>([0-9,.]+)"));
        if (product.price() == null) {
            product.price(doc.firstMatch("id=\"priceblock_(?:ourprice|dealprice|saleprice)\"[^>]*>([^<]+)<"));
        }
        if (product.price() == null) {
            product.price(doc.firstMatch("\"priceAmount\"\\s*:\\s*([0-9.]+)"));
        }

        // Breadcrumb trail: "Clothing & Accessories › Men › T-Shirts"
        String breadcrumbs = doc.firstMatch(
                "id=\"wayfinding-breadcrumbs_feature_div\"(.{0,4000}?)</div>");
        if (breadcrumbs != null) {
            product.categoryHint(breadcrumbs.replaceAll("<[^>]*>", " "));
        }
        product.categoryHint(doc.firstMatch("id=\"productTypeName\"[^>]*value=\"([^\"]+)\""));

        GenericStoreParser.applyStructuredData(doc, pageUrl, product);
        return product;
    }

    /** "Visit the Nike Store" / "Brand: Nike" → "Nike". */
    static String cleanByline(String byline) {
        if (byline == null) {
            return null;
        }
        String out = byline.replaceAll("(?i)^visit\\s+the\\s+", "")
                .replaceAll("(?i)\\s+store$", "")
                .replaceAll("(?i)^brand\\s*:\\s*", "")
                .trim();
        return out.isEmpty() ? null : out;
    }

    /**
     * Parses {@code data-a-dynamic-image='{"https://...jpg":[1500,1500], ...}'} and returns
     * the URLs largest-first, using the declared pixel dimensions.
     */
    static List<String> imagesFromDynamicAttribute(String attributeValue) {
        List<String> out = new ArrayList<String>();
        if (attributeValue == null) {
            return out;
        }
        Object parsed = MiniJson.parse(attributeValue.trim());
        Map<String, Object> map = JsonQuery.asMap(parsed);
        if (map == null) {
            return out;
        }
        final Map<String, Integer> areas = new java.util.LinkedHashMap<String, Integer>();
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            String url = entry.getKey();
            if (url == null || url.trim().isEmpty()) {
                continue;
            }
            int area = 0;
            List<Object> dims = JsonQuery.asList(entry.getValue());
            if (dims != null && dims.size() >= 2 && dims.get(0) instanceof Double && dims.get(1) instanceof Double) {
                area = (int) (((Double) dims.get(0)).doubleValue() * ((Double) dims.get(1)).doubleValue());
            }
            areas.put(url, Integer.valueOf(area));
            out.add(url);
        }
        Collections.sort(out, new Comparator<String>() {
            @Override
            public int compare(String left, String right) {
                return areas.get(right).intValue() - areas.get(left).intValue();
            }
        });
        return out;
    }
}
