package com.sfit.garment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URI;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * CDN URL upgrade and candidate-ranking tests. These matter for output quality: the
 * VTON model sees whatever resolution this class negotiates.
 */
class ImageUrlEnhancerTest {

    @Test
    void upgradesMyntraTransformSegmentAndPlaceholders() {
        String thumb = "https://assets.myntassets.com/dpr_2,q_60,w_210,c_limit,fl_progressive/assets/images/1/a.jpg";
        assertEquals("https://assets.myntassets.com/q_95,w_1080/assets/images/1/a.jpg",
                ImageUrlEnhancer.upgrade(thumb));

        String placeholder = "https://assets.myntassets.com/h_($height),q_($qualityPercentage),w_($width)/v1/a.jpg";
        String upgraded = ImageUrlEnhancer.upgrade(placeholder);
        assertEquals("https://assets.myntassets.com/q_95,w_1080/v1/a.jpg", upgraded);
        assertFalse(upgraded.contains("("));
    }

    @Test
    void upgradesFlipkartSizeAndQuality() {
        String thumb = "https://rukminim1.flixcart.com/image/612/612/xif0q/t-shirt/a/b/c/tee-original-imag.jpeg?q=70";
        assertEquals("https://rukminim1.flixcart.com/image/1664/1664/xif0q/t-shirt/a/b/c/tee-original-imag.jpeg?q=90",
                ImageUrlEnhancer.upgrade(thumb));
    }

    @Test
    void stripsAmazonSizeModifier() {
        assertEquals("https://m.media-amazon.com/images/I/71abc.jpg",
                ImageUrlEnhancer.upgrade("https://m.media-amazon.com/images/I/71abc._AC_UX569_.jpg"));
        assertEquals("https://m.media-amazon.com/images/I/71abc.jpg",
                ImageUrlEnhancer.upgrade("https://m.media-amazon.com/images/I/71abc._AC_UL1500_FMwebp_QL65_.jpg"));
    }

    @Test
    void upgradesAjioRenderSizeAndDropsQuery() {
        assertEquals("https://assets.ajio.com/medias/sys_master/root/a/b/-1117Wx1400H-466-black-MODEL.jpg",
                ImageUrlEnhancer.upgrade(
                        "https://assets.ajio.com/medias/sys_master/root/a/b/-473Wx593H-466-black-MODEL.jpg?rmode=4&width=352"));
    }

    @Test
    void stripsShopifyAndWooCommerceThumbnailSuffixes() {
        assertEquals("https://cdn.shopify.com/s/files/1/0/products/tee.jpg?v=17",
                ImageUrlEnhancer.upgrade("https://cdn.shopify.com/s/files/1/0/products/tee_400x400.jpg?v=17"));
        assertEquals("https://shop.example.com/wp-content/uploads/2024/05/kurta.jpg",
                ImageUrlEnhancer.upgrade("https://shop.example.com/wp-content/uploads/2024/05/kurta-300x300.jpg"));
    }

    @Test
    void absolutizesProtocolRelativeAndRelativeUrls() {
        URI page = URI.create("https://shop.example.com/products/tee");
        assertEquals("https://cdn.example.com/a.jpg",
                ImageUrlEnhancer.absolutize("//cdn.example.com/a.jpg", page));
        assertEquals("https://shop.example.com/img/a.jpg",
                ImageUrlEnhancer.absolutize("/img/a.jpg", page));
        assertEquals("https://shop.example.com/products/a.jpg",
                ImageUrlEnhancer.absolutize("a.jpg", page));
        assertEquals("https://cdn.example.com/a.jpg?w=2&h=3",
                ImageUrlEnhancer.absolutize("https:\\/\\/cdn.example.com\\/a.jpg?w=2\\u0026h=3", page));
    }

    @Test
    void rejectsNonImageAndUnsafeCandidates() {
        assertFalse(ImageUrlEnhancer.looksLikeImage("https://x/logo.svg"));
        assertFalse(ImageUrlEnhancer.looksLikeImage("https://x/spinner.gif"));
        assertFalse(ImageUrlEnhancer.looksLikeImage("https://x/product"));
        assertFalse(ImageUrlEnhancer.looksLikeImage("ftp://x/a.jpg"));
        assertTrue(ImageUrlEnhancer.looksLikeImage("https://x/a.JPEG?v=2"));
        assertTrue(ImageUrlEnhancer.looksLikeImage("https://rukminim1.flixcart.com/image/612/612/x/y"));
        assertNull(ImageUrlEnhancer.absolutize("data:image/png;base64,AAA", null));
    }

    @Test
    void ranksGarmentCdnImagesAboveLogosAndBadges() {
        URI page = URI.create("https://www.flipkart.com/nike-tee/p/itm1");
        List<String> candidates = Arrays.asList(
                "https://static-assets-web.flixcart.com/img/flipkart-plus_8d85f4.png",
                "https://rukminim1.flixcart.com/image/612/612/xif0q/t-shirt/a/tee.jpeg?q=70",
                "https://x/payment-visa.png");
        List<String> ranked = ImageUrlEnhancer.rank(candidates, page);
        assertTrue(ranked.get(0).contains("rukminim1.flixcart.com"));
        assertTrue(ranked.get(0).contains("/image/1664/1664/"));
        assertTrue(ranked.size() >= 1);
    }

    @Test
    void keepsPageOrderForEquallyGoodCandidates() {
        URI page = URI.create("https://www.myntra.com/p/1");
        List<String> ranked = ImageUrlEnhancer.rank(Arrays.asList(
                "https://assets.myntassets.com/q_60,w_210/a/front.jpg",
                "https://assets.myntassets.com/q_60,w_210/a/second.jpg"), page);
        assertEquals(2, ranked.size());
        assertTrue(ranked.get(0).endsWith("front.jpg"));
    }

    @Test
    void picksLargestSrcsetEntry() {
        assertEquals("https://x/large.jpg", GenericStoreParser.largestFromSrcset(
                "https://x/small.jpg 320w, https://x/medium.jpg 640w, https://x/large.jpg 1440w"));
    }

    @Test
    void capsCandidateListSoOnlyPlausiblePrimariesRemain() {
        URI page = URI.create("https://shop.example.com/p/1");
        List<String> many = new java.util.ArrayList<String>();
        for (int i = 0; i < 20; i++) {
            many.add("https://shop.example.com/img/" + i + ".jpg");
        }
        assertEquals(8, ImageUrlEnhancer.rank(many, page).size());
    }
}
