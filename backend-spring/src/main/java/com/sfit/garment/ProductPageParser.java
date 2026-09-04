package com.sfit.garment;

import java.net.URI;

/**
 * A per-platform product page reader. Adding support for a new shopping site means
 * writing one of these and registering it in {@link ParserRegistry} — nothing else in
 * the pipeline changes.
 *
 * <p>Implementations must be stateless and side-effect free: they receive the already
 * fetched HTML and only fill in a {@link ParsedProduct}. Fetching, SSRF validation,
 * image normalisation and caching happen elsewhere.
 */
public interface ProductPageParser {

    /** Stable machine id, e.g. {@code "myntra"}. Returned to the client for telemetry/UI. */
    String platform();

    /** Human label shown in the UI, e.g. {@code "Myntra"}. */
    String displayName();

    /** Host patterns this parser claims, for the {@code /api/garment/platforms} listing. */
    String[] hostPatterns();

    /** True when this parser recognises the URL's host. */
    boolean supports(URI url);

    /**
     * Reads whatever product metadata the page exposes. Never throws for a merely
     * unexpected page shape — an empty {@link ParsedProduct} is a valid outcome and
     * lets the generic structured-data pass take over.
     */
    ParsedProduct parse(HtmlDoc doc, URI pageUrl);

    /** Shared host test used by every implementation. */
    static boolean hostMatches(URI url, String... needles) {
        if (url == null || url.getHost() == null) {
            return false;
        }
        String host = url.getHost().toLowerCase(java.util.Locale.ROOT);
        for (String needle : needles) {
            if (needle != null && host.contains(needle)) {
                return true;
            }
        }
        return false;
    }
}
