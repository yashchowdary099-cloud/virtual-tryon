// FILE: frontend/src/components/ChatbotWidget.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, RefreshCw, Loader2, Minus, Bot, Minimize2 } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import ChatMessage from './ChatMessage';

export default function ChatbotWidget() {
  const { isOpen, isTyping, messages, toggleChat, closeChat, sendMessage, clearChatHistory } = useChat();
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom when messages update or typing state changes
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input field when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };

  return (
    <>
      {/* FLOATING CHAT BUBBLE ICON TRIGGER BUTTON */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          aria-label="Open SFit Assistant Chat"
          className="fixed bottom-6 right-6 z-50 group flex items-center gap-2.5 p-3.5 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-xl shadow-indigo-600/40 hover:shadow-indigo-600/60 hover:scale-105 transition-all duration-300 ring-2 ring-indigo-400/40"
        >
          <div className="relative">
            <Sparkles className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-ping" />
          </div>
          <span className="text-xs font-black tracking-wider uppercase pr-1.5 hidden sm:inline font-brand">
            SFit Assistant
          </span>
        </button>
      )}

      {/* SLIDE-UP CHAT PANEL (FRAMER MOTION ANIMATED) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[390px] h-[100dvh] sm:h-[580px] max-h-[100dvh] sm:max-h-[85vh] bg-slate-950/95 backdrop-blur-2xl border-0 sm:border border-slate-800 rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* PANEL HEADER */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/30 ring-1 ring-indigo-400/30">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-brand font-black text-sm text-white tracking-tight">SFit Assistant</h4>
                    <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/30">
                      ONLINE
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold">AI Shopping & CM Size Helper</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  onClick={clearChatHistory}
                  title="Clear Chat History"
                  className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all text-xs"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={closeChat}
                  title="Close Assistant"
                  className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all text-xs"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* MESSAGES SCROLL AREA */}
            <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {/* TYPING INDICATOR */}
              {isTyping && (
                <div className="flex items-center gap-2 text-slate-400 text-xs py-2 px-3 bg-slate-900/80 rounded-2xl w-fit border border-slate-800 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  <span className="font-medium text-[11px]">SFit Assistant is thinking...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* INPUT BAR */}
            <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
              <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-2xl focus-within:border-indigo-500/60 transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask SFit Assistant (e.g. Find size for 108 cm)..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full bg-transparent pl-4 pr-12 py-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="absolute right-2 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition-all shadow-md shadow-indigo-600/30"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
