// FILE: frontend/src/components/ChatMessage.jsx
import React from 'react';
import { Sparkles, ArrowRight, User, Bot, Check, ShoppingBag, Headset } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTryOn } from '../context/TryOnContext';
import { useChat } from '../context/ChatContext';

export default function ChatMessage({ message }) {
  const isBot = message.sender === 'bot';
  const navigate = useNavigate();
  const { selectProductForTryOn } = useTryOn();
  const { sendMessage, closeChat } = useChat();

  const handleTryOnProduct = (product) => {
    selectProductForTryOn(product);
    closeChat();
    navigate('/capture');
  };

  const handleQuickReplyClick = (chipText) => {
    sendMessage(chipText);
  };

  // Helper to format simple markdown bolding **text**
  const renderFormattedText = (txt) => {
    if (!txt) return null;
    const parts = txt.split('\n').map((line, i) => {
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <span
          key={i}
          dangerouslySetInnerHTML={{ __html: formattedLine }}
          className="block mb-1 last:mb-0 leading-relaxed"
        />
      );
    });
    return parts;
  };

  return (
    <div className={`flex flex-col mb-4 ${isBot ? 'items-start' : 'items-end'}`}>
      
      <div className={`flex items-end gap-2 max-w-[85%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-md ${
          isBot 
            ? 'bg-gradient-to-tr from-indigo-600 to-pink-500 text-white' 
            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
        }`}>
          {isBot ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </div>

        {/* Message Bubble Body */}
        <div className={`p-3.5 rounded-2xl text-xs shadow-md ${
          isBot
            ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm'
            : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white rounded-br-none'
        }`}>
          {renderFormattedText(message.text)}

          {/* Embedded Mini Product Cards */}
          {message.products && message.products.length > 0 && (
            <div className="mt-3 space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
              {message.products.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-all shadow-sm"
                >
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-12 h-14 object-contain bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-800"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{prod.brand}</span>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">{prod.name}</h5>
                    <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">₹{prod.price?.toLocaleString('en-IN')}</p>
                  </div>
                  <button
                    onClick={() => handleTryOnProduct(prod)}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black shadow transition-all flex items-center gap-1 shrink-0"
                  >
                    <Sparkles className="w-3 h-3" /> Try On
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Mock Human Agent Support Action */}
          {message.showHumanAgent && (
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => sendMessage("Talk to Support Agent")}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/20 text-xs font-bold transition-all"
              >
                <Headset className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> Connect to Live Support Agent
              </button>
            </div>
          )}

          {/* Timestamp */}
          <span className={`block text-[9px] mt-1.5 text-right font-medium ${isBot ? 'text-slate-400 dark:text-slate-500' : 'text-indigo-200'}`}>
            {message.timestamp}
          </span>
        </div>

      </div>

      {/* Suggestion Quick Reply Chips */}
      {isBot && message.quickReplies && message.quickReplies.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2.5 ml-9 max-w-[85%]">
          {message.quickReplies.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickReplyClick(chip)}
              className="px-3 py-1 rounded-full bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-600/30 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-200 transition-all active:scale-95 shadow-sm"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
