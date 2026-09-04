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
      
      <div className={`flex items-end gap-2 max-w-[88%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm ${
          isBot 
            ? 'bg-[#1A1817] text-white' 
            : 'bg-[#F4EFE6] text-[#1A1817] border border-[#E8E2D5]'
        }`}>
          {isBot ? <Sparkles className="w-3.5 h-3.5 text-[#C59B27]" /> : <User className="w-3.5 h-3.5 text-[#8C6D3F]" />}
        </div>

        {/* Message Bubble Body */}
        <div className={`p-3.5 rounded-2xl text-xs shadow-sm ${
          isBot
            ? 'bg-white border border-[#E8E2D5] text-[#1A1817] rounded-bl-none'
            : 'bg-[#1A1817] text-white rounded-br-none'
        }`}>
          {renderFormattedText(message.text)}

          {/* Embedded Mini Product Cards */}
          {message.products && message.products.length > 0 && (
            <div className="mt-3 space-y-2 border-t border-[#E8E2D5] pt-3">
              {message.products.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center gap-3 p-2 rounded-xl bg-[#FAF7F2] border border-[#E8E2D5] hover:border-[#1A1817] transition-all shadow-sm"
                >
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-12 h-14 object-contain bg-white rounded-lg p-1 border border-[#E8E2D5]"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-bold text-[#8C6D3F] uppercase tracking-wider">{prod.brand}</span>
                    <h5 className="font-serif text-xs font-bold text-[#1A1817] truncate">{prod.name}</h5>
                    <p className="text-xs font-black text-[#1A1817] mt-0.5">₹{prod.price?.toLocaleString('en-IN')}</p>
                  </div>
                  <button
                    onClick={() => handleTryOnProduct(prod)}
                    className="px-3 py-1.5 rounded-full bg-[#1A1817] hover:bg-[#2D2A26] text-white text-[10px] font-bold shadow transition-all flex items-center gap-1 shrink-0"
                  >
                    <Sparkles className="w-3 h-3 text-[#C59B27]" /> Try On
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Mock Human Agent Support Action */}
          {message.showHumanAgent && (
            <div className="mt-3 pt-2 border-t border-[#E8E2D5]">
              <button
                onClick={() => sendMessage("Talk to Support Agent")}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-[#F4EFE6] border border-[#E8E2D5] text-[#1A1817] hover:bg-[#E8E2D5] text-xs font-bold transition-all"
              >
                <Headset className="w-3.5 h-3.5 text-[#8C6D3F]" /> Connect to Live Support Agent
              </button>
            </div>
          )}

          {/* Timestamp */}
          <span className={`block text-[9px] mt-1.5 text-right font-medium ${isBot ? 'text-[#9E968B]' : 'text-slate-300'}`}>
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
              className="px-3 py-1 rounded-full bg-white hover:bg-[#FAF7F2] border border-[#E8E2D5] text-[11px] font-semibold text-[#57524A] hover:text-[#1A1817] transition-all active:scale-95 shadow-sm"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
