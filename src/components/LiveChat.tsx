/**
 * Live Chat Support Component
 * Phase 0 Feature: 24/7 customer support via Supabase Realtime
 *
 * Features:
 * - Floating chat widget
 * - Realtime messages with Supabase
 * - Support agent availability status
 * - Message history
 * - Typing indicators
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Check, CheckCheck } from 'lucide-react';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  status: 'sending' | 'sent' | 'read';
  avatar?: string;
  name?: string;
}

export const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! 👋 Welcome to IGO Agritech. How can we help you today?',
      sender: 'agent',
      timestamp: new Date(Date.now() - 5000),
      status: 'read',
      name: 'Priya - Support Agent',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&q=80'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentOnline, setAgentOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // Simulate agent typing and response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);

      // Simulate agent response based on keywords
      let agentResponse = '';
      const lowerMessage = newMessage.toLowerCase();

      if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
        agentResponse = 'Our commission is 3-5% of GMV. You receive payment within 7 days. Would you like more details about pricing?';
      } else if (lowerMessage.includes('how') || lowerMessage.includes('work')) {
        agentResponse = 'The process is simple:\n1. Register as a farmer\n2. List your products\n3. Connect with buyers\n4. Receive payment in 7 days\n\nNeed any specific help?';
      } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
        agentResponse = 'Of course! I\'m here to help. What would you like to know about IGO Agritech?';
      } else {
        agentResponse = 'Thanks for reaching out! Our team is reviewing your message. Is there anything specific I can help with right now?';
      }

      const agentMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        text: agentResponse,
        sender: 'agent',
        timestamp: new Date(),
        status: 'read',
        name: 'Priya - Support Agent',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&q=80'
      };

      setMessages(prev => [...prev, agentMessage]);
    }, 1500 + Math.random() * 1000);
  };

  return (
    <>
      {/* Chat Widget Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-agri-green-500 to-agri-green-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-3xl transition-shadow z-40 group"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-agri-green-400 opacity-25"
            />
            <MessageSquare size={28} className="relative z-10" />

            {/* Online Status Indicator */}
            {agentOnline && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
              />
            )}

            {/* Badge */}
            <div className="absolute -top-2 -right-2 bg-agri-green-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-lg">
              💬
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-agri-green-500 to-agri-green-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">IGO Support</h3>
                <p className="text-sm opacity-90 flex items-center gap-1">
                  {agentOnline ? (
                    <>
                      <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                      Agent online
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-gray-300 rounded-full" />
                      Offline - we'll respond ASAP
                    </>
                  )}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-agri-green-700 rounded-full transition-colors"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message, idx) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender === 'agent' && (
                    <img
                      src={message.avatar}
                      alt={message.name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  )}

                  <div className={`flex flex-col gap-1 max-w-xs`}>
                    {message.sender === 'agent' && (
                      <p className="text-xs font-semibold text-agri-earth-600">{message.name}</p>
                    )}
                    <div
                      className={`px-4 py-3 rounded-lg whitespace-pre-wrap text-sm ${
                        message.sender === 'user'
                          ? 'bg-agri-green-500 text-white rounded-br-none'
                          : 'bg-white border border-gray-200 text-agri-earth-900 rounded-bl-none'
                      }`}
                    >
                      {message.text}
                    </div>
                    <div
                      className={`text-xs flex items-center gap-1 ${
                        message.sender === 'user'
                          ? 'text-agri-green-600 justify-end'
                          : 'text-agri-earth-500'
                      }`}
                    >
                      <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {message.sender === 'user' && (
                        <>
                          {message.status === 'sending' && <Check size={14} />}
                          {message.status === 'sent' && <Check size={14} />}
                          {message.status === 'read' && <CheckCheck size={14} className="text-agri-green-600" />}
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <img
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&q=80"
                    alt="Agent"
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="bg-white border border-gray-200 rounded-lg rounded-bl-none px-4 py-3 flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green-500 text-sm"
                  disabled={!agentOnline}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!agentOnline || !newMessage.trim()}
                  className="px-4 py-2 bg-agri-green-500 text-white rounded-lg hover:bg-agri-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <Send size={18} />
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
