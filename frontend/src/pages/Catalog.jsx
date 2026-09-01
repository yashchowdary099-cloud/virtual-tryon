// FILE: frontend/src/pages/Catalog.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, Shirt, Filter, Tag } from 'lucide-react';
import { getProducts } from '../api';
import ProductCard from '../components/ProductCard';
import ProgressStepper from '../components/ProgressStepper';
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

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-12 p-8 sm:p-12 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-indigo-500/30 shadow-2xl">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-glow-pulse" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl pointer-events-none animate-glow-pulse" style={{ animationDelay: '1.5s' }} />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-indigo-500/20 to-pink-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-black uppercase tracking-widest mb-5 shadow-lg">
              <Sparkles className="w-4 h-4 text-pink-400 animate-spin-slow" />
              SFit 3D Neural Fitting Engine
            </span>
            
            <h1 className="font-brand text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-5">
              Drape Clothes on <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Your Photo</span> with 3D Precision.
            </h1>
            
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8 max-w-xl">
              Explore authentic apparel from <strong>HIGHLANDER, Roadster, Peter England, Levi's, Allen Solly, Mufti, Tokyo Talkies, SASSAFRAS, DressBerry, Zara</strong> & more.
            </p>

            <div className="flex flex-wrap gap-3 text-xs font-bold text-slate-200">
              <div className="animate-float flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-indigo-500/30 shadow-lg hover:border-indigo-400 transition-all">
                <span className="text-indigo-400 font-mono">👔</span>
                HIGHLANDER, Roadster, Levi's & Mufti
              </div>

              <div className="animate-float-reverse flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-pink-500/30 shadow-lg hover:border-pink-400 transition-all">
                <span className="text-pink-400 font-mono">🌸</span>
                Tokyo Talkies, SASSAFRAS & DressBerry
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative h-72 sm:h-80 flex items-center justify-center">
            <div className="animate-float absolute top-0 right-4 sm:right-8 w-56 sm:w-64 bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl border border-indigo-500/40 shadow-2xl z-20 group">
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-slate-950 mb-3 border border-slate-800">
                <img
                  src="https://pngimg.com/uploads/dress_shirt/dress_shirt_PNG8117.png"
                  alt="HIGHLANDER Navy Shirt"
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                  96.4% Fit Match
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">HIGHLANDER Slim Shirt</h4>
                  <p className="text-[10px] text-indigo-400 font-semibold">Size L (108 cm Chest)</p>
                </div>
                <span className="text-xs font-extrabold text-white bg-indigo-600 px-2 py-1 rounded-lg">₹599</span>
              </div>
            </div>

            <div className="animate-float-reverse absolute bottom-2 left-0 sm:left-4 w-48 sm:w-52 bg-slate-900/90 backdrop-blur-xl p-3.5 rounded-2xl border border-pink-500/40 shadow-2xl z-30">
              <div className="flex items-center gap-3">
                <img
                  src="https://pngimg.com/uploads/tshirt/tshirt_PNG5454.png"
                  alt="Tokyo Talkies Top"
                  className="w-12 h-14 object-contain bg-slate-950 rounded-lg p-1 border border-slate-800"
                />
                <div>
                  <span className="bg-pink-500/20 text-pink-300 text-[9px] font-black px-1.5 py-0.5 rounded border border-pink-500/30 uppercase">
                    Women's Top
                  </span>
                  <h5 className="text-xs font-bold text-white line-clamp-1 mt-0.5">Tokyo Talkies Top</h5>
                  <p className="text-[10px] text-emerald-400 font-extrabold">Instant CM Match</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Filtering Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        
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
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all ${
                selectedGender === tab.key
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white shadow-sm'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Brand Selector & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs shadow-sm">
            <Filter className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span className="text-slate-500 dark:text-slate-400 font-semibold">Brand:</span>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
            >
              {brands.map(b => (
                <option key={b} value={b} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{b}</option>
              ))}
            </select>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Allen Solly, Mufti, Zara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-sm"
            />
          </form>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
          >
            <option value="featured" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Featured</option>
            <option value="price-low" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Price: Low to High</option>
            <option value="price-high" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-96 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800">
          <Shirt className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-slate-300">No items found</h3>
          <p className="text-slate-500 text-sm mt-1">Try resetting your brand filter or search query.</p>
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
