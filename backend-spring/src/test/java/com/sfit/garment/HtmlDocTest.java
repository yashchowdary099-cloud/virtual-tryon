package com.sfit.garment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import org.junit.jupiter.api.Test;

/** Scanner tests for the constructs product pages actually use. */
class HtmlDocTest {

    @Test
    void readsMetaByPropertyNameAndItemprop() {
        HtmlDoc doc = HtmlDoc.of("<meta property=\"og:image\" content=\"https://x/a.jpg\">"
                + "<meta content=\"Blue Tee\" name=\"twitter:title\">"
                + "<meta itemprop=\"price\" content=\"1299\">");
        assertEquals("https://x/a.jpg", doc.meta("og:image"));
        assertEquals("Blue Tee", doc.meta("twitter:title"));
        assertEquals("1299", doc.meta("price"));
        assertNull(doc.meta("og:video"));
    }

    @Test
    void metaAnyReturnsFirstNonBlankKey() {
        HtmlDoc doc = HtmlDoc.of("<meta property=\"og:image\" content=\"   \">"
                + "<meta property=\"twitter:image\" content=\"https://x/b.jpg\">");
        assertEquals("https://x/b.jpg", doc.metaAny("og:image", "twitter:image"));
    }

    @Test
    void decodesEntitiesIncludingRupee() {
        assertEquals("Men's \"Blue\" & Grey", HtmlDoc.decodeEntities("Men&#39;s &quot;Blue&quot; &amp; Grey"));
        assertEquals(String.valueOf((char) 0x20B9) + "1,299", HtmlDoc.decodeEntities("&#8377;1,299"));
        assertEquals("a b", HtmlDoc.decodeEntities("a&nbsp;b"));
    }

    @Test
    void readsTitleAndCanonical() {
        HtmlDoc doc = HtmlDoc.of("<html><head><title>Roadster Tee\n  | Myntra</title>"
                + "<link rel=\"canonical\" href=\"https://www.myntra.com/p/1\"/></head></html>");
        assertEquals("Roadster Tee | Myntra", doc.title());
        assertEquals("https://www.myntra.com/p/1", doc.canonicalUrl());
    }

    @Test
    void collectsEveryJsonLdBlock() {
        HtmlDoc doc = HtmlDoc.of("<script type=\"application/ld+json\">{\"a\":1}</script>"
                + "<script type='application/ld+json'>{\"b\":2}</script>"
                + "<script type=\"text/javascript\">{\"c\":3}</script>");
        List<String> blocks = doc.jsonLdBlocks();
        assertEquals(2, blocks.size());
        assertTrue(blocks.get(0).contains("\"a\""));
        assertTrue(blocks.get(1).contains("\"b\""));
    }

    @Test
    void findsDataAttributesAndElementText() {
        HtmlDoc doc = HtmlDoc.of("<img data-old-hires=\"https://x/hires.jpg\" src=\"https://x/small.jpg\">"
                + "<span id=\"productTitle\">  Symbol Men's <b>Formal</b> Shirt  </span>");
        assertEquals("https://x/hires.jpg", doc.findAttribute("data-old-hires"));
        assertEquals("Symbol Men's Formal Shirt", doc.textOfElementWithId("productTitle"));
        assertNull(doc.textOfElementWithId("missingId"));
    }

    @Test
    void allMatchesDeduplicatesAndRespectsLimit() {
        HtmlDoc doc = HtmlDoc.of("<img src=\"https://x/1.jpg\"><img src=\"https://x/1.jpg\">"
                + "<img src=\"https://x/2.jpg\"><img src=\"https://x/3.jpg\">");
        List<String> found = doc.allMatches("<img\\b[^>]*\\bsrc\\s*=\\s*[\"']([^\"']+)[\"']", 2);
        assertEquals(2, found.size());
        assertEquals("https://x/1.jpg", found.get(0));
        assertEquals("https://x/2.jpg", found.get(1));
    }

    @Test
    void emptyDocumentIsSafe() {
        HtmlDoc doc = HtmlDoc.of(null);
        assertEquals("", doc.raw());
        assertNull(doc.title());
        assertNull(doc.meta("og:image"));
        assertTrue(doc.jsonLdBlocks().isEmpty());
    }
}
