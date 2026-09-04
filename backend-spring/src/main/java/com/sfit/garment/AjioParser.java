package com.sfit.garment;

import java.net.URI;
import java.util.List;
import java.util.Map;

/**
 * AJIO product pages.
 *
 * <p>AJIO emits clean schema.org {@code Product} JSON-LD, which does most of the work.
 * On top of that it inlines a Redux payload (<code>window.__PRELOADED_STATE__</code>)
 * holding the colour variant and the media list, and its CDN encodes the render size in
 * the filename ({@code -473Wx593H-}) so {@link ImageUrlEnhancer} can request the
 * full-size asset instead of the gallery thumbnail.
 */
public final class AjioParser implements ProductPageParser {

    private static final String[] ANCHORS = {"__PRELOADED_STATE__", "__INITIAL_STATE__", "\"fnlColorVariantData\""};

    @Override
    public String platform() {
        return "ajio";
    }

    @Override
    public String displayName() {
        return "AJIO";
    }

    @Override
    public String[] hostPatterns() {
        return new String[]{"ajio.com"};
    }

    @Override
    public boolean supports(URI url) {
        return ProductPageParser.hostMatches(url, "ajio.com");
    }

    @Override
    public ParsedProduct parse(HtmlDoc doc, URI pageUrl) {
        ParsedProduct product = ParsedProduct.create()
                .platform(platform(), displayName())
                .sourceUrl(pageUrl == null ? null : pageUrl.toString())
                .currency("INR");

        // Structured data first: on AJIO it is both present and accurate.
        GenericStoreParser.applyJsonLd(doc, product);
        GenericStoreParser.applyOpenGraph(doc, product);

        Map<String, Object> state = findState(doc.raw());
        if (state != null) {
            product.name(JsonQuery.deepText(state, "name", "productName"));
            product.brand(JsonQuery.deepText(state, "brandName", "brand"));
            product.color(JsonQuery.deepText(state, "colorGroup", "color", "colour"));
            product.price(JsonQuery.deepText(state, "offerPrice", "sellingPrice", "value", "price"));
            product.categoryHint(JsonQuery.deepText(state, "verticalName", "categoryName", "l3Name", "brickName"));
            List<String> media = JsonQuery.deepCollect(state, 20, "url", "imageUrl", "assetUrl");
            product.addImages(media);
        }

        if (!product.hasImage()) {
            product.addImages(doc.allMatches("(https?://assets\\.ajio\\.com/[^\"'\\\\\\s]+)", 20));
        }
        if (pageUrl != null && pageUrl.getPath() != null) {
            product.categoryHint(pageUrl.getPath().replace('/', ' ').replace('-', ' '));
        }

        GenericStoreParser.applyStructuredData(doc, pageUrl, product);
        return product;
    }

    private static Map<String, Object> findState(String html) {
        for (String anchor : ANCHORS) {
            String block = MiniJson.extractJsObject(html, anchor);
            if (block == null) {
                continue;
            }
            Map<String, Object> map = JsonQuery.asMap(MiniJson.parse(block));
            if (map != null && !map.isEmpty()) {
                return map;
            }
        }
        return null;
    }
}
