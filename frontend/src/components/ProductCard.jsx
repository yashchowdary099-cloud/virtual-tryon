// FILE: frontend/src/components/ProductCard.jsx
import React from 'react';
import { Sparkles, Star, ShoppingBag, Check, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTryOn } from '../context/TryOnContext';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { selectProductForTryOn, addToCart, cart } = useTryOn();

  const isAlreadyInCart = cart.some(item => item.id === product.id);

  const handleTryOn = () => {
    selectProductForTryOn(product);
    navigate('/capture');
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, product.sizes?.[0] || 'M');
  };

  const discountPercent = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 55;

  return (
    <div className="glass-card group rounded-2xl overflow-hidden flex flex-col justify-between border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900/90 transition-all duration-300 shadow-xl">
      <div>
        {/* Product Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-950">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Brand Tag Badge */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <span className="bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md text-indigo-300 text-[11px] font-black px-2.5 py-1 rounded-lg border border-indigo-500/30 flex items-center gap-1 shadow">
              <Tag className="w-3 h-3 text-indigo-400" />
              {product.brand || "Myntra Collection"}
            </span>
          </div>

          {/* Rating */}
          <div className="absolute top-3 right-3 bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1 text-amber-400 text-xs font-bold shadow">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            {product.rating || 4.5}
          </div>

          {/* Discount Badge */}
          <div className="absolute bottom-3 right-3 bg-emerald-500 text-slate-950 font-black text-[11px] px-2 py-0.5 rounded-md shadow-md">
            {discountPercent}% OFF
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {product.brand}
            </span>
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
              {product.category}
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Pricing */}
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.mrp && (
              <span className="text-xs text-slate-400 dark:text-slate-500 line-through font-semibold">
                ₹{product.mrp.toLocaleString('en-IN')}
              </span>
            )}
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold ml-auto">Verified Fit</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-5 pt-0 grid grid-cols-5 gap-2">
        <button
          onClick={handleTryOn}
          className="col-span-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all duration-200 active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4 text-indigo-200" />
          Try It On Me (3D Wear)
        </button>

        <button
          onClick={handleAddToCart}
          title="Add to Bag"
          className={`col-span-1 flex items-center justify-center rounded-xl border transition-all duration-200 ${
            isAlreadyInCart
              ? 'bg-emerald-100 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
              : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {isAlreadyInCart ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
