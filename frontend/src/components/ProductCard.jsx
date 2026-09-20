import React from 'react';
import { Sparkles, Star, ShoppingBag, Check, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTryOn } from '../context/TryOnContext';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { selectProductForTryOn, addToCart, cart } = useTryOn();
  const { user } = useAuth();

  const isAlreadyInCart = cart.some(item => item.id === product.id);

  const handleTryOn = () => {
    selectProductForTryOn(product);
    if (!user) {
      navigate('/login', { state: { from: '/capture', product } });
    } else {
      navigate('/capture');
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, product.sizes?.[0] || 'M');
  };

  const discountPercent = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 40;

  return (
    <div className="glass-card group rounded-3xl overflow-hidden flex flex-col justify-between border border-[#E8E2D5] bg-white transition-all duration-300 shadow-sm hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
      <div>
        {/* Product Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-[#FAF7F2] p-2">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Brand Tag Badge */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <span className="bg-white/90 backdrop-blur-md text-[#1A1817] text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-[#E8E2D5] flex items-center gap-1 shadow-sm uppercase tracking-wider">
              <Tag className="w-3 h-3 text-[#8C6D3F]" />
              {product.brand || "Collection"}
            </span>
          </div>

          {/* Rating */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#E8E2D5] flex items-center gap-1 text-[#1A1817] text-xs font-bold shadow-sm">
            <Star className="w-3.5 h-3.5 fill-[#C59B27] text-[#C59B27]" />
            {product.rating || 4.5}
          </div>

          {/* Discount Badge */}
          <div className="absolute bottom-3 right-3 bg-[#1A1817] text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow-sm uppercase">
            {discountPercent}% OFF
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D3F]">
              {product.brand}
            </span>
            <span className="text-[10px] font-semibold text-[#6E675F]">
              {product.category}
            </span>
          </div>

          <h3 className="font-serif text-lg font-bold text-[#1A1817] group-hover:text-[#8C6D3F] transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="text-xs text-[#6E675F] mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Pricing */}
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold text-[#1A1817]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.mrp && (
              <span className="text-xs text-[#9E968B] line-through font-medium">
                ₹{product.mrp.toLocaleString('en-IN')}
              </span>
            )}
            <span className="text-[10px] text-[#8C6D3F] font-bold ml-auto bg-[#F4EFE6] px-2 py-0.5 rounded border border-[#E8E2D5]">Verified Fit</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-5 pt-0 grid grid-cols-5 gap-2">
        <button
          onClick={handleTryOn}
          className="col-span-4 flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#1A1817] hover:bg-[#2D2A26] text-white text-xs font-bold shadow-md transition-all duration-200 active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4 text-[#C59B27]" />
          Try On This Garment
        </button>

        <button
          onClick={handleAddToCart}
          title="Add to Bag"
          className={`col-span-1 flex items-center justify-center rounded-full border transition-all duration-200 ${
            isAlreadyInCart
              ? 'bg-[#F4EFE6] border-[#8C6D3F] text-[#8C6D3F]'
              : 'bg-[#FAF7F2] border-[#E8E2D5] text-[#1A1817] hover:bg-white'
          }`}
        >
          {isAlreadyInCart ? <Check className="w-4 h-4 text-[#8C6D3F]" /> : <ShoppingBag className="w-4 h-4 text-[#1A1817]" />}
        </button>
      </div>
    </div>
  );
}
