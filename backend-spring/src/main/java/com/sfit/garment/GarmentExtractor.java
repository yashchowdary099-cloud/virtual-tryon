package com.sfit.garment;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

/**
 * Entry point of the pure-JDK extraction core: HTML in, garment facts out.
 *
 * <p>Composes the whole pipeline — pick a parser for the host, read the page, rank and
 * upgrade the image candidates, then infer the VTON category from every text signal
 * gathered. Contains no Spring, Jackson or HTTP code, so the interesting logic is
 * unit-testable against saved page fixtures.
 */
public final class GarmentExtractor {

    private GarmentExtractor() {
    }

    /** Everything the API and the VTON call need about one garment. */
    public static final class Extraction {
        private String platform = "generic";
        private String platformLabel = "Online store";
        private String name;
        private String brand;
        private String color;
        private String size;
        private String currency;
        private double price;
        private String category = GarmentCategoryDetector.UPPER;
        private String categoryLabel = "upper-body garment";
        private boolean categoryConfident;
        private String sourceUrl;
        private String canonicalUrl;
        private List<String> imageCandidates = new ArrayList<String>();

        public String platform() {
            return platform;
        }

        public String platformLabel() {
            return platformLabel;
        }

        public String name() {
            return name;
        }

        public String brand() {
            return brand;
        }

        public String color() {
            return color;
        }

        public String size() {
            return size;
        }

        public String currency() {
            return currency;
        }

        /** Always numeric (0 when unknown) so downstream cart/GST arithmetic cannot break. */
        public double price() {
            return price;
        }

        public String category() {
            return category;
        }

        public String categoryLabel() {
            return categoryLabel;
        }

        public boolean isCategoryConfident() {
            return categoryConfident;
        }

        public String sourceUrl() {
            return sourceUrl;
        }

        public String canonicalUrl() {
            return canonicalUrl;
        }

        public List<String> imageCandidates() {
            return imageCandidates;
        }

        public boolean hasImage() {
            return !imageCandidates.isEmpty();
        }

        public String primaryImageUrl() {
            return imageCandidates.isEmpty() ? null : imageCandidates.get(0);
        }

        /** Prompt handed to IDM-VTON as {@code garment_des}; short and descriptive. */
        public String garmentDescription() {
            StringBuilder out = new StringBuilder();
            if (color != null) {
                out.append(color).append(' ');
            }
            out.append(name != null ? name : categoryLabel);
            String text = out.toString().replaceAll("\\s+", " ").trim();
            if (text.length() > 140) {
                text = text.substring(0, 140).trim();
            }
            return text;
        }

        /** Display title used by the preview card and stored on the pseudo-product. */
        public String displayName() {
            if (name != null && !name.trim().isEmpty()) {
                return name;
            }
            if (brand != null) {
                return brand + " " + categoryLabel;
            }
            return "Garment from " + platformLabel;
        }
    }

    /**
     * Reads a fetched product page. {@code pageUrl} is the URL the HTML actually came
     * from (post-redirect), which matters because relative image paths resolve against it.
     */
    public static Extraction extract(URI pageUrl, String html) {
        HtmlDoc doc = HtmlDoc.of(html);
        ProductPageParser parser = ParserRegistry.parserFor(pageUrl);
        ParsedProduct parsed = parser.parse(doc, pageUrl);

        Extraction extraction = new Extraction();
        extraction.platform = parsed.platform();
        extraction.platformLabel = parsed.platformLabel();
        extraction.name = parsed.name();
        extraction.brand = parsed.brand();
        extraction.color = parsed.color();
        extraction.size = parsed.size();
        extraction.currency = parsed.currency() == null ? "INR" : parsed.currency();
        extraction.price = parsed.price() == null ? 0d : parsed.price().doubleValue();
        extraction.sourceUrl = pageUrl == null ? parsed.sourceUrl() : pageUrl.toString();
        extraction.canonicalUrl = parsed.canonicalUrl();
        extraction.imageCandidates = ImageUrlEnhancer.rank(parsed.imageCandidates(), pageUrl);

        GarmentCategoryDetector.Detection detection = GarmentCategoryDetector.detect(
                parsed.name(),
                parsed.categoryHints(),
                pathHint(pageUrl),
                parsed.description(),
                parsed.brand());
        extraction.category = detection.category();
        extraction.categoryLabel = detection.label();
        extraction.categoryConfident = detection.isConfident();

        // Fold the full name back into the display name when the brand is separate.
        if (extraction.name == null && parsed.displayName() != null) {
            extraction.name = parsed.displayName();
        }
        return extraction;
    }

    /**
     * Minimal extraction for a link that already points at an image file — the
     * "paste a garment image URL" fallback, where there is no page to parse.
     */
    public static Extraction directImage(URI imageUrl, String suppliedName, String suppliedCategory) {
        Extraction extraction = new Extraction();
        extraction.platform = "direct-image";
        extraction.platformLabel = GenericStoreParser.storeLabel(imageUrl);
        extraction.sourceUrl = imageUrl == null ? null : imageUrl.toString();
        extraction.currency = "INR";
        extraction.imageCandidates = ImageUrlEnhancer.rank(
                java.util.Collections.singletonList(imageUrl == null ? null : imageUrl.toString()), imageUrl);

        String fileHint = imageUrl == null || imageUrl.getPath() == null
                ? null
                : imageUrl.getPath().replace('/', ' ').replace('-', ' ').replace('_', ' ');
        GarmentCategoryDetector.Detection detection =
                GarmentCategoryDetector.detect(suppliedName, suppliedCategory, fileHint);
        extraction.category = GarmentCategoryDetector.sanitize(suppliedCategory, detection.category());
        extraction.categoryLabel = detection.label();
        extraction.categoryConfident = detection.isConfident() || suppliedCategory != null;
        extraction.name = suppliedName != null && !suppliedName.trim().isEmpty()
                ? suppliedName.trim()
                : "Garment image";
        return extraction;
    }

    /** Builds an extraction for a manually uploaded garment file. */
    public static Extraction manualUpload(String suppliedName, String suppliedCategory) {
        Extraction extraction = new Extraction();
        extraction.platform = "manual-upload";
        extraction.platformLabel = "Manual upload";
        extraction.currency = "INR";
        GarmentCategoryDetector.Detection detection =
                GarmentCategoryDetector.detect(suppliedName, suppliedCategory);
        extraction.category = GarmentCategoryDetector.sanitize(suppliedCategory, detection.category());
        extraction.categoryLabel = detection.label();
        extraction.categoryConfident = suppliedCategory != null;
        extraction.name = suppliedName != null && !suppliedName.trim().isEmpty()
                ? suppliedName.trim()
                : "Uploaded garment";
        return extraction;
    }

    private static String pathHint(URI url) {
        if (url == null || url.getPath() == null) {
            return null;
        }
        return url.getPath().replace('/', ' ').replace('-', ' ').replace('_', ' ');
    }
}

