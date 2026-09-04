package com.sfit.garment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Arrays;
import org.junit.jupiter.api.Test;

/**
 * SSRF guard tests. Deliberately built from literal IPs and reserved hostnames so they
 * never depend on external DNS, and use {@code allowPrivateHosts(true)} for the
 * happy-path cases that would otherwise need a live lookup.
 */
class UrlSafetyTest {

    private static UrlSafety.Policy offlinePolicy() {
        return new UrlSafety.Policy().allowPrivateHosts(true);
    }

    @Test
    void rejectsNonHttpSchemes() {
        for (String url : Arrays.asList("file:///etc/passwd", "ftp://example.com/x",
                "gopher://example.com", "javascript:alert(1)", "data:text/html,<b>x</b>")) {
            UrlSafety.Result result = UrlSafety.check(url, new UrlSafety.Policy());
            assertFalse(result.isAllowed(), "should reject " + url);
            assertNotNull(result.reason());
        }
    }

    @Test
    void rejectsEmbeddedCredentials() {
        UrlSafety.Result result = UrlSafety.check("https://user:secret@myntra.com/p/1", offlinePolicy());
        assertFalse(result.isAllowed());
        assertTrue(result.reason().toLowerCase().contains("credential"));
    }

    @Test
    void rejectsNonStandardPorts() {
        UrlSafety.Result result = UrlSafety.check("http://example.com:8080/admin", new UrlSafety.Policy());
        assertFalse(result.isAllowed());
        assertTrue(result.reason().contains("80/443"));
    }

    @Test
    void rejectsLocalAndInternalHostnames() {
        for (String url : Arrays.asList("http://localhost/", "http://api.internal/products",
                "http://printer.local/", "http://build.corp/", "http://box.lan/")) {
            assertFalse(UrlSafety.check(url, new UrlSafety.Policy()).isAllowed(), "should reject " + url);
        }
    }

    @Test
    void rejectsPrivateAndReservedLiteralAddresses() {
        for (String url : Arrays.asList("http://127.0.0.1/", "http://10.1.2.3/", "http://192.168.0.1/",
                "http://172.16.5.9/", "http://169.254.169.254/latest/meta-data/", "http://100.64.3.4/",
                "http://0.0.0.0/", "http://[::1]/", "http://[fd00::1]/")) {
            UrlSafety.Result result = UrlSafety.check(url, new UrlSafety.Policy());
            assertFalse(result.isAllowed(), "should reject " + url);
        }
    }

    @Test
    void blocksCloudMetadataAndMappedIpv6() throws UnknownHostException {
        assertTrue(UrlSafety.isBlocked(InetAddress.getByName("169.254.169.254")));
        assertTrue(UrlSafety.isBlocked(InetAddress.getByName("::ffff:127.0.0.1")));
        assertTrue(UrlSafety.isBlocked(InetAddress.getByName("100.127.255.255")));
        assertTrue(UrlSafety.isBlocked(InetAddress.getByName("224.0.0.1")));
        assertTrue(UrlSafety.isBlocked(InetAddress.getByName("255.255.255.255")));
        assertFalse(UrlSafety.isBlocked(InetAddress.getByName("13.107.42.14")));
        assertFalse(UrlSafety.isBlocked(InetAddress.getByName("2606:4700::1111")));
    }

    @Test
    void assumesHttpsForSchemelessLinks() {
        UrlSafety.Result result = UrlSafety.check("www.myntra.com/tshirts/roadster/1723852/buy", offlinePolicy());
        assertTrue(result.isAllowed(), result.reason());
        assertEquals("https", result.uri().getScheme());
        assertEquals("www.myntra.com", result.uri().getHost());
    }

    @Test
    void stripsWhitespaceFromPastedLinks() {
        UrlSafety.Result result = UrlSafety.check("  https://www.ajio.com/p/466123456 \n", offlinePolicy());
        assertTrue(result.isAllowed(), result.reason());
        assertEquals("/p/466123456", result.uri().getPath());
    }

    @Test
    void rejectsBlankAndOverlongInput() {
        assertFalse(UrlSafety.check(null, offlinePolicy()).isAllowed());
        assertFalse(UrlSafety.check("   ", offlinePolicy()).isAllowed());
        StringBuilder long_ = new StringBuilder("https://example.com/");
        for (int i = 0; i < 2100; i++) {
            long_.append('a');
        }
        assertFalse(UrlSafety.check(long_.toString(), offlinePolicy()).isAllowed());
    }

    @Test
    void honoursHostAllowlistWhenConfigured() {
        UrlSafety.Policy policy = new UrlSafety.Policy()
                .allowPrivateHosts(true)
                .allowedHostSuffixes(Arrays.asList("myntra.com", "ajio.com"));
        assertTrue(UrlSafety.check("https://www.myntra.com/p/1", policy).isAllowed());
        assertTrue(UrlSafety.check("https://ajio.com/p/1", policy).isAllowed());
        UrlSafety.Result blocked = UrlSafety.check("https://www.example.com/p/1", policy);
        assertFalse(blocked.isAllowed());
        assertTrue(blocked.reason().contains("allowed list"));
    }

    @Test
    void allowPrivateHostsUnlocksLocalTesting() {
        assertTrue(UrlSafety.check("http://127.0.0.1:8123/page.html", offlinePolicy()).isAllowed());
        assertFalse(UrlSafety.check("http://127.0.0.1:8123/page.html", new UrlSafety.Policy()).isAllowed());
    }

    @Test
    void rejectsUrlsWithoutHost() {
        assertFalse(UrlSafety.check("https:///path-only", new UrlSafety.Policy()).isAllowed());
        assertNull(UrlSafety.check("https:///path-only", new UrlSafety.Policy()).uri());
    }
}
