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
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Stylish Brand Logo: SFit */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300 ring-2 ring-indigo-500/30">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-brand text-3xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-200 to-pink-400 bg-clip-text text-transparent">
                SFit
              </span>
              <span className="text-[10px] font-black tracking-widest uppercase bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/40 shadow-sm">
                3D AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Virtual Garment Fitting</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
          <Link
            to="/"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${
              location.pathname === '/' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Shirt className="w-4 h-4" /> Garment Catalog
          </Link>

          <Link
            to="/capture"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${
              location.pathname.startsWith('/capture') || location.pathname.startsWith('/fitting') || location.pathname.startsWith('/result')
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4" /> Try-On Studio
          </Link>
        </nav>

        {/* User Status / Login / Logout & Bag */}
        <div className="flex items-center gap-3">
          
          {/* User Status / Login / Logout */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 shadow-sm max-w-[180px] truncate" title={user?.email || user?.name}>
                <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">{user?.email || user?.name || 'My Account'}</span>
              </span>
              <button
                onClick={logout}
                title="Log Out"
                className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white transition-all duration-200 shadow-sm"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md shadow-indigo-600/30 transition-all duration-200"
            >
              <User className="w-4 h-4" />
              <span>Login</span>
            </Link>
          )}

          {/* Bag Button */}
          <Link
            to="/checkout"
            className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:border-indigo-500/50 hover:text-white transition-all duration-200"
          >
            <ShoppingBag className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-extrabold hidden sm:inline">Bag</span>
            {totalCartItems > 0 && (
              <span className="flex items-center justify-center bg-indigo-600 text-white text-xs font-bold w-5 h-5 rounded-full shadow-md shadow-indigo-600/40">
                {totalCartItems}
              </span>
            )}
          </Link>

        </div>

      </div>
    </header>
  );
}
