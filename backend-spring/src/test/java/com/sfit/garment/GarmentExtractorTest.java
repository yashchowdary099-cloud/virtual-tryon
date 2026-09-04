package com.sfit.garment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URI;
import org.junit.jupiter.api.Test;

/**
 * End-to-end tests of the extraction core against saved product-page fixtures — one per
 * supported platform, trimmed to the constructs each parser actually reads.
 *
 * <p>What matters in every case: a full-resolution garment image (not the page's
 * thumbnail), the right VTON category, and a numeric price so the existing cart maths
 * cannot break.
 */
class GarmentExtractorTest {

    @Test
    void extractsMyntraProductFromInlinePdpData() {
        URI page = Fixtures.uri(
                "https://www.myntra.com/tshirts/roadster/roadster-men-blue-solid-round-neck-t-shirt/1723852/buy");
        GarmentExtractor.Extraction result = GarmentExtractor.extract(page, Fixtures.load("myntra-tshirt.html"));

        assertEquals("myntra", result.platform());
        assertEquals("Myntra", result.platformLabel());
        assertEquals("Men Blue Solid Round Neck T-shirt", result.name());
        assertEquals("Roadster", result.brand());
        assertEquals("Blue", result.color());
        assertEquals(649d, result.price(), 0.001d);
        assertEquals("INR", result.currency());
        assertEquals(GarmentCategoryDetector.UPPER, result.category());
        assertTrue(result.isCategoryConfident());

        // The gallery ships size placeholders; the model must receive the 1080px asset.
        String image = result.primaryImageUrl();
        assertNotNull(image);
        assertTrue(image.endsWith("front.jpg"), image);
        assertTrue(image.contains("q_95,w_1080"), image);
        assertFalse(image.contains("("), image);
        assertFalse(image.contains("w_210"), image);
        assertEquals("https://www.myntra.com/tshirts/roadster/roadster-men-blue-solid-round-neck-t-shirt/1723852/buy",
                result.canonicalUrl());
        assertTrue(result.garmentDescription().startsWith("Blue"), result.garmentDescription());
    }

    @Test
    void extractsFlipkartProductWithoutTouchingHashedClassNames() {
        URI page = Fixtures.uri("https://www.flipkart.com/nike-solid-men-round-neck-blue-t-shirt/p/itmabc123");
        GarmentExtractor.Extraction result = GarmentExtractor.extract(page, Fixtures.load("flipkart-tshirt.html"));

        assertEquals("flipkart", result.platform());
        assertEquals("Nike Solid Men Round Neck Blue T-Shirt", result.name());
        assertEquals("Nike", result.brand());
        assertEquals(1295d, result.price(), 0.001d);
        assertEquals(GarmentCategoryDetector.UPPER, result.category());

        String image = result.primaryImageUrl();
        assertNotNull(image);
        assertTrue(image.startsWith("https://rukminim1.flixcart.com/"), image);
        assertTrue(image.contains("/image/1664/1664/"), image);
        assertTrue(image.contains("q=90"), image);
        // The Flipkart Plus badge lives on the same CDN family and must not win.
        assertFalse(image.contains("flipkart-plus"), image);
    }

    @Test
    void extractsAmazonProductFromIdsAndDataAttributes() {
        URI page = Fixtures.uri("https://www.amazon.in/dp/B08XYZ123");
        GarmentExtractor.Extraction result = GarmentExtractor.extract(page, Fixtures.load("amazon-shirt.html"));

        assertEquals("amazon", result.platform());
        assertEquals("Symbol Men's Regular Fit Formal Shirt", result.name());
        assertEquals("Symbol", result.brand());
        assertEquals("Sky Blue", result.color());
        assertEquals(1299d, result.price(), 0.001d);
        assertEquals(GarmentCategoryDetector.UPPER, result.category());

        // Every variant collapses to the unmodified original once the size modifier is gone.
        assertEquals("https://m.media-amazon.com/images/I/71SHIRTabc.jpg", result.primaryImageUrl());
        assertEquals(1, result.imageCandidates().size());
        assertTrue(result.garmentDescription().contains("Shirt"), result.garmentDescription());
    }

    @Test
    void extractsAjioDressFromJsonLd() {
        URI page = Fixtures.uri("https://www.ajio.com/printed-maxi-dress/p/466123456");
        GarmentExtractor.Extraction result = GarmentExtractor.extract(page, Fixtures.load("ajio-dress.html"));

        assertEquals("ajio", result.platform());
        assertEquals("Printed Maxi Dress", result.name());
        assertEquals("AJIO", result.brand());
        assertEquals("Black", result.color());
        assertEquals(1499d, result.price(), 0.001d);
        assertEquals("INR", result.currency());
        assertEquals(GarmentCategoryDetector.DRESSES, result.category());
        assertTrue(result.isCategoryConfident());

        String image = result.primaryImageUrl();
        assertNotNull(image);
        assertTrue(image.contains("-1117Wx1400H-"), image);
        assertFalse(image.contains("473Wx593H"), image);
        assertFalse(image.contains("?"), image);
        // The AJIO logo is an SVG and must never be offered as a garment.
        for (String candidate : result.imageCandidates()) {
            assertFalse(candidate.endsWith(".svg"), candidate);
        }
    }

    @Test
    void extractsUnknownStoreFromSchemaOrgAndOpenGraph() {
        URI page = Fixtures.uri("https://www.thelabellife.com/products/linen-blend-wide-leg-trousers");
        GarmentExtractor.Extraction result = GarmentExtractor.extract(page, Fixtures.load("shopify-trousers.html"));

        assertEquals("generic", result.platform());
        assertEquals("The Label Life", result.platformLabel());
        assertEquals("Linen Blend Wide Leg Trousers", result.name());
        assertEquals("The Label Life", result.brand());
        assertEquals(2499d, result.price(), 0.001d);
        assertEquals(GarmentCategoryDetector.LOWER, result.category());
        assertEquals("https://www.thelabellife.com/products/linen-blend-wide-leg-trousers", result.canonicalUrl());

        String image = result.primaryImageUrl();
        assertNotNull(image);
        assertTrue(image.contains("trousers-front"), image);
        assertFalse(image.contains("600x600"), image);
        // The relative microdata image resolved against the page URL.
        assertTrue(result.imageCandidates().toString().contains("https://www.thelabellife.com/cdn/shop/"),
                result.imageCandidates().toString());
    }

    @Test
    void surfacesAUsableResultWhenThePageHasNoProductData() {
        URI page = Fixtures.uri("https://shop.example.com/products/mystery-item");
        GarmentExtractor.Extraction result =
                GarmentExtractor.extract(page, "<html><head></head><body>nothing here</body></html>");

        assertFalse(result.hasImage());
        assertNull(result.primaryImageUrl());
        assertEquals(0d, result.price(), 0.001d);
        assertEquals("Garment from Example", result.displayName());
        assertEquals(GarmentCategoryDetector.UPPER, result.category());
        assertFalse(result.isCategoryConfident());
    }

    @Test
    void directImageLinkInfersCategoryFromTheFileName() {
        GarmentExtractor.Extraction result = GarmentExtractor.directImage(
                Fixtures.uri("https://cdn.example.com/img/red-maxi-dress-front.jpg"), null, null);

        assertEquals("direct-image", result.platform());
        assertEquals("Garment image", result.name());
        assertEquals(GarmentCategoryDetector.DRESSES, result.category());
        assertEquals("https://cdn.example.com/img/red-maxi-dress-front.jpg", result.primaryImageUrl());
        assertEquals(0d, result.price(), 0.001d);
    }

    @Test
    void explicitCategoryOverridesWhatTheUrlSuggests() {
        GarmentExtractor.Extraction result = GarmentExtractor.directImage(
                Fixtures.uri("https://cdn.example.com/img/red-maxi-dress-front.jpg"), "  My jacket  ", "upper");

        assertEquals("My jacket", result.name());
        assertEquals(GarmentCategoryDetector.UPPER, result.category());
        assertTrue(result.isCategoryConfident());
    }

    @Test
    void manualUploadIsAValidGarmentSource() {
        GarmentExtractor.Extraction inferred = GarmentExtractor.manualUpload("My cotton kurta", null);
        assertEquals("manual-upload", inferred.platform());
        assertEquals("Manual upload", inferred.platformLabel());
        assertEquals("My cotton kurta", inferred.name());
        assertEquals(GarmentCategoryDetector.UPPER, inferred.category());
        assertFalse(inferred.isCategoryConfident());
        assertFalse(inferred.hasImage());

        GarmentExtractor.Extraction chosen = GarmentExtractor.manualUpload(null, "dresses");
        assertEquals("Uploaded garment", chosen.name());
        assertEquals(GarmentCategoryDetector.DRESSES, chosen.category());
        assertTrue(chosen.isCategoryConfident());
    }

    @Test
    void registryRoutesHostsToTheirParserAndFallsBackOtherwise() {
        assertEquals("myntra", ParserRegistry.parserFor(Fixtures.uri("https://www.myntra.com/p/1")).platform());
        assertEquals("flipkart", ParserRegistry.parserFor(Fixtures.uri("https://dl.flipkart.com/s/x")).platform());
        assertEquals("amazon", ParserRegistry.parserFor(Fixtures.uri("https://www.amazon.co.uk/dp/B0")).platform());
        assertEquals("ajio", ParserRegistry.parserFor(Fixtures.uri("https://ajio.com/p/1")).platform());
        assertEquals("generic", ParserRegistry.parserFor(Fixtures.uri("https://shop.example.com/p/1")).platform());
        assertEquals("generic", ParserRegistry.parserFor(null).platform());

        assertTrue(ParserRegistry.hasDedicatedParser(Fixtures.uri("https://www.myntra.com/p/1")));
        assertFalse(ParserRegistry.hasDedicatedParser(Fixtures.uri("https://shop.example.com/p/1")));
        assertEquals(5, ParserRegistry.all().size());
    }
}
