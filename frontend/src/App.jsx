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
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TryOnProvider>
          <ChatProvider>
            <Router>
              <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-300">
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
                <footer className="border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 py-8 text-center text-xs text-slate-500 transition-colors duration-300">
                  <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-400">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="font-brand font-black text-slate-900 dark:text-white text-sm">SFit</span> AI 3D Virtual Garment Try-On Platform
                    </div>
                    <p>© {new Date().getFullYear()} SFit Inc. All rights reserved. Indian Rupee (₹) Pricing.</p>
                  </div>
                </footer>
              </div>
            </Router>
          </ChatProvider>
        </TryOnProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
