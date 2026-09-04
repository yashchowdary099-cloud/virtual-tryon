package com.sfit.garment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/** Hardening and tolerance tests for the dependency-free JSON reader. */
class MiniJsonTest {

    @Test
    void parsesNestedObjectsAndArrays() {
        Object root = MiniJson.parse("{\"a\":{\"b\":[1,2,{\"c\":\"d\"}]},\"e\":true,\"f\":null}");
        Map<String, Object> map = JsonQuery.asMap(root);
        assertNotNull(map);
        List<Object> list = JsonQuery.asList(JsonQuery.get(JsonQuery.get(map, "a"), "b"));
        assertNotNull(list);
        assertEquals(3, list.size());
        assertEquals("d", JsonQuery.deepText(root, "c"));
        assertEquals(Boolean.TRUE, JsonQuery.get(map, "e"));
        assertNull(JsonQuery.get(map, "f"));
    }

    @Test
    void toleratesJavaScriptObjectLiterals() {
        Object root = MiniJson.parse("{name:'Blue Shirt', price: 1299, tags:['new','sale',], extra: undefined}");
        assertEquals("Blue Shirt", JsonQuery.deepText(root, "name"));
        assertEquals("1299", JsonQuery.deepText(root, "price"));
    }

    @Test
    void returnsNullForMalformedInput() {
        assertNull(MiniJson.parse("{\"a\":"));
        assertNull(MiniJson.parse("not json at all {"));
        assertNull(MiniJson.parse(null));
        assertNull(MiniJson.parse(""));
    }

    @Test
    void rejectsDeeplyNestedInput() {
        StringBuilder bomb = new StringBuilder();
        for (int i = 0; i < 200; i++) {
            bomb.append("[");
        }
        for (int i = 0; i < 200; i++) {
            bomb.append("]");
        }
        assertNull(MiniJson.parse(bomb.toString()));
    }

    @Test
    void decodesUnicodeAndEscapes() {
        Object root = MiniJson.parse("{\"n\":\"Caf\\u00e9 \\\"tee\\\"\\nline\"}");
        assertEquals("Caf\u00e9 \"tee\"\nline", JsonQuery.deepText(root, "n"));
    }

    @Test
    void extractsBalancedJsObjectAfterAnchor() {
        String script = "window.__myx = {\"pdpData\":{\"name\":\"Tee\",\"note\":\"a } brace in a string\"}};"
                + "window.other = {\"x\":1};";
        String block = MiniJson.extractJsObject(script, "__myx =");
        assertNotNull(block);
        assertTrue(block.startsWith("{\"pdpData\""));
        assertTrue(block.endsWith("}}"));
        assertEquals("Tee", JsonQuery.deepText(MiniJson.parse(block), "name"));
    }

    @Test
    void returnsNullWhenAnchorMissingOrUnbalanced() {
        assertNull(MiniJson.extractJsObject("var x = {\"a\":1};", "__myx"));
        assertNull(MiniJson.extractJsObject("window.__myx = {\"a\":1", "__myx"));
        assertNull(MiniJson.extractJsObject(null, "__myx"));
    }

    @Test
    void formatsWholeNumbersWithoutDecimalPoint() {
        assertEquals("649", JsonQuery.text(Double.valueOf(649d)));
        assertEquals("649.5", JsonQuery.text(Double.valueOf(649.5d)));
    }

    @Test
    void findsProductByTypeInsideGraph() {
        String json = "{\"@context\":\"https://schema.org\",\"@graph\":["
                + "{\"@type\":\"WebPage\",\"name\":\"page\"},"
                + "{\"@type\":[\"Product\",\"Thing\"],\"name\":\"Linen Trousers\"}]}";
        Map<String, Object> product = JsonQuery.findByType(MiniJson.parse(json), "Product");
        assertNotNull(product);
        assertEquals("Linen Trousers", JsonQuery.text(JsonQuery.get(product, "name")));
    }

    @Test
    void unwrapsSchemaOrgValueWrappers() {
        Object node = MiniJson.parse("{\"image\":{\"@type\":\"ImageObject\",\"url\":\"https://x/y.jpg\"}}");
        assertEquals("https://x/y.jpg", JsonQuery.deepText(node, "image"));
    }
}
