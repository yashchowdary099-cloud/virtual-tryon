// FILE: frontend/src/components/Navbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, ShoppingBag, Shirt, Layers, User, LogOut } from 'lucide-react';
import { useTryOn } from '../context/TryOnContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const { cart } = useTryOn();
  const { user, isAuthenticated, logout } = useAuth();
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E8E2D5] bg-[#FAF8F5]/90 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Luxury Fashion Brand Logo: SFit */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-[#1A1817] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-5 h-5 text-[#C59B27]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-3xl font-bold tracking-tight text-[#1A1817]">
                SFit
              </span>
              <span className="text-[9px] font-black tracking-widest uppercase bg-[#F4EFE6] text-[#8C6D3F] px-2 py-0.5 rounded-full border border-[#E8E2D5]">
                AI FASHION
              </span>
            </div>
            <p className="text-[9px] text-[#6E675F] font-medium tracking-widest uppercase">Virtual Fitting Studio</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 bg-[#F4EFE6] p-1.5 rounded-full border border-[#E8E2D5]">
          <Link
            to="/"
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
              location.pathname === '/' 
                ? 'bg-[#1A1817] text-white shadow-md' 
                : 'text-[#57524A] hover:text-[#1A1817] hover:bg-white/60'
            }`}
          >
            <Shirt className="w-3.5 h-3.5" /> Garment Catalog
          </Link>

          <Link
            to="/capture"
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
              location.pathname.startsWith('/capture') || location.pathname.startsWith('/fitting') || location.pathname.startsWith('/result')
                ? 'bg-[#1A1817] text-white shadow-md' 
                : 'text-[#57524A] hover:text-[#1A1817] hover:bg-white/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Try-On Studio
          </Link>
        </nav>

        {/* User Status / Login / Logout & Bag */}
        <div className="flex items-center gap-3">
          
          {/* User Status / Login / Logout */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#2D2A26] bg-[#F4EFE6] px-3.5 py-2 rounded-full border border-[#E8E2D5] max-w-[180px] truncate" title={user?.email || user?.name}>
                <User className="w-3.5 h-3.5 text-[#8C6D3F] shrink-0" />
                <span className="truncate">{user?.email || user?.name || 'My Account'}</span>
              </span>
              <button
                onClick={logout}
                title="Log Out"
                className="p-2.5 rounded-full bg-[#F4EFE6] border border-[#E8E2D5] text-[#6E675F] hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 shadow-sm"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#1A1817] hover:bg-[#2D2A26] text-white text-xs font-bold shadow-md transition-all duration-200"
            >
              <User className="w-3.5 h-3.5 text-[#C59B27]" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Bag Button */}
          <Link
            to="/checkout"
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#E8E2D5] text-[#1A1817] hover:border-[#1A1817] transition-all duration-200 shadow-sm"
          >
            <ShoppingBag className="w-4 h-4 text-[#8C6D3F]" />
            <span className="text-xs font-bold hidden sm:inline">Bag</span>
            {totalCartItems > 0 && (
              <span className="flex items-center justify-center bg-[#1A1817] text-white text-[11px] font-bold w-5 h-5 rounded-full shadow-sm">
                {totalCartItems}
              </span>
            )}
          </Link>

        </div>

      </div>
    </header>
  );
}
