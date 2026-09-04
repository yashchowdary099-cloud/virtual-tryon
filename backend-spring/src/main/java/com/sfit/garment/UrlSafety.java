package com.sfit.garment;

import java.net.Inet4Address;
import java.net.Inet6Address;
import java.net.InetAddress;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

/**
 * Validates user-supplied product URLs before the server fetches them.
 *
 * <p>Every URL that reaches this class came from the browser, so the fetch is a
 * server-side request on behalf of an untrusted party: the classic SSRF shape.
 * Defence is layered — scheme allowlist, no embedded credentials, port allowlist,
 * hostname blocklist, and DNS resolution with rejection of every address that
 * lands in loopback / private / link-local / carrier-grade-NAT / reserved space
 * (IPv4 and IPv6, including IPv4-mapped IPv6). The cloud metadata endpoint
 * 169.254.169.254 is covered by the link-local rule.
 *
 * <p>Redirects are re-validated hop by hop; see {@code SafeHttpFetcher}.
 */
public final class UrlSafety {

    private static final List<String> BLOCKED_HOST_SUFFIXES = Collections.unmodifiableList(java.util.Arrays.asList(
            "localhost", ".localhost", ".local", ".internal", ".intranet", ".lan", ".home", ".corp", ".test"));

    private UrlSafety() {
    }

    /** Result of a safety check: either a usable URI or a human-readable rejection reason. */
    public static final class Result {
        private final URI uri;
        private final String reason;

        private Result(URI uri, String reason) {
            this.uri = uri;
            this.reason = reason;
        }

        static Result ok(URI uri) {
            return new Result(uri, null);
        }

        static Result rejected(String reason) {
            return new Result(null, reason);
        }

        public boolean isAllowed() {
            return uri != null;
        }

        public URI uri() {
            return uri;
        }

        public String reason() {
            return reason;
        }
    }

    /** Tunable policy, populated from {@code sfit.garment.*} properties. */
    public static final class Policy {
        private boolean allowPrivateHosts;
        private List<String> allowedHostSuffixes = new ArrayList<String>();

        public Policy allowPrivateHosts(boolean allow) {
            this.allowPrivateHosts = allow;
            return this;
        }

        /** When non-empty, the host must end with one of these suffixes. */
        public Policy allowedHostSuffixes(List<String> suffixes) {
            this.allowedHostSuffixes = suffixes == null ? new ArrayList<String>() : suffixes;
            return this;
        }

        public boolean isAllowPrivateHosts() {
            return allowPrivateHosts;
        }

        public List<String> getAllowedHostSuffixes() {
            return allowedHostSuffixes;
        }
    }

    /**
     * Parses and hardens a pasted link. Accepts scheme-less input such as
     * {@code www.myntra.com/...} by assuming https, trims tracking whitespace,
     * and rejects anything that is not a plain http(s) URL.
     */
    public static Result check(String rawUrl, Policy policy) {
        Policy effective = policy == null ? new Policy() : policy;
        if (rawUrl == null || rawUrl.trim().isEmpty()) {
            return Result.rejected("Paste a product link first.");
        }

        String candidate = rawUrl.trim().replaceAll("\\s+", "");
        if (candidate.length() > 2048) {
            return Result.rejected("That link is too long to be a product page.");
        }
        if (!candidate.matches("(?i)^[a-z][a-z0-9+.-]*://.*")) {
            if (candidate.matches("(?i)^[a-z][a-z0-9+.-]*:.*")) {
                return Result.rejected("Only http and https links are supported.");
            }
            candidate = "https://" + candidate;
        }

        URI uri;
        try {
            uri = new URI(candidate).normalize();
        } catch (URISyntaxException ex) {
            return Result.rejected("That does not look like a valid web address.");
        }

        String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase(Locale.ROOT);
        if (!"http".equals(scheme) && !"https".equals(scheme)) {
            return Result.rejected("Only http and https links are supported.");
        }
        if (uri.getUserInfo() != null) {
            return Result.rejected("Links containing login credentials are not accepted.");
        }

        String host = uri.getHost();
        if (host == null || host.isEmpty()) {
            return Result.rejected("That link has no website address in it.");
        }
        host = host.toLowerCase(Locale.ROOT);

        int port = uri.getPort();
        if (port != -1 && port != 80 && port != 443 && !effective.isAllowPrivateHosts()) {
            return Result.rejected("Only standard web ports (80/443) are allowed.");
        }

        if (!effective.isAllowPrivateHosts()) {
            for (String suffix : BLOCKED_HOST_SUFFIXES) {
                if (host.equals(suffix) || host.endsWith(suffix)) {
                    return Result.rejected("Internal or local addresses cannot be fetched.");
                }
            }
        }

        List<String> allowed = effective.getAllowedHostSuffixes();
        if (!allowed.isEmpty()) {
            boolean matched = false;
            for (String suffix : allowed) {
                String normalized = suffix == null ? "" : suffix.trim().toLowerCase(Locale.ROOT);
                if (!normalized.isEmpty() && (host.equals(normalized) || host.endsWith("." + normalized))) {
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                return Result.rejected("This shopping site is not on the allowed list configured for SFit.");
            }
        }

        if (!effective.isAllowPrivateHosts()) {
            InetAddress[] addresses;
            try {
                addresses = InetAddress.getAllByName(host);
            } catch (UnknownHostException ex) {
                return Result.rejected("That website address could not be found (DNS lookup failed).");
            }
            if (addresses == null || addresses.length == 0) {
                return Result.rejected("That website address could not be resolved.");
            }
            for (InetAddress address : addresses) {
                if (isBlocked(address)) {
                    return Result.rejected("That link resolves to a private or reserved network address.");
                }
            }
        }

        return Result.ok(uri);
    }

    /** True when the address belongs to a range a public shopping site never legitimately uses. */
    public static boolean isBlocked(InetAddress address) {
        if (address == null) {
            return true;
        }
        if (address.isAnyLocalAddress() || address.isLoopbackAddress()
                || address.isLinkLocalAddress() || address.isSiteLocalAddress()
                || address.isMulticastAddress()) {
            return true;
        }
        byte[] bytes = address.getAddress();
        if (address instanceof Inet4Address) {
            return isBlockedIpv4(bytes);
        }
        if (address instanceof Inet6Address) {
            // Unique local addresses fc00::/7
            if ((bytes[0] & 0xFE) == 0xFC) {
                return true;
            }
            // IPv4-mapped (::ffff:a.b.c.d) and IPv4-compatible addresses
            boolean mapped = true;
            for (int i = 0; i < 10; i++) {
                if (bytes[i] != 0) {
                    mapped = false;
                    break;
                }
            }
            if (mapped) {
                byte[] embedded = {bytes[12], bytes[13], bytes[14], bytes[15]};
                return isBlockedIpv4(embedded);
            }
        }
        return false;
    }

    private static boolean isBlockedIpv4(byte[] bytes) {
        int first = bytes[0] & 0xFF;
        int second = bytes[1] & 0xFF;
        if (first == 0 || first == 127 || first == 10) {
            return true;
        }
        if (first == 169 && second == 254) {
            return true; // link-local, includes 169.254.169.254 cloud metadata
        }
        if (first == 172 && second >= 16 && second <= 31) {
            return true;
        }
        if (first == 192 && second == 168) {
            return true;
        }
        if (first == 100 && second >= 64 && second <= 127) {
            return true; // carrier-grade NAT
        }
        if (first == 192 && (second == 0)) {
            return true; // 192.0.0.0/24 protocol assignments, 192.0.2.0/24 documentation
        }
        if (first == 198 && (second == 18 || second == 19)) {
            return true; // benchmarking
        }
        if (first == 198 && second == 51) {
            return true; // documentation
        }
        if (first == 203 && second == 0) {
            return true; // documentation
        }
        return first >= 224; // multicast + reserved 240/4 + broadcast
    }
}
