package com.sfit.garment;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Minimal, dependency-free JSON reader used by the garment product-page extractors.
 *
 * <p>Deliberately has no Jackson / Spring imports: the whole {@code com.sfit.garment}
 * package is plain JDK code so the extraction logic can be unit tested in isolation.
 *
 * <p>Input is untrusted (arbitrary shopping-site HTML), so parsing is hardened:
 * nesting depth and input length are capped, and any malformed document simply
 * yields {@code null} instead of throwing.
 */
public final class MiniJson {

    private static final int MAX_DEPTH = 64;
    private static final int MAX_LENGTH = 4 * 1024 * 1024;

    private final String src;
    private int pos;

    private MiniJson(String src) {
        this.src = src;
        this.pos = 0;
    }

    /** Parses JSON into Map / List / String / Double / Boolean / null. Returns null if invalid. */
    public static Object parse(String json) {
        if (json == null || json.isEmpty() || json.length() > MAX_LENGTH) {
            return null;
        }
        try {
            MiniJson parser = new MiniJson(json);
            parser.skipWhitespace();
            Object value = parser.readValue(0);
            return value;
        } catch (RuntimeException ex) {
            return null;
        }
    }

    private Object readValue(int depth) {
        if (depth > MAX_DEPTH) {
            throw new IllegalStateException("json nesting too deep");
        }
        skipWhitespace();
        char c = peek();
        if (c == '{') {
            return readObject(depth);
        }
        if (c == '[') {
            return readArray(depth);
        }
        if (c == '"' || c == '\'') {
            return readString();
        }
        if (src.startsWith("true", pos)) {
            pos += 4;
            return Boolean.TRUE;
        }
        if (src.startsWith("false", pos)) {
            pos += 5;
            return Boolean.FALSE;
        }
        if (src.startsWith("null", pos)) {
            pos += 4;
            return null;
        }
        if (src.startsWith("undefined", pos)) {
            pos += 9;
            return null;
        }
        return readNumber();
    }

    private Map<String, Object> readObject(int depth) {
        Map<String, Object> map = new LinkedHashMap<String, Object>();
        pos++; // consume '{'
        skipWhitespace();
        if (peek() == '}') {
            pos++;
            return map;
        }
        while (true) {
            skipWhitespace();
            String key = (peek() == '"' || peek() == '\'') ? readString() : readBareKey();
            skipWhitespace();
            expect(':');
            Object value = readValue(depth + 1);
            map.put(key, value);
            skipWhitespace();
            char c = peek();
            if (c == ',') {
                pos++;
                skipWhitespace();
                if (peek() == '}') { // tolerate trailing comma
                    pos++;
                    return map;
                }
                continue;
            }
            expect('}');
            return map;
        }
    }

    private List<Object> readArray(int depth) {
        List<Object> list = new ArrayList<Object>();
        pos++; // consume '['
        skipWhitespace();
        if (peek() == ']') {
            pos++;
            return list;
        }
        while (true) {
            list.add(readValue(depth + 1));
            skipWhitespace();
            char c = peek();
            if (c == ',') {
                pos++;
                skipWhitespace();
                if (peek() == ']') { // tolerate trailing comma
                    pos++;
                    return list;
                }
                continue;
            }
            expect(']');
            return list;
        }
    }

    private String readString() {
        char quote = peek();
        pos++;
        StringBuilder out = new StringBuilder();
        while (pos < src.length()) {
            char c = src.charAt(pos++);
            if (c == quote) {
                return out.toString();
            }
            if (c != '\\') {
                out.append(c);
                continue;
            }
            if (pos >= src.length()) {
                break;
            }
            char esc = src.charAt(pos++);
            switch (esc) {
                case 'n': out.append('\n'); break;
                case 't': out.append('\t'); break;
                case 'r': out.append('\r'); break;
                case 'b': out.append('\b'); break;
                case 'f': out.append('\f'); break;
                case 'u':
                    if (pos + 4 <= src.length()) {
                        try {
                            out.append((char) Integer.parseInt(src.substring(pos, pos + 4), 16));
                        } catch (NumberFormatException ignored) {
                            // skip malformed escape
                        }
                        pos += 4;
                    }
                    break;
                default: out.append(esc); break;
            }
        }
        throw new IllegalStateException("unterminated string");
    }

    private String readBareKey() {
        int start = pos;
        while (pos < src.length()) {
            char c = src.charAt(pos);
            if (c == ':' || Character.isWhitespace(c)) {
                break;
            }
            pos++;
        }
        if (start == pos) {
            throw new IllegalStateException("empty key");
        }
        return src.substring(start, pos);
    }

    private Object readNumber() {
        int start = pos;
        while (pos < src.length()) {
            char c = src.charAt(pos);
            if (c == '-' || c == '+' || c == '.' || c == 'e' || c == 'E' || (c >= '0' && c <= '9')) {
                pos++;
            } else {
                break;
            }
        }
        if (start == pos) {
            throw new IllegalStateException("unexpected character at " + pos);
        }
        try {
            return Double.valueOf(src.substring(start, pos));
        } catch (NumberFormatException ex) {
            throw new IllegalStateException("bad number");
        }
    }

    private void skipWhitespace() {
        while (pos < src.length() && Character.isWhitespace(src.charAt(pos))) {
            pos++;
        }
    }

    private char peek() {
        if (pos >= src.length()) {
            throw new IllegalStateException("unexpected end of json");
        }
        return src.charAt(pos);
    }

    private void expect(char expected) {
        if (pos >= src.length() || src.charAt(pos) != expected) {
            throw new IllegalStateException("expected '" + expected + "' at " + pos);
        }
        pos++;
    }

    /**
     * Extracts a balanced {@code { ... }} block that follows {@code anchor} inside a script
     * body, e.g. {@code window.__myx = {...};}. Quote-aware so braces inside strings are
     * not miscounted. Returns null when the anchor is missing or the block is unbalanced.
     */
    public static String extractJsObject(String source, String anchor) {
        if (source == null || anchor == null) {
            return null;
        }
        int anchorAt = source.indexOf(anchor);
        if (anchorAt < 0) {
            return null;
        }
        int start = source.indexOf('{', anchorAt + anchor.length());
        if (start < 0) {
            return null;
        }
        int depth = 0;
        boolean inString = false;
        char quote = '"';
        for (int i = start; i < source.length(); i++) {
            char c = source.charAt(i);
            if (inString) {
                if (c == '\\') {
                    i++;
                } else if (c == quote) {
                    inString = false;
                }
                continue;
            }
            if (c == '"' || c == '\'') {
                inString = true;
                quote = c;
            } else if (c == '{') {
                depth++;
            } else if (c == '}') {
                depth--;
                if (depth == 0) {
                    return source.substring(start, i + 1);
                }
            }
        }
        return null;
    }
}
