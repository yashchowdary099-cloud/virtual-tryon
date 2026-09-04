package com.sfit.garment;

import java.net.URI;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * Ordered chain of {@link ProductPageParser}s: the first parser that claims the host
 * wins, and {@link GenericStoreParser} always matches last.
 *
 * <p>This is the single extension point for new shopping platforms — write a parser,
 * add it to {@link #SITE_PARSERS}, and both extraction and the
 * {@code GET /api/garment/platforms} listing pick it up.
 */
public final class ParserRegistry {

    private static final List<ProductPageParser> SITE_PARSERS = Collections.unmodifiableList(Arrays.asList(
            (ProductPageParser) new MyntraParser(),
            new FlipkartParser(),
            new AmazonParser(),
            new AjioParser()));

    private static final ProductPageParser FALLBACK = new GenericStoreParser();

    private ParserRegistry() {
    }

    /** Never null: unknown hosts get the structured-data parser. */
    public static ProductPageParser parserFor(URI url) {
        for (ProductPageParser parser : SITE_PARSERS) {
            if (parser.supports(url)) {
                return parser;
            }
        }
        return FALLBACK;
    }

    /** True when a dedicated parser exists, i.e. extraction is expected to be high quality. */
    public static boolean hasDedicatedParser(URI url) {
        for (ProductPageParser parser : SITE_PARSERS) {
            if (parser.supports(url)) {
                return true;
            }
        }
        return false;
    }

    /** Site parsers followed by the generic catch-all, for the platforms endpoint. */
    public static List<ProductPageParser> all() {
        List<ProductPageParser> out = new ArrayList<ProductPageParser>(SITE_PARSERS);
        out.add(FALLBACK);
        return out;
    }
}
