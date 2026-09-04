package com.sfit.garment;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.charset.StandardCharsets;

/** Loads the trimmed product-page fixtures in {@code src/test/resources/fixtures}. */
final class Fixtures {

    private Fixtures() {
    }

    static String load(String name) {
        try (InputStream in = Fixtures.class.getResourceAsStream("/fixtures/" + name)) {
            if (in == null) {
                throw new IllegalStateException("Missing fixture: " + name);
            }
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException ex) {
            throw new IllegalStateException("Could not read fixture: " + name, ex);
        }
    }

    static URI uri(String value) {
        return URI.create(value);
    }
}
