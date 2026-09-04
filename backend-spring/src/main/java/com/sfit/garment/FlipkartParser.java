package com.sfit.garment;

import java.net.URI;
import java.util.List;

/**
 * Flipkart product pages.
 *
 * <p>Flipkart's markup uses hashed CSS class names that change often, so nothing here
 * depends on them. It relies instead on the stable parts: OpenGraph tags, the
 * {@code rukminim*.flixcart.com} image CDN (whose URLs embed the requested size, so
 * {@link ImageUrlEnhancer} can upgrade a 612px thumbnail to 1664px), and the rupee
 * amount in the page's own price markup as a last resort.
 */
public final class FlipkartParser implements ProductPageParser {

    /** Rupee sign, built from its code point so this file stays pure ASCII. */
    private static final String RUPEE = String.valueOf((char) 0x20B9);

    @Override
    public String platform() {
        return "flipkart";
    }

    @Override
    public String displayName() {
        return "Flipkart";
    }

    @Override
    public String[] hostPatterns() {
        return new String[]{"flipkart.com", "dl.flipkart.com"};
    }

    @Override
    public boolean supports(URI url) {
        return ProductPageParser.hostMatches(url, "flipkart.com");
    }

    @Override
    public ParsedProduct parse(HtmlDoc doc, URI pageUrl) {
        ParsedProduct product = ParsedProduct.create()
                .platform(platform(), displayName())
                .sourceUrl(pageUrl == null ? null : pageUrl.toString())
                .currency("INR");

        // The CDN sweep is the most dependable image source on Flipkart.
        List<String> cdnImages = doc.allMatches("(https?://rukminim[^\"'\\\\\\s]+\\.flixcart\\.com/[^\"'\\\\\\s]+)", 24);
        product.addImages(cdnImages);

        product.name(GenericStoreParser.cleanTitle(doc.metaAny("og:title", "twitter:title")));
        product.brand(doc.meta("product:brand"));

        // The first rupee amount on the page sits in the selling-price block.
        String rupee = doc.firstMatch(RUPEE + "\\s?([0-9][0-9,]{1,9})");
        product.price(rupee);
        if (product.price() == null) {
            product.price(doc.firstMatch("\"(?:sellingPrice|finalPrice|price)\"\\s*:\\s*\\{?\\s*\"?(?:value\"?\\s*:\\s*)?([0-9]+(?:\\.[0-9]+)?)"));
        }

        // The URL path is Flipkart's most stable category signal:
        // /nike-solid-men-round-neck-blue-t-shirt/p/itm123
        if (pageUrl != null && pageUrl.getPath() != null) {
            product.categoryHint(pageUrl.getPath().replace('/', ' ').replace('-', ' '));
        }

        GenericStoreParser.applyStructuredData(doc, pageUrl, product);
        return product;
    }
}
