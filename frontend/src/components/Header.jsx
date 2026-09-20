import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, User, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="w-full border-b border-[#E8E2D5] bg-[#FAF8F5]/90 backdrop-blur-md px-4 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Link */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#1A1817] flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4 text-[#C59B27]" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-[#1A1817]">
            TrueFit
          </span>
        </Link>

        {/* User Auth Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[#1A1817] flex items-center gap-1.5 bg-[#F4EFE6] px-3.5 py-1.5 rounded-full border border-[#E8E2D5]">
                <User className="w-3.5 h-3.5 text-[#8C6D3F]" />
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-bold text-[#6E675F] hover:text-rose-600 bg-white hover:bg-rose-50 px-3.5 py-1.5 rounded-full border border-[#E8E2D5] transition-all shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1A1817] hover:bg-[#2D2A26] text-white text-xs font-bold shadow-md transition-all"
            >
              <LogIn className="w-3.5 h-3.5 text-[#C59B27]" />
              Log In
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
