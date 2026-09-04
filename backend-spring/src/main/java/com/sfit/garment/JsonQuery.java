package com.sfit.garment;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Navigation helpers over the Map/List graphs produced by {@link MiniJson}.
 * Shopping sites nest schema.org data unpredictably, so every lookup here is
 * defensive: wrong shapes yield null rather than an exception.
 */
public final class JsonQuery {

    private static final int MAX_VISITED_NODES = 20000;

    private JsonQuery() {
    }

    @SuppressWarnings("unchecked")
    public static Map<String, Object> asMap(Object value) {
        return (value instanceof Map) ? (Map<String, Object>) value : null;
    }

    @SuppressWarnings("unchecked")
    public static List<Object> asList(Object value) {
        return (value instanceof List) ? (List<Object>) value : null;
    }

    /** Coerces a JSON node to a trimmed string, unwrapping the usual schema.org wrappers. */
    public static String text(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof String) {
            String s = ((String) value).trim();
            return s.isEmpty() ? null : s;
        }
        if (value instanceof Double) {
            double d = ((Double) value).doubleValue();
            return (d == Math.floor(d) && !Double.isInfinite(d))
                    ? String.valueOf((long) d)
                    : String.valueOf(d);
        }
        if (value instanceof Boolean) {
            return value.toString();
        }
        if (value instanceof List) {
            for (Object item : (List<?>) value) {
                String s = text(item);
                if (s != null) {
                    return s;
                }
            }
            return null;
        }
        if (value instanceof Map) {
            Map<String, Object> map = asMap(value);
            String[] wrappers = {"@value", "url", "contentUrl", "name", "value"};
            for (String key : wrappers) {
                String s = text(map.get(key));
                if (s != null) {
                    return s;
                }
            }
        }
        return null;
    }

    /** Case-insensitive shallow lookup. */
    public static Object get(Object node, String key) {
        Map<String, Object> map = asMap(node);
        if (map == null || key == null) {
            return null;
        }
        if (map.containsKey(key)) {
            return map.get(key);
        }
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            if (entry.getKey() != null && entry.getKey().equalsIgnoreCase(key)) {
                return entry.getValue();
            }
        }
        return null;
    }

    /** Depth-first search for the first non-blank text stored under any of {@code keys}. */
    public static String deepText(Object root, String... keys) {
        List<String> found = deepCollect(root, 1, keys);
        return found.isEmpty() ? null : found.get(0);
    }

    /** Depth-first collection of every text value stored under any of {@code keys}. */
    public static List<String> deepCollect(Object root, int limit, String... keys) {
        List<String> out = new ArrayList<String>();
        int[] budget = {MAX_VISITED_NODES};
        walk(root, keys, out, limit, budget);
        return out;
    }

    private static void walk(Object node, String[] keys, List<String> out, int limit, int[] budget) {
        if (node == null || budget[0]-- <= 0 || out.size() >= limit) {
            return;
        }
        Map<String, Object> map = asMap(node);
        if (map != null) {
            for (String key : keys) {
                Object candidate = get(map, key);
                if (candidate instanceof List) {
                    for (Object item : (List<?>) candidate) {
                        String s = text(item);
                        if (s != null && !out.contains(s) && out.size() < limit) {
                            out.add(s);
                        }
                    }
                } else {
                    String s = text(candidate);
                    if (s != null && !out.contains(s) && out.size() < limit) {
                        out.add(s);
                    }
                }
            }
            for (Object child : map.values()) {
                walk(child, keys, out, limit, budget);
            }
            return;
        }
        List<Object> list = asList(node);
        if (list != null) {
            for (Object child : list) {
                walk(child, keys, out, limit, budget);
            }
        }
    }

    /**
     * Finds the first object in the graph whose {@code @type} matches {@code type}
     * (case-insensitive). Handles bare objects, arrays and {@code @graph} wrappers.
     */
    public static Map<String, Object> findByType(Object root, String type) {
        if (root == null || type == null) {
            return null;
        }
        Map<String, Object> map = asMap(root);
        if (map != null) {
            Object declared = get(map, "@type");
            if (typeMatches(declared, type)) {
                return map;
            }
            for (Object child : map.values()) {
                Map<String, Object> hit = findByType(child, type);
                if (hit != null) {
                    return hit;
                }
            }
            return null;
        }
        List<Object> list = asList(root);
        if (list != null) {
            for (Object child : list) {
                Map<String, Object> hit = findByType(child, type);
                if (hit != null) {
                    return hit;
                }
            }
        }
        return null;
    }

    private static boolean typeMatches(Object declared, String type) {
        if (declared instanceof String) {
            return ((String) declared).equalsIgnoreCase(type);
        }
        List<Object> list = asList(declared);
        if (list != null) {
            for (Object item : list) {
                if (item instanceof String && ((String) item).equalsIgnoreCase(type)) {
                    return true;
                }
            }
        }
        return false;
    }
}
