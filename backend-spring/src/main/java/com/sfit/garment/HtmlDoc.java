package com.sfit.garment;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Tiny read-only HTML scanner for product pages (meta tags, title, JSON-LD blocks,
 * inline script blobs, tag attributes). Regex based on purpose: no HTML parsing
 * dependency is added to the project, and product metadata lives in flat, highly
 * regular constructs that regex handles reliably.
 */
public final class HtmlDoc {

    private static final Pattern META_TAG =
            Pattern.compile("<meta\\b[^>]*>", Pattern.CASE_INSENSITIVE);
    private static final Pattern ATTRIBUTE =
            Pattern.compile("([a-zA-Z_:][-a-zA-Z0-9_:.]*)\\s*=\\s*(\"([^\"]*)\"|'([^']*)')");
    private static final Pattern TITLE_TAG =
            Pattern.compile("<title[^>]*>(.*?)</title>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    private static final Pattern JSON_LD =
            Pattern.compile("<script[^>]*type\\s*=\\s*[\"']application/ld\\+json[\"'][^>]*>(.*?)</script>",
                    Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    private static final Pattern CANONICAL =
            Pattern.compile("<link\\b[^>]*rel\\s*=\\s*[\"']canonical[\"'][^>]*>", Pattern.CASE_INSENSITIVE);

    private final String html;

    private HtmlDoc(String html) {
        this.html = html == null ? "" : html;
    }

    public static HtmlDoc of(String html) {
        return new HtmlDoc(html);
    }

    public String raw() {
        return html;
    }

    /**
     * Reads a meta tag value by {@code property}, {@code name} or {@code itemprop}
     * (e.g. {@code og:image}, {@code twitter:image}, {@code product:price:amount}).
     */
    public String meta(String key) {
        if (key == null || key.isEmpty()) {
            return null;
        }
        Matcher tags = META_TAG.matcher(html);
        while (tags.find()) {
            String tag = tags.group();
            String property = attributeOf(tag, "property");
            String name = attributeOf(tag, "name");
            String itemprop = attributeOf(tag, "itemprop");
            boolean match = key.equalsIgnoreCase(property)
                    || key.equalsIgnoreCase(name)
                    || key.equalsIgnoreCase(itemprop);
            if (match) {
                String content = attributeOf(tag, "content");
                if (content != null && !content.trim().isEmpty()) {
                    return decodeEntities(content.trim());
                }
            }
        }
        return null;
    }

    /** Returns the first non-blank meta value among {@code keys}, in order. */
    public String metaAny(String... keys) {
        for (String key : keys) {
            String value = meta(key);
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    public String title() {
        Matcher matcher = TITLE_TAG.matcher(html);
        if (matcher.find()) {
            String value = decodeEntities(matcher.group(1)).replaceAll("\\s+", " ").trim();
            return value.isEmpty() ? null : value;
        }
        return null;
    }

    public String canonicalUrl() {
        Matcher matcher = CANONICAL.matcher(html);
        if (matcher.find()) {
            String href = attributeOf(matcher.group(), "href");
            return href == null ? null : decodeEntities(href.trim());
        }
        return null;
    }

    /** Every {@code <script type="application/ld+json">} payload on the page. */
    public List<String> jsonLdBlocks() {
        List<String> blocks = new ArrayList<String>();
        Matcher matcher = JSON_LD.matcher(html);
        while (matcher.find()) {
            String body = matcher.group(1);
            if (body != null && !body.trim().isEmpty()) {
                blocks.add(decodeEntities(body.trim()));
            }
        }
        return blocks;
    }

    /** Value of {@code attribute} on the first tag that carries it. */
    public String findAttribute(String attribute) {
        Pattern pattern = Pattern.compile(
                Pattern.quote(attribute) + "\\s*=\\s*(\"([^\"]*)\"|'([^']*)')",
                Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(html);
        if (matcher.find()) {
            String value = matcher.group(2) != null ? matcher.group(2) : matcher.group(3);
            return value == null ? null : decodeEntities(value);
        }
        return null;
    }

    /** Inner text of the first element carrying {@code id}, tags stripped. */
    public String textOfElementWithId(String id) {
        Pattern pattern = Pattern.compile(
                "<([a-zA-Z0-9]+)\\b[^>]*id\\s*=\\s*[\"']" + Pattern.quote(id) + "[\"'][^>]*>(.*?)</\\1>",
                Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
        Matcher matcher = pattern.matcher(html);
        if (matcher.find()) {
            String stripped = matcher.group(2).replaceAll("<[^>]*>", " ");
            stripped = decodeEntities(stripped).replaceAll("\\s+", " ").trim();
            return stripped.isEmpty() ? null : stripped;
        }
        return null;
    }

    /** First regex capture group 1 match against the raw document, or null. */
    public String firstMatch(String regex) {
        Matcher matcher = Pattern.compile(regex, Pattern.CASE_INSENSITIVE | Pattern.DOTALL).matcher(html);
        return matcher.find() ? matcher.group(1) : null;
    }

    /** All group-1 matches against the raw document, in document order, de-duplicated. */
    public List<String> allMatches(String regex, int limit) {
        List<String> out = new ArrayList<String>();
        Matcher matcher = Pattern.compile(regex, Pattern.CASE_INSENSITIVE | Pattern.DOTALL).matcher(html);
        while (matcher.find() && out.size() < limit) {
            String value = matcher.group(1);
            if (value != null && !value.trim().isEmpty() && !out.contains(value)) {
                out.add(value.trim());
            }
        }
        return out;
    }

    private static String attributeOf(String tag, String attribute) {
        Matcher matcher = ATTRIBUTE.matcher(tag);
        while (matcher.find()) {
            if (attribute.equalsIgnoreCase(matcher.group(1))) {
                return matcher.group(3) != null ? matcher.group(3) : matcher.group(4);
            }
        }
        return null;
    }

    /** Decodes the handful of entities that actually show up in product metadata. */
    public static String decodeEntities(String input) {
        if (input == null || input.indexOf('&') < 0) {
            return input;
        }
        String out = input;
        out = out.replace("&quot;", "\"").replace("&#34;", "\"");
        out = out.replace("&apos;", "'").replace("&#39;", "'").replace("&#x27;", "'");
        out = out.replace("&nbsp;", " ").replace("&#160;", " ");
        out = out.replace("&lt;", "<").replace("&gt;", ">");
        out = out.replace("&#8377;", "\u20B9").replace("&rupee;", "\u20B9");
        out = out.replace("&amp;", "&");
        return out;
    }
}
