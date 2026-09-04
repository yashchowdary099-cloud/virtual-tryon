package com.sfit.garment;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Maps product text to the three garment categories IDM-VTON accepts
 * ({@code upper_body}, {@code lower_body}, {@code dresses}) and produces a short
 * human label used as the model's {@code garment_des} when no product name exists.
 *
 * <p>Keyword weights resolve the awkward cases: "dress shirt" and "dress pants" score
 * higher as upper/lower than the bare word "dress" scores as a full-body garment, and
 * "shirt dress" scores higher as a dress than "shirt" does as a top.
 */
public final class GarmentCategoryDetector {

    public static final String UPPER = "upper_body";
    public static final String LOWER = "lower_body";
    public static final String DRESSES = "dresses";

    private GarmentCategoryDetector() {
    }

    /** Detected category plus the label and confidence surfaced to the UI. */
    public static final class Detection {
        private final String category;
        private final String label;
        private final boolean confident;

        Detection(String category, String label, boolean confident) {
            this.category = category;
            this.label = label;
            this.confident = confident;
        }

        public String category() {
            return category;
        }

        public String label() {
            return label;
        }

        public boolean isConfident() {
            return confident;
        }
    }

    private static final Map<String, Rule> RULES = buildRules();

    private static final class Rule {
        final String category;
        final String label;
        final int weight;

        Rule(String category, String label, int weight) {
            this.category = category;
            this.label = label;
            this.weight = weight;
        }
    }

    /**
     * Scores every hint (product name, breadcrumb, category field, description, URL path)
     * and returns the winning category. Defaults to {@code upper_body} because tops are the
     * most common try-on and the safest fallback for the model.
     */
    public static Detection detect(String... hints) {
        StringBuilder joined = new StringBuilder();
        if (hints != null) {
            for (String hint : hints) {
                if (hint != null && !hint.trim().isEmpty()) {
                    joined.append(' ').append(hint.toLowerCase(Locale.ROOT));
                }
            }
        }
        String text = joined.toString().replaceAll("[^a-z0-9]+", " ");
        if (text.trim().isEmpty()) {
            return new Detection(UPPER, "upper-body garment", false);
        }

        Map<String, Integer> scores = new LinkedHashMap<String, Integer>();
        Map<String, String> bestLabel = new LinkedHashMap<String, String>();
        Map<String, Integer> bestWeight = new LinkedHashMap<String, Integer>();

        for (Map.Entry<String, Rule> entry : RULES.entrySet()) {
            String keyword = entry.getKey();
            if (!containsWord(text, keyword)) {
                continue;
            }
            Rule rule = entry.getValue();
            Integer current = scores.get(rule.category);
            scores.put(rule.category, Integer.valueOf((current == null ? 0 : current.intValue()) + rule.weight));
            Integer topWeight = bestWeight.get(rule.category);
            if (topWeight == null || rule.weight > topWeight.intValue()) {
                bestWeight.put(rule.category, Integer.valueOf(rule.weight));
                bestLabel.put(rule.category, rule.label);
            }
        }

        if (scores.isEmpty()) {
            return new Detection(UPPER, "upper-body garment", false);
        }

        // Deterministic winner: highest total score, then the most specific single keyword,
        // then upper_body because tops are the most common and safest try-on.
        String winner = UPPER;
        int winningScore = -1;
        int winningWeight = -1;
        for (Map.Entry<String, Integer> entry : scores.entrySet()) {
            String category = entry.getKey();
            int score = entry.getValue().intValue();
            Integer weightBox = bestWeight.get(category);
            int weight = weightBox == null ? 0 : weightBox.intValue();
            boolean better = score > winningScore
                    || (score == winningScore && weight > winningWeight)
                    || (score == winningScore && weight == winningWeight && UPPER.equals(category));
            if (better) {
                winningScore = score;
                winningWeight = weight;
                winner = category;
            }
        }
        String label = bestLabel.get(winner);
        if (label == null) {
            label = defaultLabel(winner);
        }
        return new Detection(winner, label, winningScore >= 4);
    }

    /** Human-readable category name for the preview card. */
    public static String describeCategory(String category) {
        if (LOWER.equals(category)) {
            return "Lower body";
        }
        if (DRESSES.equals(category)) {
            return "Full outfit / dress";
        }
        return "Upper body";
    }

    private static String defaultLabel(String category) {
        if (LOWER.equals(category)) {
            return "lower-body garment";
        }
        if (DRESSES.equals(category)) {
            return "full-length outfit";
        }
        return "upper-body garment";
    }

    /** Matches on whitespace-delimited word boundaries so "tee" never matches "canteen". */
    private static boolean containsWord(String haystack, String needle) {
        String padded = " " + haystack.trim() + " ";
        return padded.contains(" " + needle + " ")
                || padded.contains(" " + needle + "s ")
                || padded.contains(" " + needle + "es ");
    }

    private static Map<String, Rule> buildRules() {
        Map<String, Rule> rules = new LinkedHashMap<String, Rule>();
        // --- disambiguating multi-word keywords first (highest weight) ---
        put(rules, "dress shirt", UPPER, "dress shirt", 9);
        put(rules, "dress pant", LOWER, "dress trousers", 9);
        put(rules, "dress trouser", LOWER, "dress trousers", 9);
        put(rules, "shirt dress", DRESSES, "shirt dress", 9);
        put(rules, "t shirt dress", DRESSES, "t-shirt dress", 9);
        put(rules, "dressing gown", DRESSES, "dressing gown", 9);
        put(rules, "kurta set", DRESSES, "kurta set", 8);
        put(rules, "kurta suit", DRESSES, "kurta suit", 8);
        put(rules, "salwar suit", DRESSES, "salwar suit", 8);
        put(rules, "salwar kameez", DRESSES, "salwar kameez", 8);
        put(rules, "co ord", DRESSES, "co-ord set", 7);
        put(rules, "coord set", DRESSES, "co-ord set", 7);
        put(rules, "track pant", LOWER, "track pants", 7);
        put(rules, "cargo pant", LOWER, "cargo trousers", 7);
        put(rules, "palazzo", LOWER, "palazzo trousers", 7);
        put(rules, "crop top", UPPER, "crop top", 7);
        put(rules, "tank top", UPPER, "tank top", 7);
        put(rules, "polo t shirt", UPPER, "polo shirt", 7);

        // --- full outfits / dresses ---
        addAll(rules, DRESSES, 6, new String[][]{
            {"dress", "dress"}, {"gown", "gown"}, {"frock", "frock"}, {"saree", "saree"},
            {"sari", "saree"}, {"lehenga", "lehenga"}, {"lehanga", "lehenga"},
            {"anarkali", "anarkali suit"}, {"jumpsuit", "jumpsuit"}, {"romper", "romper"},
            {"playsuit", "playsuit"}, {"dungaree", "dungarees"}, {"overalls", "dungarees"},
            {"kaftan", "kaftan"}, {"abaya", "abaya"}, {"sherwani", "sherwani"},
            {"maxi", "maxi dress"}, {"bodycon", "bodycon dress"}, {"kimono", "kimono"},
            {"jumpsuits", "jumpsuit"}, {"nightdress", "night dress"},
        });

        // --- lower body ---
        addAll(rules, LOWER, 6, new String[][]{
            {"jean", "jeans"}, {"trouser", "trousers"}, {"pant", "trousers"},
            {"chino", "chinos"}, {"shorts", "shorts"}, {"skirt", "skirt"}, {"legging", "leggings"},
            {"jogger", "joggers"}, {"culotte", "culottes"}, {"capri", "capris"},
            {"dhoti", "dhoti"}, {"lungi", "lungi"}, {"pyjama", "pyjamas"}, {"pajama", "pyjamas"},
            {"jegging", "jeggings"}, {"churidar", "churidar"}, {"salwar", "salwar"},
            {"bermuda", "bermuda shorts"}, {"tracksuit bottom", "tracksuit bottoms"},
        });

        // --- upper body ---
        addAll(rules, UPPER, 6, new String[][]{
            {"shirt", "shirt"}, {"t shirt", "t-shirt"}, {"tshirt", "t-shirt"}, {"tee", "t-shirt"},
            {"top", "top"}, {"blouse", "blouse"}, {"sweater", "sweater"}, {"pullover", "pullover"},
            {"sweatshirt", "sweatshirt"}, {"hoodie", "hoodie"}, {"jacket", "jacket"},
            {"blazer", "blazer"}, {"coat", "coat"}, {"cardigan", "cardigan"},
            {"waistcoat", "waistcoat"}, {"kurti", "kurti"}, {"kurta", "kurta"},
            {"camisole", "camisole"}, {"tunic", "tunic"}, {"jersey", "jersey"},
            {"polo", "polo shirt"}, {"henley", "henley shirt"}, {"windcheater", "windcheater"},
            {"parka", "parka"}, {"bomber", "bomber jacket"}, {"vest", "vest"},
        });

        // --- weak hints: only decide when nothing stronger matched ---
        put(rules, "denim", LOWER, "jeans", 2);
        put(rules, "sleeve", UPPER, "shirt", 3);
        put(rules, "topwear", UPPER, "top", 3);
        put(rules, "bottomwear", LOWER, "trousers", 3);
        put(rules, "ethnic", DRESSES, "ethnic outfit", 1);
        return rules;
    }

    private static void addAll(Map<String, Rule> rules, String category, int weight, String[][] entries) {
        for (String[] entry : entries) {
            put(rules, entry[0], category, entry[1], weight);
        }
    }

    private static void put(Map<String, Rule> rules, String keyword, String category, String label, int weight) {
        rules.put(keyword, new Rule(category, label, weight));
    }

    /** Every category value the VTON model accepts, for validation of client-supplied overrides. */
    public static List<String> supportedCategories() {
        List<String> out = new ArrayList<String>();
        out.add(UPPER);
        out.add(LOWER);
        out.add(DRESSES);
        return out;
    }

    /** Returns {@code fallback} when the client sends an unknown category string. */
    public static String sanitize(String category, String fallback) {
        if (category == null) {
            return fallback;
        }
        String normalized = category.trim().toLowerCase(Locale.ROOT).replace('-', '_').replace(' ', '_');
        if (UPPER.equals(normalized) || LOWER.equals(normalized) || DRESSES.equals(normalized)) {
            return normalized;
        }
        if ("dress".equals(normalized) || "full_body".equals(normalized) || "full_outfit".equals(normalized)) {
            return DRESSES;
        }
        if ("upper".equals(normalized) || "top".equals(normalized)) {
            return UPPER;
        }
        if ("lower".equals(normalized) || "bottom".equals(normalized)) {
            return LOWER;
        }
        return fallback;
    }
}
