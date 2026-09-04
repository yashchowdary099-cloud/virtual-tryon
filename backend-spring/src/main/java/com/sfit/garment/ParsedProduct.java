package com.sfit.garment;

import java.util.ArrayList;
import java.util.List;

/**
 * Plain result of parsing a shopping product page. Deliberately a mutable POJO with a
 * fluent builder and no framework annotations so the parsers stay unit-testable on a
 * bare JDK; the Spring layer maps this onto a response DTO.
 */
public final class ParsedProduct {

    private String platform = "generic";
    private String platformLabel = "Online store";
    private String name;
    private String brand;
    private String description;
    private String color;
    private String size;
    private Double price;
    private String currency;
    private String sourceUrl;
    private String canonicalUrl;
    private final List<String> imageCandidates = new ArrayList<String>();
    private final StringBuilder categoryHints = new StringBuilder();

    public static ParsedProduct create() {
        return new ParsedProduct();
    }

    public ParsedProduct platform(String platform, String platformLabel) {
        if (platform != null && !platform.trim().isEmpty()) {
            this.platform = platform.trim();
        }
        if (platformLabel != null && !platformLabel.trim().isEmpty()) {
            this.platformLabel = platformLabel.trim();
        }
        return this;
    }

    public ParsedProduct name(String value) {
        if (isBlank(this.name)) {
            this.name = clean(value);
        }
        return this;
    }

    public ParsedProduct brand(String value) {
        if (isBlank(this.brand)) {
            this.brand = clean(value);
        }
        return this;
    }

    public ParsedProduct description(String value) {
        if (isBlank(this.description)) {
            this.description = clean(value);
        }
        return this;
    }

    public ParsedProduct color(String value) {
        if (isBlank(this.color)) {
            this.color = clean(value);
        }
        return this;
    }

    public ParsedProduct size(String value) {
        if (isBlank(this.size)) {
            this.size = clean(value);
        }
        return this;
    }

    /** Accepts messy price text such as {@code "Rs. 1,299.00"} or {@code "₹1299"}. */
    public ParsedProduct price(String rawPrice) {
        if (this.price != null || rawPrice == null) {
            return this;
        }
        String digits = rawPrice.replaceAll("[^0-9.,]", "").trim();
        if (digits.isEmpty()) {
            return this;
        }
        // Indian formatting uses commas as thousand separators only.
        digits = digits.replace(",", "");
        int firstDot = digits.indexOf('.');
        if (firstDot >= 0) {
            String head = digits.substring(0, firstDot);
            String tail = digits.substring(firstDot + 1).replace(".", "");
            digits = head + "." + tail;
        }
        try {
            double parsed = Double.parseDouble(digits);
            if (parsed > 0 && parsed < 10_000_000d) {
                this.price = Double.valueOf(parsed);
            }
        } catch (NumberFormatException ignored) {
            // leave price null; callers coerce to 0 so cart maths never breaks
        }
        return this;
    }

    public ParsedProduct currency(String value) {
        if (isBlank(this.currency)) {
            String cleaned = clean(value);
            if (cleaned != null) {
                this.currency = cleaned.length() > 8 ? cleaned.substring(0, 8) : cleaned;
            }
        }
        return this;
    }

    public ParsedProduct sourceUrl(String value) {
        this.sourceUrl = clean(value);
        return this;
    }

    public ParsedProduct canonicalUrl(String value) {
        if (isBlank(this.canonicalUrl)) {
            this.canonicalUrl = clean(value);
        }
        return this;
    }

    /** Adds an image candidate in preference order, ignoring blanks and duplicates. */
    public ParsedProduct addImage(String url) {
        String cleaned = clean(url);
        if (cleaned != null && !imageCandidates.contains(cleaned) && imageCandidates.size() < 40) {
            imageCandidates.add(cleaned);
        }
        return this;
    }

    public ParsedProduct addImages(List<String> urls) {
        if (urls != null) {
            for (String url : urls) {
                addImage(url);
            }
        }
        return this;
    }

    /**
     * Accumulates taxonomy signals (breadcrumbs, article type, URL path) for
     * {@link GarmentCategoryDetector}. Unlike the other setters this one appends, since
     * more hints make detection better, and it never surfaces in the UI.
     */
    public ParsedProduct categoryHint(String value) {
        String cleaned = clean(value);
        if (cleaned != null && categoryHints.length() < 600) {
            categoryHints.append(' ').append(cleaned);
        }
        return this;
    }

    public String categoryHints() {
        return categoryHints.toString().trim();
    }

    public boolean hasImage() {
        return !imageCandidates.isEmpty();
    }

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

    public String description() {
        return description;
    }

    public String color() {
        return color;
    }

    public String size() {
        return size;
    }

    public Double price() {
        return price;
    }

    public String currency() {
        return currency;
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

    /** Best display name: falls back to the brand, then a neutral label. */
    public String displayName() {
        if (!isBlank(name)) {
            return isBlank(brand) || name.toLowerCase().contains(brand.toLowerCase())
                    ? name
                    : brand + " " + name;
        }
        return isBlank(brand) ? "Garment from " + platformLabel : brand + " garment";
    }

    private static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private static String clean(String value) {
        if (value == null) {
            return null;
        }
        String out = HtmlDoc.decodeEntities(value).replaceAll("\\s+", " ").trim();
        if (out.isEmpty()) {
            return null;
        }
        return out.length() > 400 ? out.substring(0, 400).trim() : out;
    }
}
