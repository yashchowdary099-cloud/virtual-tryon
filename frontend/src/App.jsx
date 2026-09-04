// FILE: frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Catalog from './pages/Catalog';
import BodyCapture from './pages/BodyCapture';
import FittingProcess from './pages/FittingProcess';
import FitResult from './pages/FitResult';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import ChatbotWidget from './components/ChatbotWidget';
import { TryOnProvider } from './context/TryOnContext';
import { ChatProvider } from './context/ChatContext';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <TryOnProvider>
        <ChatProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1A1817] selection:bg-[#8C6D3F] selection:text-white">
              <Navbar />
              
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Catalog />} />
                  <Route path="/capture" element={<BodyCapture />} />
                  <Route path="/fitting" element={<FittingProcess />} />
                  <Route path="/result" element={<FitResult />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/login" element={<Login />} />
                </Routes>
              </main>

              {/* Global AI Assistant Floating Chatbot Widget */}
              <ChatbotWidget />

              {/* Footer */}
              <footer className="border-t border-[#E8E2D5] bg-[#FAF7F2] py-8 text-center text-xs text-[#6E675F]">
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 font-bold text-[#1A1817]">
                    <span className="w-2 h-2 rounded-full bg-[#8C6D3F]" />
                    <span className="font-serif font-bold text-[#1A1817] text-sm">SFit</span> AI Virtual Garment Fitting Studio
                  </div>
                  <p>© {new Date().getFullYear()} SFit Virtual Try-On. All rights reserved.</p>
                </div>
              </footer>
            </div>
          </Router>
        </ChatProvider>
      </TryOnProvider>
    </AuthProvider>
  );
}
