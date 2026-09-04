// FILE: frontend/src/pages/Catalog.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, Shirt, Filter, ArrowRight } from 'lucide-react';
import { getProducts } from '../api';
import ProductCard from '../components/ProductCard';
import ProgressStepper from '../components/ProgressStepper';
import UrlGarmentExtractor from '../components/UrlGarmentExtractor';
import { useTryOn } from '../context/TryOnContext';
import fallbackProductsData from '../../../backend/data/products.json';

export default function Catalog() {
  const [products, setProducts] = useState(fallbackProductsData);
  const [loading, setLoading] = useState(false);
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const { setActiveStep } = useTryOn();

  const brands = ['All', "HIGHLANDER", "Roadster", "Here&Now", "Peter England", "Levi's", "Mast & Harbour", "Allen Solly", "Mufti", "Tokyo Talkies", "SASSAFRAS", "DressBerry", "Zara"];

  useEffect(() => {
    setActiveStep(1);
    fetchProducts();
  }, [selectedGender, selectedBrand, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (sortBy !== 'featured') params.sort = sortBy;
      if (searchQuery) params.search = searchQuery;

      const data = await getProducts(params);
      if (data && data.success && data.products && data.products.length > 0) {
        applyFilters(data.products);
      } else {
        applyFilters(fallbackProductsData);
      }
    } catch (err) {
      applyFilters(fallbackProductsData);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (rawProducts) => {
    let filtered = [...rawProducts];

    if (selectedGender === 'Men') {
      filtered = filtered.filter(p => p.gender === 'Men' || (p.category && p.category.includes("Men's")));
    } else if (selectedGender === 'Women') {
      filtered = filtered.filter(p => p.gender === 'Women' || (p.category && p.category.includes("Women's")));
    }

    if (selectedBrand !== 'All') {
      filtered = filtered.filter(p => p.brand === selectedBrand || (p.tags && p.tags.includes(selectedBrand)));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    }

    setProducts(filtered);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <ProgressStepper activeStep={1} />

      {/* Hero Editorial Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-12 p-8 sm:p-12 bg-white border border-[#E8E2D5] shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#FAF7F2] rounded-l-full pointer-events-none -z-0" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F4EFE6] border border-[#E8E2D5] text-[#8C6D3F] text-[11px] font-extrabold uppercase tracking-widest mb-5">
              <Sparkles className="w-3.5 h-3.5 text-[#C59B27]" />
              SFit Neural Fitting Studio
            </span>
            
            <h1 className="font-serif text-4xl sm:text-6xl font-bold text-[#1A1817] tracking-tight leading-[1.1] mb-6">
              Virtually Wear <br />
              <span className="italic font-normal text-[#8C6D3F]">Any Outfit</span> On Yourself.
            </h1>
            
            <p className="text-[#6E675F] text-sm sm:text-base leading-relaxed mb-8 max-w-xl">
              Paste clothing links from <strong>Myntra, AJIO, Amazon, Flipkart, Zara</strong> or select from curated collections below to virtually try on before buying.
            </p>

            <div className="flex flex-wrap gap-3 text-xs font-bold text-[#2D2A26]">
              <div className="flex items-center gap-2 bg-[#FAF7F2] px-4 py-2.5 rounded-full border border-[#E8E2D5] shadow-sm">
                <span className="text-[#8C6D3F]">👔</span>
                Men's Shirts, Jackets & Trousers
              </div>

              <div className="flex items-center gap-2 bg-[#FAF7F2] px-4 py-2.5 rounded-full border border-[#E8E2D5] shadow-sm">
                <span className="text-[#8C6D3F]">🌸</span>
                Women's Tops, Dresses & Sarees
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative h-72 sm:h-80 flex items-center justify-center">
            <div className="animate-float absolute top-0 right-4 sm:right-8 w-56 sm:w-64 bg-white p-4 rounded-2xl border border-[#E8E2D5] shadow-[0_12px_30px_rgba(0,0,0,0.06)] z-20 group">
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-[#FAF7F2] mb-3 border border-[#E8E2D5]">
                <img
                  src="https://pngimg.com/uploads/dress_shirt/dress_shirt_PNG8117.png"
                  alt="HIGHLANDER Navy Shirt"
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 bg-[#1A1817] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  96.4% CM Match
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#1A1817] leading-tight">HIGHLANDER Slim Shirt</h4>
                  <p className="text-[10px] text-[#8C6D3F] font-medium">Size L (108 cm Chest)</p>
                </div>
                <span className="text-xs font-extrabold text-[#1A1817] bg-[#F4EFE6] px-2.5 py-1 rounded-lg">₹599</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main URL-Based Garment Extractor Section */}
      <div className="mb-12">
        <UrlGarmentExtractor />
      </div>

      {/* Catalog Title Divider */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1817] flex items-center gap-2">
            <Shirt className="w-5 h-5 text-[#8C6D3F]" />
            Or Explore Curated Fashion Collections
          </h2>
          <p className="text-xs text-[#6E675F] mt-0.5">Pick sample garments to instantly fitting test</p>
        </div>
      </div>

      {/* Filtering Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl border border-[#E8E2D5] shadow-sm">
        
        {/* Gender / Category Tabs */}
        <div className="flex items-center gap-2">
          {[
            { key: 'All', label: `All Collections (${products.length})` },
            { key: 'Men', label: "Men's Shirts 👔" },
            { key: 'Women', label: "Women's Tops 👚" }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedGender(tab.key)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedGender === tab.key
                  ? 'bg-[#1A1817] text-white shadow-md'
                  : 'bg-[#FAF7F2] text-[#57524A] border border-[#E8E2D5] hover:text-[#1A1817]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Brand Selector & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#FAF7F2] border border-[#E8E2D5] rounded-full px-3.5 py-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#8C6D3F]" />
            <span className="text-[#6E675F] font-medium">Brand:</span>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-transparent text-[#1A1817] font-bold focus:outline-none cursor-pointer"
            >
              {brands.map(b => (
                <option key={b} value={b} className="bg-white text-[#1A1817]">{b}</option>
              ))}
            </select>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-[#9E968B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Allen Solly, Zara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#E8E2D5] rounded-full pl-10 pr-4 py-2 text-xs text-[#1A1817] placeholder-[#9E968B] focus:outline-none focus:border-[#1A1817]"
            />
          </form>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#FAF7F2] border border-[#E8E2D5] text-[#2D2A26] text-xs font-semibold rounded-full px-3.5 py-2 focus:outline-none focus:border-[#1A1817] cursor-pointer"
          >
            <option value="featured" className="bg-white text-[#1A1817]">Featured</option>
            <option value="price-low" className="bg-white text-[#1A1817]">Price: Low to High</option>
            <option value="price-high" className="bg-white text-[#1A1817]">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-96 rounded-3xl bg-white border border-[#E8E2D5] animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#E8E2D5]">
          <Shirt className="w-12 h-12 text-[#9E968B] mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-[#1A1817]">No fashion items found</h3>
          <p className="text-[#6E675F] text-sm mt-1">Try resetting your brand filter or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
