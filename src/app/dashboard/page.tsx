'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Conversation, Message } from '@/lib/supabase/types';
import { Card } from '@/components/ui/card';
import { Inbox, MessageCircle, User, Bot } from 'lucide-react';

interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export default function InboxPage() {
  const [conversations, setConversations] = useState<ConversationWithMessages[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithMessages | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadConversations() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: chatbots } = await (supabase.from('chatbots') as any)
        .select('id')
        .eq('user_id', user.id);

      if (!chatbots || chatbots.length === 0) {
        setLoading(false);
        return;
      }

      const chatbotId = chatbots[0].id;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: convos } = await (supabase.from('conversations') as any)
        .select('*, messages(*)')
        .eq('chatbot_id', chatbotId)
        .order('updated_at', { ascending: false });

      if (convos) {
        setConversations(convos as ConversationWithMessages[]);
        if (convos.length > 0) {
          setSelectedConversation(convos[0] as ConversationWithMessages);
        }
      }
      setLoading(false);
    }

    loadConversations();
  }, [supabase]);

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-700';
      case 'resolved': return 'bg-gray-100 text-gray-600';
      case 'escalated': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-48px)]">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-48px)] text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--surface-tertiary)] flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8 text-[var(--text-tertiary)]" />
        </div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">No conversations yet</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-sm">
          Once customers start chatting with your bot, their conversations will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-48px)] -m-6">
      {/* Conversation List */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-[var(--text-primary)]">Conversations</h2>
          <p className="text-sm text-[var(--text-secondary)]">{conversations.length} total</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={`
                w-full p-4 text-left border-b border-gray-100
                hover:bg-[var(--surface-secondary)] transition-colors
                ${selectedConversation?.id === conv.id ? 'bg-[var(--primary-light)] border-l-2 border-l-[var(--primary)]' : ''}
              `}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--surface-tertiary)] flex-shrink-0 flex items-center justify-center">
                  <User className="w-5 h-5 text-[var(--text-tertiary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-[var(--text-primary)] truncate">
                      {conv.visitor_email || `Visitor ${conv.visitor_id.slice(0, 8)}`}
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)]">{formatTime(conv.updated_at)}</span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] truncate">
                    {conv.messages?.[conv.messages.length - 1]?.content || 'No messages'}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Conversation View */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="h-16 px-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--surface-tertiary)] flex items-center justify-center">
                  <User className="w-5 h-5 text-[var(--text-tertiary)]" />
                </div>
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">
                    {selectedConversation.visitor_email || `Visitor ${selectedConversation.visitor_id.slice(0, 8)}`}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    Started {formatTime(selectedConversation.created_at)}
                  </div>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(selectedConversation.status)}`}>
                {selectedConversation.status}
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[var(--surface-secondary)]">
              {selectedConversation.messages
                ?.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                .map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {msg.role !== 'user' && (
                      <div className="w-6 h-6 rounded-full bg-[var(--primary-light)] flex-shrink-0 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-[var(--primary)]" />
                      </div>
                    )}
                    <div
                      className={`
                        max-w-[70%] px-4 py-2.5 rounded-2xl text-sm
                        ${msg.role === 'user'
                          ? 'bg-[var(--primary)] text-white rounded-br-sm'
                          : 'bg-[var(--chat-bot)] text-[var(--text-primary)] rounded-bl-sm'
                        }
                      `}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-2" />
              <p className="text-[var(--text-secondary)]">Select a conversation to view</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
