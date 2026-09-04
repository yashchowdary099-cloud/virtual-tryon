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
      {/* FLOATING CHAT BUBBLE TRIGGER BUTTON */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          aria-label="Open SFit Assistant Chat"
          className="fixed bottom-6 right-6 z-50 group flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-[#1A1817] text-white shadow-xl hover:scale-105 transition-all duration-300 border border-[#E8E2D5]"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-[#C59B27] animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#C59B27] ring-2 ring-[#1A1817] animate-ping" />
          </div>
          <span className="text-xs font-bold tracking-wider uppercase hidden sm:inline">
            SFit Fashion Assistant
          </span>
        </button>
      )}

      {/* SLIDE-UP CHAT PANEL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[390px] h-[100dvh] sm:h-[580px] max-h-[100dvh] sm:max-h-[85vh] bg-white border-0 sm:border border-[#E8E2D5] rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#1A1817]"
          >
            {/* PANEL HEADER */}
            <div className="p-4 bg-[#FAF7F2] border-b border-[#E8E2D5] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-full bg-[#1A1817] flex items-center justify-center text-white shadow-sm">
                  <Sparkles className="w-4 h-4 text-[#C59B27]" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#C59B27] ring-2 ring-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-serif text-base font-bold text-[#1A1817] tracking-tight">SFit AI Stylist</h4>
                    <span className="text-[9px] font-extrabold text-[#8C6D3F] bg-[#F4EFE6] px-1.5 py-0.2 rounded border border-[#E8E2D5]">
                      ONLINE
                    </span>
                  </div>
                  <p className="text-[10px] text-[#6E675F] font-semibold">Shopping & Size Calculator</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 text-[#6E675F]">
                <button
                  onClick={clearChatHistory}
                  title="Clear Chat History"
                  className="p-1.5 rounded-full hover:bg-white hover:text-[#1A1817] transition-all text-xs"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={closeChat}
                  title="Close Assistant"
                  className="p-1.5 rounded-full hover:bg-white hover:text-[#1A1817] transition-all text-xs"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* MESSAGES SCROLL AREA */}
            <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-[#FAF8F5]">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {/* TYPING INDICATOR */}
              {isTyping && (
                <div className="flex items-center gap-2 text-[#6E675F] text-xs py-2 px-3 bg-white rounded-2xl w-fit border border-[#E8E2D5] shadow-sm animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-[#C59B27] animate-spin" />
                  <span className="font-medium text-[11px]">SFit Stylist is finding recommendations...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* INPUT BAR */}
            <form onSubmit={handleSend} className="p-3 bg-[#FAF7F2] border-t border-[#E8E2D5] shrink-0">
              <div className="relative flex items-center bg-white border border-[#E8E2D5] rounded-full focus-within:border-[#1A1817] transition-all shadow-sm">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask SFit Stylist (e.g. Find Levi's under ₹2500)..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full bg-transparent pl-4 pr-12 py-3 text-xs text-[#1A1817] placeholder-[#9E968B] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="absolute right-1.5 p-2 rounded-full bg-[#1A1817] hover:bg-[#2D2A26] disabled:opacity-40 text-white transition-all shadow-sm"
                >
                  <Send className="w-3.5 h-3.5 text-[#C59B27]" />
                </button>
              </div>
            </form>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
