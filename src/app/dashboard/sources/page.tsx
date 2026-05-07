'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Source } from '@/lib/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  Plus, 
  Globe, 
  FileText, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<'url' | 'text'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [textName, setTextName] = useState('');
  const [adding, setAdding] = useState(false);
  const [chatbotId, setChatbotId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadSources();
  }, []);

  async function loadSources() {
    // Check for demo mode
    const isDemo = document.cookie.includes('demo_mode=true') || 
                   window.location.search.includes('demo=true');
    
    if (isDemo) {
      const demoSources: Source[] = [
        {
          id: 'demo-src-1',
          chatbot_id: 'demo-bot',
          type: 'url',
          name: 'Company FAQ',
          url: 'https://example.com/faq',
          status: 'ready',
          chunk_count: 24,
          created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'demo-src-2',
          chatbot_id: 'demo-bot',
          type: 'url',
          name: 'Pricing Page',
          url: 'https://example.com/pricing',
          status: 'ready',
          chunk_count: 8,
          created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: 'demo-src-3',
          chatbot_id: 'demo-bot',
          type: 'text',
          name: 'Return Policy',
          status: 'ready',
          chunk_count: 3,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      setSources(demoSources);
      setChatbotId('demo-bot');
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: chatbots } = await (supabase.from('chatbots') as any)
      .select('id')
      .eq('user_id', user.id);

    if (!chatbots || chatbots.length === 0) {
      setLoading(false);
      return;
    }

    const botId = chatbots[0].id;
    setChatbotId(botId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: sourcesData } = await (supabase.from('sources') as any)
      .select('*')
      .eq('chatbot_id', botId)
      .order('created_at', { ascending: false });

    if (sourcesData) {
      setSources(sourcesData);
    }
    setLoading(false);
  }

  async function addSource() {
    if (!chatbotId) return;
    setAdding(true);

    try {
      if (addType === 'url') {
        const response = await fetch('/api/sources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatbotId,
            type: 'url',
            url: urlInput,
          }),
        });

        if (!response.ok) throw new Error('Failed to add source');
      } else {
        const response = await fetch('/api/sources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatbotId,
            type: 'text',
            name: textName,
            content: textInput,
          }),
        });

        if (!response.ok) throw new Error('Failed to add source');
      }

      setShowAddModal(false);
      setUrlInput('');
      setTextInput('');
      setTextName('');
      loadSources();
    } catch (error) {
      console.error('Error adding source:', error);
    } finally {
      setAdding(false);
    }
  }

  async function deleteSource(sourceId: string) {
    if (!confirm('Are you sure you want to delete this source?')) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('chunks') as any).delete().eq('source_id', sourceId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('sources') as any).delete().eq('id', sourceId);
    loadSources();
  }

  async function refreshSource(sourceId: string) {
    await fetch('/api/sources/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceId }),
    });
    loadSources();
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-[var(--success)]" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-[var(--primary)] animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-[var(--error)]" />;
      default:
        return <Loader2 className="w-4 h-4 text-[var(--text-tertiary)]" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready': return 'Ready';
      case 'processing': return 'Processing...';
      case 'error': return 'Error';
      default: return 'Pending';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Knowledge Base</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Add content to train your chatbot. It will use this information to answer customer questions.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Source
        </Button>
      </div>

      {sources.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--surface-tertiary)] flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-[var(--text-tertiary)]" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">No knowledge sources yet</h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto mb-6">
              Add your website, FAQs, or documents to train your chatbot.
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Source
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sources.map((source) => (
            <Card key={source.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--surface-tertiary)] flex items-center justify-center">
                      {source.type === 'url' ? (
                        <Globe className="w-5 h-5 text-[var(--text-secondary)]" />
                      ) : (
                        <FileText className="w-5 h-5 text-[var(--text-secondary)]" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-[var(--text-primary)]">{source.name}</div>
                      {source.url && (
                        <div className="text-sm text-[var(--text-secondary)] truncate max-w-md">
                          {source.url}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    {getStatusIcon(source.status)}
                    <span className="text-[var(--text-secondary)]">{getStatusText(source.status)}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-[var(--text-tertiary)]">
                    {source.chunk_count} chunks
                    {source.error_message && (
                      <span className="text-[var(--error)] ml-2">{source.error_message}</span>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    {source.type === 'url' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => refreshSource(source.id)}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSource(source.id)}
                      className="text-[var(--error)] hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl animate-fade-in">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Add Knowledge Source</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-[var(--surface-tertiary)] rounded"
              >
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Type Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setAddType('url')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    addType === 'url'
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--surface-tertiary)] text-[var(--text-secondary)] hover:bg-gray-200'
                  }`}
                >
                  Website URL
                </button>
                <button
                  onClick={() => setAddType('text')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    addType === 'text'
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--surface-tertiary)] text-[var(--text-secondary)] hover:bg-gray-200'
                  }`}
                >
                  Text Content
                </button>
              </div>

              {addType === 'url' ? (
                <div>
                  <Input
                    label="Website URL"
                    type="url"
                    placeholder="https://example.com/faq"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                  <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
                    We will crawl this URL and extract content for training.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Input
                    label="Name"
                    type="text"
                    placeholder="FAQ, Product Info, etc."
                    value={textName}
                    onChange={(e) => setTextName(e.target.value)}
                  />
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                      Content
                    </label>
                    <textarea
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] resize-none"
                      rows={6}
                      placeholder="Paste your FAQ content, product information, or any text you want your chatbot to know..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={addSource}
                loading={adding}
                disabled={addType === 'url' ? !urlInput : !textName || !textInput}
              >
                Add Source
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
