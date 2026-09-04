package com.sfit.garment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

/**
 * Category detection decides which IDM-VTON category the garment is sent as, so a wrong
 * answer here is a visibly wrong try-on. These cases are the ones real product titles
 * make hard: words like "dress" and "denim" appear in garments of every category.
 */
class GarmentCategoryDetectorTest {

    private static String categoryOf(String... hints) {
        return GarmentCategoryDetector.detect(hints).category();
    }

    @Test
    void detectsPlainTops() {
        assertEquals(GarmentCategoryDetector.UPPER, categoryOf("Roadster Men Blue Solid Round Neck T-shirt"));
        assertEquals(GarmentCategoryDetector.UPPER, categoryOf("Symbol Men's Regular Fit Formal Shirt"));
        assertEquals(GarmentCategoryDetector.UPPER, categoryOf("Oversized Cotton Hoodie"));
        assertEquals(GarmentCategoryDetector.UPPER, categoryOf("Women Ribbed Crop Top"));
        assertEquals(GarmentCategoryDetector.UPPER, categoryOf("Short Sleeve Linen Shirt"));
    }

    @Test
    void detectsBottoms() {
        assertEquals(GarmentCategoryDetector.LOWER, categoryOf("Levi's 511 Slim Fit Denim Jeans"));
        assertEquals(GarmentCategoryDetector.LOWER, categoryOf("Linen Blend Wide Leg Trousers"));
        assertEquals(GarmentCategoryDetector.LOWER, categoryOf("Puma Men Track Pants"));
        assertEquals(GarmentCategoryDetector.LOWER, categoryOf("Pleated Midi Skirt"));
        assertEquals(GarmentCategoryDetector.LOWER, categoryOf("High Rise Palazzo"));
    }

    @Test
    void detectsFullBodyOutfits() {
        assertEquals(GarmentCategoryDetector.DRESSES, categoryOf("Printed Maxi Dress"));
        assertEquals(GarmentCategoryDetector.DRESSES, categoryOf("Mitera Red Silk Saree"));
        assertEquals(GarmentCategoryDetector.DRESSES, categoryOf("Anouk Women Pink Anarkali Kurta Set"));
        assertEquals(GarmentCategoryDetector.DRESSES, categoryOf("Denim Jumpsuit"));
        assertEquals(GarmentCategoryDetector.DRESSES, categoryOf("Bridal Lehenga Choli"));
    }

    @Test
    void resolvesTheAmbiguousDressWords() {
        // "dress" appears in all three categories; the multi-word rules must win.
        assertEquals(GarmentCategoryDetector.UPPER, categoryOf("Van Heusen Men White Dress Shirt"));
        assertEquals(GarmentCategoryDetector.LOWER, categoryOf("Van Heusen Men Black Dress Pants"));
        assertEquals(GarmentCategoryDetector.DRESSES, categoryOf("Striped Cotton Shirt Dress"));
    }

    @Test
    void jacketBeatsTheWeakDenimHint() {
        // "denim" hints at jeans but must never outweigh a named upper-body garment.
        assertEquals(GarmentCategoryDetector.UPPER, categoryOf("Levi's Denim Jacket"));
        assertEquals(GarmentCategoryDetector.UPPER, categoryOf("Denim Shirt"));
        assertEquals(GarmentCategoryDetector.LOWER, categoryOf("Denim"));
    }

    @Test
    void usesBreadcrumbAndUrlHintsWhenTheNameIsUseless() {
        assertEquals(GarmentCategoryDetector.UPPER,
                categoryOf("SKU 88213", "Clothing Accessories Men Shirts Formal Shirts"));
        assertEquals(GarmentCategoryDetector.LOWER,
                categoryOf("Style 7712", "Bottomwear", " products linen blend wide leg 7712 "));
        assertEquals(GarmentCategoryDetector.DRESSES,
                categoryOf(null, "Women Dresses", " printed maxi p 466123456 "));
    }

    @Test
    void fallsBackToUpperBodyWithoutClaimingConfidence() {
        GarmentCategoryDetector.Detection blank = GarmentCategoryDetector.detect();
        assertEquals(GarmentCategoryDetector.UPPER, blank.category());
        assertFalse(blank.isConfident());

        GarmentCategoryDetector.Detection nonApparel = GarmentCategoryDetector.detect("Nike Air Max 90 Shoes", "");
        assertEquals(GarmentCategoryDetector.UPPER, nonApparel.category());
        assertFalse(nonApparel.isConfident());

        // A single weak hint decides the category but must not report confidence.
        assertFalse(GarmentCategoryDetector.detect("Denim").isConfident());
        assertTrue(GarmentCategoryDetector.detect("Printed Maxi Dress").isConfident());
    }

    @Test
    void ignoresReviewChromeThatLooksLikeGarmentWords() {
        // "overall rating" must not be read as dungarees ("overalls").
        GarmentCategoryDetector.Detection detection =
                GarmentCategoryDetector.detect("4.2 overall rating from 1,203 ratings");
        assertEquals(GarmentCategoryDetector.UPPER, detection.category());
        assertFalse(detection.isConfident());
    }

    @Test
    void labelsDescribeTheWinningKeyword() {
        assertEquals("dress shirt", GarmentCategoryDetector.detect("Men White Dress Shirt").label());
        assertEquals("kurta set", GarmentCategoryDetector.detect("Pink Anarkali Kurta Set").label());
        assertEquals("track pants", GarmentCategoryDetector.detect("Men Track Pants").label());
    }

    @Test
    void sanitizeAcceptsClientAliasesAndRejectsJunk() {
        assertEquals(GarmentCategoryDetector.UPPER, GarmentCategoryDetector.sanitize("Upper-Body", null));
        assertEquals(GarmentCategoryDetector.UPPER, GarmentCategoryDetector.sanitize("top", null));
        assertEquals(GarmentCategoryDetector.LOWER, GarmentCategoryDetector.sanitize("bottom", null));
        assertEquals(GarmentCategoryDetector.DRESSES, GarmentCategoryDetector.sanitize("full body", null));
        assertEquals(GarmentCategoryDetector.DRESSES, GarmentCategoryDetector.sanitize("dresses", null));
        assertEquals(GarmentCategoryDetector.UPPER,
                GarmentCategoryDetector.sanitize("footwear", GarmentCategoryDetector.UPPER));
        assertEquals(GarmentCategoryDetector.LOWER,
                GarmentCategoryDetector.sanitize(null, GarmentCategoryDetector.LOWER));
    }

    @Test
    void exposesOnlyTheThreeModelCategories() {
        assertEquals(3, GarmentCategoryDetector.supportedCategories().size());
        assertTrue(GarmentCategoryDetector.supportedCategories().contains(GarmentCategoryDetector.DRESSES));
        assertEquals("Upper body", GarmentCategoryDetector.describeCategory(GarmentCategoryDetector.UPPER));
        assertEquals("Lower body", GarmentCategoryDetector.describeCategory(GarmentCategoryDetector.LOWER));
        assertEquals("Full outfit / dress", GarmentCategoryDetector.describeCategory(GarmentCategoryDetector.DRESSES));
        assertEquals("Upper body", GarmentCategoryDetector.describeCategory(null));
    }
}
