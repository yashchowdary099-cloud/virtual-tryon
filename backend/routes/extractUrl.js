// FILE: backend/routes/extractUrl.js
const express = require('express');
const router = express.Router();
const dns = require('dns').promises;
const net = require('net');
const { URL } = require('url');

/**
 * Checks whether an IP string represents a private / local / loopback IP address (SSRF Protection).
 */
function isPrivateIp(ip) {
  if (!ip) return true;
  // IPv4 checks
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    // 127.0.0.0/8 (Loopback)
    if (parts[0] === 127) return true;
    // 10.0.0.0/8 (Private)
    if (parts[0] === 10) return true;
    // 172.16.0.0/12 (Private)
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16 (Private)
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 169.254.0.0/16 (Link-local)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 0.0.0.0/8
    if (parts[0] === 0) return true;
    return false;
  }
  // IPv6 checks
  if (net.isIPv6(ip)) {
    const normalized = ip.toLowerCase();
    if (normalized === '::1' || normalized === '::') return true;
    if (normalized.startsWith('fe80:') || normalized.startsWith('fd')) return true;
    return false;
  }
  return true;
}

/**
 * Validates a target URL against SSRF vulnerabilities.
 */
async function validateUrlForSsrf(urlString) {
  let parsedUrl;
  try {
    parsedUrl = new URL(urlString);
  } catch (err) {
    throw new Error('Invalid URL format. Please provide a valid HTTP/HTTPS link.');
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new Error('Only HTTP and HTTPS product links are allowed.');
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // Block obvious localhost / internal hostnames
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.lan')
  ) {
    throw new Error('Access to internal hostnames is prohibited.');
  }

  // Resolve DNS to verify destination IP
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    if (!addresses || addresses.length === 0) {
      throw new Error(`Could not resolve hostname "${hostname}".`);
    }
    for (const addr of addresses) {
      if (isPrivateIp(addr.address)) {
        throw new Error(`Access to private network IP (${addr.address}) is forbidden.`);
      }
    }
  } catch (err) {
    if (err.message.includes('forbidden') || err.message.includes('prohibited')) {
      throw err;
    }
    throw new Error(`DNS resolution failed for hostname "${hostname}": ${err.message}`);
  }

  return parsedUrl;
}

/**
 * Perform safe HTTP fetch with custom browser User-Agent & redirect validation.
 */
async function safeFetchHtml(targetUrlString, redirectCount = 0) {
  if (redirectCount > 5) {
    throw new Error('Too many redirects encountered while fetching product link.');
  }

  const validatedUrl = await validateUrlForSsrf(targetUrlString);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second timeout

  try {
    const response = await fetch(validatedUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      },
      redirect: 'manual', // handle manually for SSRF verification on redirect
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Handle redirects manually to re-validate destination URL
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) {
        throw new Error(`Received redirect status ${response.status} without Location header.`);
      }
      const absoluteRedirectUrl = new URL(location, validatedUrl.toString()).toString();
      return await safeFetchHtml(absoluteRedirectUrl, redirectCount + 1);
    }

    if (!response.ok) {
      throw new Error(`Product site returned HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    return { html, finalUrl: validatedUrl.toString() };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Connection timed out while fetching product details (12s limit).');
    }
    throw err;
  }
}

/**
 * Detect garment category (upper_body, lower_body, dresses) from text keywords.
 */
function detectGarmentCategory(text = '') {
  const lower = text.toLowerCase();

  // Dresses & full outfits
  if (
    lower.includes('dress') ||
    lower.includes('saree') ||
    lower.includes('sari') ||
    lower.includes('gown') ||
    lower.includes('jumpsuit') ||
    lower.includes('lehenga') ||
    lower.includes('anarkali') ||
    lower.includes('co-ord') ||
    lower.includes('suit')
  ) {
    return { category: 'dresses', typeLabel: 'Full Outfit / Dress' };
  }

  // Lower body
  if (
    lower.includes('pant') ||
    lower.includes('jeans') ||
    lower.includes('trouser') ||
    lower.includes('skirt') ||
    lower.includes('short') ||
    lower.includes('legging') ||
    lower.includes('jogger') ||
    lower.includes('cargo') ||
    lower.includes('bottom')
  ) {
    return { category: 'lower_body', typeLabel: 'Bottom Wear' };
  }

  // Default to upper body (shirt, top, hoodie, jacket, etc.)
  return { category: 'upper_body', typeLabel: 'Top Wear / Shirt' };
}

/**
 * Extracts product metadata (Image, Title, Brand, Color, Price) from HTML content.
 */
function extractMetadataFromHtml(html, pageUrl) {
  let name = '';
  let brand = '';
  let color = '';
  let price = '';
  let imageUrl = '';

  // 1. Check JSON-LD data (<script type="application/ld+json">)
  const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  if (jsonLdMatches) {
    for (const block of jsonLdMatches) {
      try {
        const jsonContent = block.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '').trim();
        const data = JSON.parse(jsonContent);
        const item = Array.isArray(data) ? data.find(d => d['@type'] === 'Product') || data[0] : data;

        if (item && (item['@type'] === 'Product' || item.name || item.image)) {
          if (!name && item.name) name = item.name;
          if (!brand && item.brand) {
            brand = typeof item.brand === 'object' ? item.brand.name || '' : item.brand;
          }
          if (!color && item.color) color = item.color;
          if (!price && item.offers) {
            const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
            if (offer && offer.price) price = `₹${offer.price}`;
          }
          if (!imageUrl && item.image) {
            if (Array.isArray(item.image)) imageUrl = item.image[0];
            else if (typeof item.image === 'object') imageUrl = item.image.url || item.image[0];
            else imageUrl = item.image;
          }
        }
      } catch (e) {
        // Skip invalid JSON-LD block
      }
    }
  }

  // 2. Platform-specific Scrapers (Myntra pdpData, Amazon dynamic image, etc.)
  if (!imageUrl && (html.includes('window.__myntraData') || html.includes('pdpData'))) {
    const myntraImgMatch = html.match(/"imageURL"[:\s]*"([^"]+)"/i) || html.match(/"secure_url"[:\s]*"([^"]+)"/i);
    if (myntraImgMatch) imageUrl = myntraImgMatch[1];
  }

  if (!imageUrl && html.includes('data-a-dynamic-image')) {
    const amazonImgMatch = html.match(/data-a-dynamic-image=["']([^"']+)["']/i);
    if (amazonImgMatch) {
      try {
        const parsed = JSON.parse(amazonImgMatch[1].replace(/&quot;/g, '"'));
        imageUrl = Object.keys(parsed)[0];
      } catch (e) {}
    }
  }

  // 3. OpenGraph & Meta Tags Fallback
  if (!imageUrl) {
    const ogImageMatch =
      html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i) ||
      html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);
    if (ogImageMatch) imageUrl = ogImageMatch[1];
  }

  if (!name) {
    const ogTitleMatch =
      html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i) ||
      html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (ogTitleMatch) name = ogTitleMatch[1].replace(/&amp;/g, '&').trim();
  }

  if (!brand) {
    const brandMatch = html.match(/<meta[^>]*property=["']product:brand["'][^>]*content=["']([^"']+)["']/i);
    if (brandMatch) brand = brandMatch[1];
  }

  // Clean HTML entity encodings in title
  if (name) {
    name = name.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
               .replace(/&quot;/g, '"')
               .replace(/&apos;/g, "'")
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/\s+/g, ' ')
               .trim();
  }

  // Derive Platform Name
  let platform = 'Shopping Site';
  const host = new URL(pageUrl).hostname.toLowerCase();
  if (host.includes('myntra')) platform = 'Myntra';
  else if (host.includes('ajio')) platform = 'AJIO';
  else if (host.includes('amazon')) platform = 'Amazon';
  else if (host.includes('flipkart')) platform = 'Flipkart';
  else if (host.includes('zara')) platform = 'Zara';
  else if (host.includes('meesho')) platform = 'Meesho';
  else if (host.includes('hm.com') || host.includes('h&m')) platform = 'H&M';
  else if (host.includes('nykaa')) platform = 'Nykaa Fashion';
  else if (host.includes('tatacliq')) platform = 'Tata CLiQ';
  else if (host.includes('westside')) platform = 'Westside';
  else if (host.includes('lifestyle')) platform = 'Lifestyle';
  else if (host.includes('pantaloons')) platform = 'Pantaloons';
  else if (host.includes('uniqlo')) platform = 'Uniqlo';
  else if (host.includes('asos')) platform = 'ASOS';
  else if (host.includes('shein')) platform = 'SHEIN';
  else {
    const parts = host.replace(/^www\./, '').split('.');
    if (parts.length > 0 && parts[0]) {
      platform = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
  }

  // Make image URL absolute if relative
  if (imageUrl) {
    try {
      imageUrl = new URL(imageUrl, pageUrl).toString();
    } catch (e) {}
  }

  // Detect Garment Category & Type
  const { category, typeLabel } = detectGarmentCategory(`${name} ${pageUrl}`);

  return {
    name: name || `${platform} Garment`,
    brand: brand || platform,
    color: color || 'Default',
    price: price || 'Price on Store',
    imageUrl,
    category,
    garmentType: typeLabel,
    platform,
    sourceUrl: pageUrl
  };
}

/**
 * Detects whether the scraped product content belongs to Fashion / Apparel / Clothing.
 */
function isFashionApparel(title = '', html = '', pageUrl = '') {
  const combined = `${title} ${pageUrl}`.toLowerCase();
  
  // Non-fashion keywords that strongly indicate non-clothing products
  const nonFashionKeywords = [
    'iphone', 'android', 'smartphone', 'mobile', 'laptop', 'macbook', 'computer',
    'monitor', 'television', ' tv ', 'camera', 'lens', 'headphone', 'earphone',
    'earbuds', 'speaker', 'gadget', 'charger', 'cable', 'battery', 'powerbank',
    'refrigerator', 'fridge', 'washing machine', 'microwave', 'oven', 'blender',
    'mixer', 'toaster', 'vacuum', 'air conditioner', ' ac ', 'purifier', 'kettle',
    'furniture', 'sofa', 'couch', 'chair', 'table', 'desk', 'bed', 'mattress',
    'book', 'novel', 'hardcover', 'paperback', 'stationery', 'toy', 'doll',
    'car ', 'automobile', 'motorcycle', 'tire', 'helmet', 'grocery', 'food',
    'beverage', 'shampoo', 'soap', 'lotion', 'cream', 'serum', 'perfume',
    'toothpaste', 'supplement', 'vitamin', 'tablet', 'capsule'
  ];

  // Positive fashion/clothing keywords
  const fashionKeywords = [
    'shirt', 't-shirt', 'tshirt', 'top', 'dress', 'saree', 'sari', 'kurta', 'kurti',
    'jacket', 'coat', 'blazer', 'sweater', 'hoodie', 'cardigan', 'pant', 'pants',
    'jeans', 'trouser', 'trousers', 'skirt', 'short', 'shorts', 'legging', 'leggings',
    'jogger', 'joggers', 'cargo', 'lehenga', 'gown', 'anarkali', 'jumpsuit', 'suit',
    'blouse', 'vest', 'bra', 'innerwear', 'trackpant', 'activewear', 'swimwear',
    'kimono', 'poncho', 'shrug', 'scarf', 'dupatta', 'palazzo', 'pyjama', 'nightwear',
    'apparel', 'clothing', 'wear', 'garment', 'outfit', 'topwear', 'bottomwear',
    'attire', 'chinos', 'frock', 'tunic', 'bodysuit', 'robe', 'sherwani', 'parka',
    'slacks', 'tee'
  ];

  // 1. If any positive fashion keyword is present in title or URL
  const hasFashionKeyword = fashionKeywords.some(kw => combined.includes(kw));
  if (hasFashionKeyword) return true;

  // 2. If non-fashion keyword matches and NO fashion keyword matches
  const hasNonFashionKeyword = nonFashionKeywords.some(kw => combined.includes(kw));
  if (hasNonFashionKeyword) return false;

  // 3. Fallback check inside HTML metadata
  const lowerHtml = html.toLowerCase();
  if (
    lowerHtml.includes('clothing') ||
    lowerHtml.includes('apparel') ||
    lowerHtml.includes('fashion') ||
    lowerHtml.includes('topwear') ||
    lowerHtml.includes('bottomwear')
  ) {
    return true;
  }

  if (pageUrl.includes('/shirts/') || pageUrl.includes('/tops/') || pageUrl.includes('/dresses/') || pageUrl.includes('/clothing/')) {
    return true;
  }

  return false;
}

/**
 * POST /api/extract-url
 * Validates and extracts garment details from shopping product links.
 */
router.post('/', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Product URL is required. Please paste a valid shopping link.'
      });
    }

    const trimmedUrl = url.trim();

    // 1. SSRF check & HTTP Fetch HTML
    const { html, finalUrl } = await safeFetchHtml(trimmedUrl);

    // 2. Extract metadata
    const extractedData = extractMetadataFromHtml(html, finalUrl);

    // 3. Smart Fashion / Apparel Validation
    const isFashion = isFashionApparel(extractedData.name, html, finalUrl);
    if (!isFashion) {
      console.warn(`[URL Extractor Non-Fashion] Rejected "${extractedData.name}" as non-apparel item.`);
      return res.status(422).json({
        success: false,
        isFashion: false,
        error: "Not a fashion product. This link doesn't appear to contain clothing or apparel. Please paste a clothing product link."
      });
    }

    if (!extractedData.imageUrl) {
      return res.status(422).json({
        success: false,
        error: `Unable to extract garment image from ${extractedData.platform}. Please use manual upload fallback.`
      });
    }

    console.log(`[URL Extractor Success] Extracted "${extractedData.name}" from ${extractedData.platform}`);

    return res.status(200).json({
      success: true,
      isFashion: true,
      productName: extractedData.name,
      garmentImage: extractedData.imageUrl,
      category: extractedData.category,
      variant: extractedData.color || 'Default',
      product: extractedData
    });

  } catch (err) {
    console.error('[URL Extractor Error]:', err.message);
    return res.status(400).json({
      success: false,
      error: err.message || 'Unable to extract garment image.'
    });
  }
});

module.exports = router;
