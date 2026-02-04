'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Minus } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatWidgetProps {
  botId: string;
  primaryColor?: string;
  greeting?: string;
  companyName?: string;
}

export function ChatWidget({ 
  botId, 
  primaryColor = '#6366F1',
  greeting = 'Hi! How can I help you today?',
  companyName = 'Support'
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [visitorId] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cbp_visitor_id');
      if (stored) return stored;
      const newId = Math.random().toString(36).substring(2);
      localStorage.setItem('cbp_visitor_id', newId);
      return newId;
    }
    return 'anonymous';
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'greeting',
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
      }]);
    }
  }, [isOpen, greeting, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botId,
          conversationId,
          visitorId,
          message: userMessage.content,
        }),
      });

      const data = await response.json();

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Sorry, I had trouble processing that. Please try again.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again later.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
          style={{ backgroundColor: primaryColor }}
        >
          <MessageSquare className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div
          className="fixed bottom-5 right-5 z-50 w-[380px] h-[600px] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden animate-slide-up"
          style={{ boxShadow: '0 0 40px rgba(0, 0, 0, 0.12)' }}
        >
          {/* Header */}
          <div 
            className="h-14 px-4 flex items-center justify-between flex-shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-sm text-white">{companyName}</div>
                <div className="text-xs text-white/80">Usually replies instantly</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded transition-colors"
              >
                <Minus className="w-5 h-5 text-white" />
              </button>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  setMessages([]);
                  setConversationId(null);
                }}
                className="p-1.5 hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <div 
                    className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  >
                    <Bot className="w-4 h-4" style={{ color: primaryColor }} />
                  </div>
                )}
                <div
                  className={`max-w-[280px] px-4 py-2.5 text-sm ${
                    msg.role === 'user'
                      ? 'text-white rounded-2xl rounded-br-sm'
                      : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-sm'
                  }`}
                  style={msg.role === 'user' ? { backgroundColor: primaryColor } : undefined}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-end gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <Bot className="w-4 h-4" style={{ color: primaryColor }} />
                </div>
                <div className="px-4 py-3 bg-gray-100 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-dot" style={{ animationDelay: '-0.3s' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-dot" style={{ animationDelay: '-0.15s' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-dot" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-20"
                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                placeholder="Type your message..."
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
