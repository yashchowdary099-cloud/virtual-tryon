// FILE: frontend/src/components/UrlGarmentExtractor.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Clipboard, ArrowRight, Loader2, AlertCircle, Sparkles, CheckCircle2, Upload, Shirt, ExternalLink, Tag, ShieldAlert } from 'lucide-react';
import { extractProductFromUrl } from '../api';
import { useTryOn } from '../context/TryOnContext';

export default function UrlGarmentExtractor({ onProceed }) {
  const navigate = useNavigate();
  const { selectProductForTryOn, capturedImages } = useTryOn();
  const fileInputRef = useRef(null);

  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedProduct, setExtractedProduct] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isNonFashion, setIsNonFashion] = useState(false);
  const [showManualUpload, setShowManualUpload] = useState(false);
  const [manualImagePreview, setManualImagePreview] = useState(null);
  const [manualGarmentName, setManualGarmentName] = useState('');

  // Sample fashion URLs for user testing
  const sampleUrls = [
    { label: "Myntra Shirt", url: 'https://www.myntra.com/shirts/highlander/highlander-men-navy-blue-slim-fit-casual-shirt/11234567/buy' },
    { label: "Amazon Top", url: 'https://www.amazon.in/dp/B08X123456' },
    { label: "AJIO Outfit", url: 'https://www.ajio.com/p/461234567_blue' },
    { label: "Zara Dress", url: 'https://www.zara.com/in/en/floral-print-dress-p01234567.html' }
  ];

  // Handle Clipboard Paste
  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setInputUrl(text.trim());
          setErrorMsg(null);
          setIsNonFashion(false);
        }
      }
    } catch (err) {
      console.warn('Clipboard read error:', err.message);
    }
  };

  // Fetch & Validate Product URL
  const handleExtractUrl = async (e) => {
    if (e) e.preventDefault();
    if (!inputUrl || !inputUrl.trim()) {
      setErrorMsg('Please paste a product URL from Myntra, AJIO, Amazon, Flipkart, Zara or any fashion site.');
      setIsNonFashion(false);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setIsNonFashion(false);
    setExtractedProduct(null);

    try {
      const response = await extractProductFromUrl(inputUrl.trim());

      if (response && response.success) {
        const prodData = response.product || {
          name: response.productName,
          imageUrl: response.garmentImage,
          category: response.category,
          color: response.variant,
          brand: 'Fashion Store',
          price: 'Store Price',
          platform: 'Online Store',
          garmentType: 'Top Wear'
        };

        const prod = {
          id: 'url_' + Date.now(),
          name: prodData.name || response.productName || 'Extracted Garment',
          brand: prodData.brand || 'Fashion Store',
          price: prodData.price || 'Store Price',
          image: prodData.imageUrl || response.garmentImage,
          overlayImage: prodData.imageUrl || response.garmentImage,
          category: prodData.category || response.category || 'upper_body',
          garmentType: prodData.garmentType || 'Top Wear',
          color: prodData.color || response.variant || 'Default',
          sourceUrl: prodData.sourceUrl || inputUrl.trim(),
          platform: prodData.platform || 'Online Store',
          isUrlExtracted: true,
          fabric: `Extracted from ${prodData.platform || 'Fashion Store'}`
        };
        setExtractedProduct(prod);
      } else {
        if (response?.isFashion === false) {
          setIsNonFashion(true);
          setErrorMsg("This link doesn't appear to contain clothing or apparel. Please paste a fashion product link.");
        } else {
          throw new Error(response?.error || 'Unable to extract garment image.');
        }
      }
    } catch (err) {
      console.error('URL Extraction Failed:', err);
      if (err.message && (err.message.includes('Not a fashion') || err.message.includes('non-apparel'))) {
        setIsNonFashion(true);
        setErrorMsg("This link doesn't appear to contain clothing or apparel. Please paste a fashion product link.");
      } else {
        setIsNonFashion(false);
        setErrorMsg(err.message || 'Garment extraction failed. Please check the URL or try manual upload below.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Manual File Upload Fallback
  const handleManualImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Uri = reader.result;
        setManualImagePreview(base64Uri);
        const prod = {
          id: 'manual_' + Date.now(),
          name: manualGarmentName.trim() || file.name.replace(/\.[^/.]+$/, '') || 'Custom Outfit',
          brand: 'Uploaded Garment',
          price: 'Your Item',
          image: base64Uri,
          overlayImage: base64Uri,
          category: 'upper_body',
          garmentType: 'Custom Outfit',
          color: 'Custom',
          sourceUrl: '',
          platform: 'Manual Upload',
          isUrlExtracted: false,
          fabric: 'Uploaded Photo'
        };
        setExtractedProduct(prod);
        setErrorMsg(null);
        setIsNonFashion(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Proceed to Try On
  const handleProceedToTryOn = () => {
    if (!extractedProduct) return;
    selectProductForTryOn(extractedProduct);

    if (onProceed) {
      onProceed(extractedProduct);
    } else {
      if (capturedImages.front) {
        navigate('/fitting');
      } else {
        navigate('/capture');
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E8E2D5] p-6 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.03)] relative overflow-hidden">
      
      {/* Subtle Background Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FAF7F2] rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Title & Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 relative z-10">
        <div>
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F4EFE6] text-[#8C6D3F] text-[11px] font-extrabold uppercase tracking-widest mb-3 border border-[#E8E2D5]">
            <Sparkles className="w-3.5 h-3.5 text-[#C59B27]" />
            Instant Garment Extraction
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1817] tracking-tight leading-tight">
            Try Any Outfit On You
          </h2>
          <p className="text-[#6E675F] text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
            Paste a product link from your favorite shopping site and see how it looks on you.
          </p>
        </div>

        {/* Manual Upload Toggle */}
        <button
          type="button"
          onClick={() => {
            setShowManualUpload(!showManualUpload);
            setErrorMsg(null);
            setIsNonFashion(false);
          }}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#FAF7F2] hover:bg-[#F4EFE6] text-[#2D2A26] border border-[#E8E2D5] text-xs font-bold transition-all shadow-sm"
        >
          <Upload className="w-4 h-4 text-[#8C6D3F]" />
          {showManualUpload ? 'Use Product Link Input' : 'Manual Garment Upload'}
        </button>
      </div>

      {/* Main Input Area */}
      {!showManualUpload ? (
        <div className="space-y-4 relative z-10">
          
          {/* URL Input Form */}
          <form onSubmit={handleExtractUrl} className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative flex-1">
              <Link2 className="w-5 h-5 text-[#9E968B] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                placeholder="Paste clothing link from Myntra, AJIO, Amazon, Flipkart, Zara..."
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                  if (isNonFashion) setIsNonFashion(false);
                }}
                disabled={loading}
                className="w-full bg-[#FAF8F5] border border-[#E8E2D5] rounded-2xl pl-12 pr-24 py-4 text-sm text-[#1A1817] placeholder-[#9E968B] focus:outline-none focus:border-[#1A1817] focus:bg-white transition-all shadow-inner"
              />

              {/* Paste Button */}
              <button
                type="button"
                onClick={handlePasteClipboard}
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F4EFE6] text-[#2D2A26] border border-[#E8E2D5] text-xs font-bold transition-all shadow-sm"
                title="Paste from clipboard"
              >
                <Clipboard className="w-3.5 h-3.5 text-[#8C6D3F]" />
                <span>Paste</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !inputUrl.trim()}
              className={`flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-sm transition-all shadow-md ${
                loading || !inputUrl.trim()
                  ? 'bg-[#E8E2D5] text-[#9E968B] cursor-not-allowed'
                  : 'bg-[#1A1817] hover:bg-[#2D2A26] text-white active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Extracting Outfit...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#C59B27]" />
                  Extract Garment
                </>
              )}
            </button>
          </form>

          {/* Supported Sites & Quick Sample Links */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs border-t border-[#F4EFE6] pt-3">
            <p className="text-[#6E675F] text-[11px] font-medium">
              Supported stores: <strong>Myntra, AJIO, Amazon, Flipkart, Zara, Meesho</strong> & major fashion sites.
            </p>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-[#9E968B] font-semibold">Try sample:</span>
              {sampleUrls.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setInputUrl(s.url);
                    setErrorMsg(null);
                    setIsNonFashion(false);
                  }}
                  className="px-2.5 py-1 rounded-full bg-[#F4EFE6] hover:bg-[#E8E2D5] text-[#57524A] hover:text-[#1A1817] text-[11px] font-bold transition-all"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      ) : (
        /* Manual Garment Image Upload Fallback */
        <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D5] relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#1A1817] flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#8C6D3F]" />
              Manual Garment Image Upload
            </h4>
            <span className="text-[11px] text-[#6E675F]">Accepted: JPG, PNG, WEBP</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-8 space-y-3">
              <input
                type="text"
                placeholder="Garment Name (e.g. Linen White Shirt)"
                value={manualGarmentName}
                onChange={(e) => setManualGarmentName(e.target.value)}
                className="w-full bg-white border border-[#E8E2D5] rounded-xl px-4 py-2.5 text-xs text-[#1A1817] placeholder-[#9E968B] focus:outline-none focus:border-[#1A1817]"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleManualImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white hover:bg-[#F4EFE6] text-[#1A1817] border border-[#E8E2D5] text-xs font-bold transition-all shadow-sm"
              >
                <Shirt className="w-4 h-4 text-[#8C6D3F]" />
                Select Garment Image File from Device
              </button>
            </div>

            <div className="sm:col-span-4 flex justify-center">
              {manualImagePreview ? (
                <div className="w-24 h-28 rounded-xl overflow-hidden border border-[#E8E2D5] bg-white p-1 relative shadow-md">
                  <img src={manualImagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                  <span className="absolute bottom-1 right-1 bg-[#1A1817] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    Selected
                  </span>
                </div>
              ) : (
                <div className="w-24 h-28 rounded-xl border border-dashed border-[#E8E2D5] bg-white flex flex-col items-center justify-center text-[#9E968B] text-xs">
                  <Shirt className="w-6 h-6 mb-1" />
                  No Image
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Non-Fashion Product Error Callout */}
      <AnimatePresence>
        {isNonFashion && errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 p-5 rounded-2xl bg-[#FFF8F6] border border-[#F5C2B8] text-left space-y-3 relative z-10 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-[#B85C38] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-[#B85C38]">Not a fashion product</h4>
                <p className="text-xs text-[#57524A] mt-1 leading-relaxed">{errorMsg}</p>
              </div>
            </div>

            <div className="pt-1 flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowManualUpload(true);
                  setErrorMsg(null);
                  setIsNonFashion(false);
                }}
                className="px-3.5 py-1.5 rounded-full bg-[#B85C38]/10 hover:bg-[#B85C38]/20 text-[#B85C38] font-bold text-xs transition-all flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Clothing Image Manually
              </button>
            </div>
          </motion.div>
        )}

        {/* General Error Callout */}
        {!isNonFashion && errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 p-5 rounded-2xl bg-[#FFF8F6] border border-[#F5C2B8] text-left space-y-3 relative z-10 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#B85C38] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#B85C38]">Extraction Notice</h4>
                <p className="text-xs text-[#57524A] mt-1 leading-relaxed">{errorMsg}</p>
              </div>
            </div>

            <div className="pt-1 flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => setShowManualUpload(true)}
                className="px-3.5 py-1.5 rounded-full bg-[#FAF7F2] hover:bg-[#F4EFE6] text-[#2D2A26] border border-[#E8E2D5] font-bold text-xs transition-all flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-[#8C6D3F]" />
                Switch to Manual Upload Fallback
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Valid Fashion Product Preview Card */}
      <AnimatePresence>
        {extractedProduct && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6 p-6 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D5] relative z-10 shadow-md space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#8C6D3F]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#8C6D3F]">
                  Ready to Try On
                </span>
              </div>
              <span className="bg-white text-[#1A1817] text-[10px] font-bold px-3 py-1 rounded-full border border-[#E8E2D5] uppercase">
                {extractedProduct.platform}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Image Preview */}
              <div className="sm:col-span-4 flex justify-center">
                <div className="relative aspect-[3/4] w-40 rounded-xl overflow-hidden bg-white border border-[#E8E2D5] p-2 group shadow-sm">
                  <img
                    src={extractedProduct.image}
                    alt={extractedProduct.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-[#1A1817] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                    {extractedProduct.garmentType}
                  </span>
                </div>
              </div>

              {/* Garment Details & Actions */}
              <div className="sm:col-span-8 space-y-3">
                <div>
                  <span className="text-[11px] font-bold text-[#8C6D3F] uppercase tracking-widest">
                    {extractedProduct.brand}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#1A1817] leading-snug mt-0.5">
                    {extractedProduct.name}
                  </h3>
                  <p className="text-xs text-[#6E675F] mt-1">
                    Category: <strong className="text-[#1A1817] font-semibold">{extractedProduct.garmentType}</strong> | Variant: <strong className="text-[#1A1817] font-semibold">{extractedProduct.color}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <span className="text-sm font-extrabold text-[#1A1817] bg-white px-3 py-1 rounded-full border border-[#E8E2D5]">
                    {extractedProduct.price}
                  </span>
                  {extractedProduct.sourceUrl && (
                    <a
                      href={extractedProduct.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#6E675F] hover:text-[#1A1817] flex items-center gap-1 transition-colors font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View Store Link
                    </a>
                  )}
                </div>

                {/* Primary Try On CTA */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleProceedToTryOn}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-[#1A1817] hover:bg-[#2D2A26] text-white font-bold text-sm shadow-md active:scale-[0.98] transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-[#C59B27]" />
                    Try On This Outfit
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
