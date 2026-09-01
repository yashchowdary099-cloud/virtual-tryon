// FILE: frontend/src/context/ChatContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { sendChatMessage } from '../api/chatbot';
import { useTryOn } from './TryOnContext';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { cart, userMeasurements, selectedProduct, updateUserMeasurements } = useTryOn();

  const [messages, setMessages] = useState([
    {
      id: 'msg_welcome',
      sender: 'bot',
      text: "👋 Hi! I'm **SFit Assistant**. I can help you find shirts & tops, calculate your exact size in CM, check your bag, or guide 3D virtual try-on!\n\nWhat can I help you with today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickReplies: ["Show shirts under ₹1000", "Find my size in CM", "How does 3D try-on work?", "What's in my bag?"]
    }
  ]);

  const toggleChat = () => setIsOpen(prev => !prev);
  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);

  const sendMessage = async (inputMsg) => {
    if (!inputMsg || !inputMsg.trim()) return;

    const userText = inputMsg.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp: timeStr
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await sendChatMessage({
        message: userText,
        cart,
        userMeasurements,
        currentProduct: selectedProduct
      });

      setIsTyping(false);

      const botMsg = {
        id: 'msg_bot_' + Date.now(),
        sender: 'bot',
        text: response.text || "I'm here to help you find clothes, calculate your size in CM, or check your order!",
        products: response.products || null,
        quickReplies: response.quickReplies || [],
        sizeRecommendation: response.sizeRecommendation || null,
        showHumanAgent: response.showHumanAgent || false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);

      // If response has size calculation recommendation, offer auto-fill
      if (response.sizeRecommendation && response.sizeRecommendation.chestCm) {
        updateUserMeasurements({
          chestCm: response.sizeRecommendation.chestCm,
          userSize: response.sizeRecommendation.recommendedSize
        });
      }

    } catch (err) {
      console.error('Chat error:', err);
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: 'msg_err_' + Date.now(),
          sender: 'bot',
          text: "I encountered a minor glitch. Please try asking again!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const clearChatHistory = () => {
    setMessages([
      {
        id: 'msg_welcome_' + Date.now(),
        sender: 'bot',
        text: "Chat cleared! How can I assist you with your fashion shopping?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: ["Show shirts under ₹1000", "Find my size in CM", "What's in my bag?"]
      }
    ]);
  };

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        isTyping,
        messages,
        toggleChat,
        openChat,
        closeChat,
        sendMessage,
        clearChatHistory
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
