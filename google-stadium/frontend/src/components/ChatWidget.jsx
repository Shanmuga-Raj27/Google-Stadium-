import React, { useState, useEffect, useRef } from 'react';
import { MessageSquareText, X, Send } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const { user } = useAuthStore();
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    let isCancelled = false;
    
    // Dynamic protocol: Convert http/https API URL to ws/wss
    const apiUrl = import.meta.env.VITE_API_URL || "https://google-stadium-backend.onrender.com";
    const wsBase = apiUrl.endsWith('/') ? apiUrl.slice(0, -1).replace(/^http/, 'ws') : apiUrl.replace(/^http/, 'ws');
    const wsUrl = `${wsBase}/ws/chat/${user.id}`;
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      if (isCancelled) return;
      try {
        const msg = JSON.parse(event.data);
        setMessages((prev) => [...prev, msg]);
      } catch (e) {
        console.error("Failed to parse chat message", e);
      }
    };

    wsRef.current = ws;

    return () => {
      isCancelled = true;
      // Strict cleanup: nullify listener then close
      ws.onmessage = null;
      if (ws && (ws.readyState === 1 || ws.readyState === 0)) {
        ws.close();
      }
      wsRef.current = null;
    };
  }, [user]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !wsRef.current) return;
    
    const payload = {
      sender: user.username,
      role: user.role,
      message: input.trim()
    };
    
    wsRef.current.send(JSON.stringify(payload));
    setInput('');
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-googleBlue hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-105"
        >
          <MessageSquareText size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] sm:w-96 h-80 md:h-[500px] max-h-[85vh] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-googleGreen animate-pulse"></span>
              Global Chat
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-black/20">
            {messages.length === 0 ? (
              <p className="text-center text-sm text-gray-400 mt-10">No messages yet. Say hello!</p>
            ) : (
              messages.map((msg, idx) => {
                const isAdmin = msg.role === 'admin';
                const isVendor = msg.role === 'vendor';
                const isMe = msg.sender === user.username;
                
                const borderColor = isAdmin ? 'border-red-500' : (isVendor ? 'border-green-500' : 'border-blue-500');
                
                return (
                  <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 pl-1 pr-1 flex items-center gap-1">
                      {msg.sender_meta || `${msg.sender} (${msg.role})`}
                    </span>
                    <div
                      className={`px-4 py-2 rounded-2xl max-w-[85%] break-words font-normal border ${borderColor} ${
                        isAdmin 
                          ? 'bg-red-50 dark:bg-googleRed/10 text-gray-900 dark:text-gray-100'
                          : isMe
                            ? 'bg-googleBlue text-white rounded-br-none'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none shadow-sm'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-300 dark:border-gray-800">
            <form onSubmit={sendMessage} className="flex relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-transparent focus:border-googleBlue focus:ring-1 focus:ring-googleBlue rounded-xl px-4 py-3 pr-12 transition-all outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 flex items-center justify-center text-white bg-googleBlue rounded-lg hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-700 transition-colors"
              >
                <Send size={16} className="-ml-0.5 mt-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
