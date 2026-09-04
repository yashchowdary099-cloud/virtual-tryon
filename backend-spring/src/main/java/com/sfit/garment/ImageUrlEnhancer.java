package com.sfit.garment;

import java.net.URI;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

/**
 * Turns the raw image references found on a product page into the single best
 * garment image URL for the VTON model.
 *
 * <p>Two jobs. First, <em>upgrade</em>: shopping CDNs encode the requested
 * resolution in the URL, and pages ship thumbnails, so the same asset can usually
 * be re-requested at full size by rewriting the URL (Myntra transform segments,
 * Flipkart {@code /image/612/612/}, Amazon {@code ._AC_UL320_.} modifiers, AJIO
 * {@code -473Wx593H-}, Shopify {@code _400x400}). Higher input resolution is what
 * keeps try-on output quality unchanged.
 *
 * <p>Second, <em>rank</em>: pages also contain logos, payment badges, swatches and
 * sprites. Candidates are scored and the losers are pushed down rather than deleted,
 * so a page that only exposes odd URLs still yields something.
 */
public final class ImageUrlEnhancer {

    private static final List<String> IMAGE_HOSTS = Collections.unmodifiableList(Arrays.asList(
            "myntassets.com", "flixcart.com", "media-amazon.com", "images-amazon.com", "ssl-images-amazon.com",
            "assets.ajio.com", "cdn.shopify.com", "shopifycdn.com", "images.meesho.com", "nnnow.com",
            "tatacliq.com", "img.tatacliq.com", "westside.com", "cloudfront.net", "akamaized.net", "scene7.com"));

    private static final List<String> NEGATIVE_TOKENS = Collections.unmodifiableList(Arrays.asList(
            "sprite", "logo", "icon", "favicon", "placeholder", "swatch", "loader", "spinner",
            "banner", "payment", "visa", "mastercard", "rupay", "upi", "paytm", "app-store", "appstore",
            "playstore", "google-play", "avatar", "profile", "rating", "star", "arrow", "chevron",
            "assured", "plus-badge", "gift", "coupon", "offer-", "advert", "pixel", "tracking",
            "blank", "default", "no-image", "noimage", "1x1", "transparent",
            "static-assets", "/static/", "flipkart-plus"));

    private static final List<String> SECONDARY_TOKENS = Collections.unmodifiableList(Arrays.asList(
            "-back", "_back", "back-", "-side", "_side", "detail", "zoom", "closeup", "close-up", "swatches"));

    private ImageUrlEnhancer() {
    }

    /**
     * Cleans, absolutises and upgrades every candidate, drops what cannot be an image,
     * and returns the best-first list (capped, because only the top hit is fetched).
     */
    public static List<String> rank(List<String> candidates, URI pageUrl) {
        List<String> prepared = new ArrayList<String>();
        if (candidates != null) {
            for (String candidate : candidates) {
                String absolute = absolutize(candidate, pageUrl);
                if (absolute == null) {
                    continue;
                }
                String upgraded = upgrade(absolute);
                if (looksLikeImage(upgraded) && !prepared.contains(upgraded)) {
                    prepared.add(upgraded);
                }
            }
        }
        final List<String> original = new ArrayList<String>(prepared);
        Collections.sort(prepared, new Comparator<String>() {
            @Override
            public int compare(String left, String right) {
                int delta = score(right) - score(left);
                if (delta != 0) {
                    return delta;
                }
                return original.indexOf(left) - original.indexOf(right); // keep page order on ties
            }
        });
        return prepared.size() > 8 ? new ArrayList<String>(prepared.subList(0, 8)) : prepared;
    }

    /** Resolves protocol-relative, root-relative and JSON-escaped URLs against the page. */
    public static String absolutize(String candidate, URI pageUrl) {
        if (candidate == null) {
            return null;
        }
        String value = candidate.trim();
        if (value.isEmpty()) {
            return null;
        }
        value = value.replace("\\/", "/").replace("\\u002F", "/").replace("\\u0026", "&");
        value = HtmlDoc.decodeEntities(value).trim();
        if (value.startsWith("\"") || value.startsWith("'")) {
            value = value.substring(1);
        }
        if (value.endsWith("\"") || value.endsWith("'")) {
            value = value.substring(0, value.length() - 1);
        }
        if (value.isEmpty() || value.startsWith("data:") || value.startsWith("blob:")
                || value.startsWith("javascript:") || value.length() > 2048) {
            return null;
        }
        try {
            if (value.startsWith("//")) {
                String scheme = pageUrl == null || pageUrl.getScheme() == null ? "https" : pageUrl.getScheme();
                return scheme + ":" + value;
            }
            if (value.startsWith("http://") || value.startsWith("https://")) {
                return value;
            }
            if (pageUrl == null) {
                return null;
            }
            return pageUrl.resolve(value).toString();
        } catch (RuntimeException ex) {
            return null;
        }
    }

    /** True for anything that plausibly resolves to a raster image. */
    public static boolean looksLikeImage(String url) {
        if (url == null) {
            return false;
        }
        String lower = url.toLowerCase(Locale.ROOT);
        if (!lower.startsWith("http://") && !lower.startsWith("https://")) {
            return false;
        }
        String path = lower;
        int query = path.indexOf('?');
        if (query > 0) {
            path = path.substring(0, query);
        }
        if (path.matches(".*\\.(jpe?g|png|webp|avif|bmp|jfif)$")) {
            return true;
        }
        if (path.endsWith(".svg") || path.endsWith(".gif") || path.endsWith(".ico")) {
            return false;
        }
        for (String host : IMAGE_HOSTS) {
            if (lower.contains(host)) {
                return true; // CDNs often omit the extension entirely
            }
        }
        return lower.contains("/image") || lower.contains("format=jpg") || lower.contains("format=jpeg");
    }

    /** Heuristic desirability score; higher is a more likely primary garment shot. */
    public static int score(String url) {
        if (url == null) {
            return Integer.MIN_VALUE;
        }
        String lower = url.toLowerCase(Locale.ROOT);
        int score = 100;
        for (String host : IMAGE_HOSTS) {
            if (lower.contains(host)) {
                score += 40;
                break;
            }
        }
        for (String token : NEGATIVE_TOKENS) {
            if (lower.contains(token)) {
                score -= 70;
            }
        }
        for (String token : SECONDARY_TOKENS) {
            if (lower.contains(token)) {
                score -= 15;
            }
        }
        score += Math.min(60, largestDeclaredDimension(lower) / 40);
        if (lower.matches(".*\\.(jpe?g|png|webp)(\\?.*)?$")) {
            score += 10;
        }
        return score;
    }

    /** Largest dimension declared anywhere in the URL, used as a resolution proxy. */
    private static int largestDeclaredDimension(String lower) {
        int best = 0;
        java.util.regex.Matcher matcher =
                java.util.regex.Pattern.compile("(\\d{2,4})\\s*[x_]\\s*(\\d{2,4})").matcher(lower);
        while (matcher.find()) {
            best = Math.max(best, Math.max(parse(matcher.group(1)), parse(matcher.group(2))));
        }
        matcher = java.util.regex.Pattern.compile("(?:w|width|h|height)[_=](\\d{2,4})").matcher(lower);
        while (matcher.find()) {
            best = Math.max(best, parse(matcher.group(1)));
        }
        // Flipkart-style path dimensions: /image/1664/1664/
        matcher = java.util.regex.Pattern.compile("/(\\d{3,4})/(\\d{3,4})/").matcher(lower);
        while (matcher.find()) {
            best = Math.max(best, Math.max(parse(matcher.group(1)), parse(matcher.group(2))));
        }
        // AJIO-style render dimensions: -1117Wx1400H-
        matcher = java.util.regex.Pattern.compile("(\\d{2,4})w\\s*[x*]\\s*(\\d{2,4})h").matcher(lower);
        while (matcher.find()) {
            best = Math.max(best, Math.max(parse(matcher.group(1)), parse(matcher.group(2))));
        }
        return best;
    }

    private static int parse(String value) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException ex) {
            return 0;
        }
    }

    /** Rewrites a CDN URL to request the highest resolution that CDN will serve. */
    public static String upgrade(String url) {
        if (url == null) {
            return null;
        }
        String lower = url.toLowerCase(Locale.ROOT);
        if (lower.contains("myntassets.com")) {
            return upgradeMyntra(url);
        }
        if (lower.contains("flixcart.com")) {
            return upgradeFlipkart(url);
        }
        if (lower.contains("media-amazon.com") || lower.contains("images-amazon.com")
                || lower.contains("ssl-images-amazon.com")) {
            return upgradeAmazon(url);
        }
        if (lower.contains("assets.ajio.com")) {
            return upgradeAjio(url);
        }
        if (lower.contains("cdn.shopify.com") || lower.contains("shopifycdn.com")) {
            return upgradeShopify(url);
        }
        return upgradeGeneric(url);
    }

    /** Myntra: {@code /dpr_2,q_60,w_210,c_limit/...} → {@code /q_95,w_1080/...}. */
    private static String upgradeMyntra(String url) {
        String out = url.replace("($height)", "1440")
                .replace("($width)", "1080")
                .replace("($qualityPercentage)", "95")
                .replace("(qualityPercentage)", "95");
        String[] parts = out.split("/", -1);
        for (int i = 0; i < parts.length; i++) {
            if (isMyntraTransform(parts[i])) {
                parts[i] = "q_95,w_1080";
                break;
            }
        }
        return String.join("/", parts);
    }

    private static boolean isMyntraTransform(String segment) {
        if (segment == null || segment.isEmpty() || segment.indexOf('.') >= 0) {
            return false;
        }
        if (!segment.matches("(?i)^(dpr|w|h|q|c|fl|e|f|t|b|ar)_[A-Za-z0-9_,.]*$")) {
            return false;
        }
        return segment.contains(",") || segment.matches("(?i)^(dpr|w|h|q)_[0-9]+$");
    }

    /** Flipkart: {@code /image/612/612/} → {@code /image/1664/1664/}, and q=70 → q=90. */
    private static String upgradeFlipkart(String url) {
        String out = url.replaceAll("(?i)/image/\\d{2,4}/\\d{2,4}/", "/image/1664/1664/");
        return out.replaceAll("(?i)([?&])q=\\d{1,3}", "$1q=90");
    }

    /** Amazon: strips the {@code ._AC_UL320_FMwebp_.} size/format modifier to get the original. */
    private static String upgradeAmazon(String url) {
        return url.replaceAll("\\._[A-Za-z0-9_,\\-]*_\\.", ".");
    }

    /** AJIO: {@code -473Wx593H-} → {@code -1117Wx1400H-}, and drops resize query params. */
    private static String upgradeAjio(String url) {
        String out = url.replaceAll("(?i)-\\d{2,4}Wx\\d{2,4}H-", "-1117Wx1400H-");
        int query = out.indexOf('?');
        return query > 0 ? out.substring(0, query) : out;
    }

    /** Shopify: strips the {@code _400x400} / {@code _400x} filename suffix. */
    private static String upgradeShopify(String url) {
        String out = url.replaceAll("(?i)_(\\d{2,4})x(\\d{2,4})?(@2x)?(?=\\.(jpe?g|png|webp))", "");
        return out.replaceAll("(?i)([?&])width=\\d{2,4}", "$1width=1200");
    }

    /**
     * WooCommerce/WordPress {@code -300x300}, theme-generated {@code _600x600} (Shopify
     * storefronts served from a custom domain) and common {@code ?width=} resizers.
     */
    private static String upgradeGeneric(String url) {
        String out = url.replaceAll("(?i)[-_](\\d{2,4})x(\\d{2,4})(@2x)?(?=\\.(jpe?g|png|webp))", "");
        return out.replaceAll("(?i)([?&])(w|width|imwidth|sw)=\\d{2,4}", "$1$2=1200");
    }
}



