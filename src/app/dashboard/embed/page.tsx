'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Chatbot } from '@/lib/supabase/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Code } from 'lucide-react';

export default function EmbedPage() {
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadChatbot();
  }, []);

  async function loadChatbot() {
    // Check for demo mode
    const isDemo = document.cookie.includes('demo_mode=true') || 
                   window.location.search.includes('demo=true');
    
    if (isDemo) {
      const demoChatbot: Chatbot = {
        id: 'demo-bot-abc123',
        user_id: 'demo-user',
        name: 'Support Bot',
        greeting: 'Hi! How can I help you today?',
        primary_color: '#6366F1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setChatbot(demoChatbot);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('chatbots') as any)
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setChatbot(data as Chatbot);
    }
  }

  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://your-domain.com';

  const embedCode = chatbot ? `<!-- ChatBot Pro Widget -->
<script>
  (function(w, d, s, o, f, js, fjs) {
    w['ChatBotPro'] = o;
    w[o] = w[o] || function() { (w[o].q = w[o].q || []).push(arguments) };
    js = d.createElement(s); fjs = d.getElementsByTagName(s)[0];
    js.id = o; js.src = f; js.async = 1;
    fjs.parentNode.insertBefore(js, fjs);
  }(window, document, 'script', 'cbp', '${baseUrl}/widget.js'));
  cbp('init', { botId: '${chatbot.id}' });
</script>` : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Embed Code</h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Add your chatbot to any website with a single line of code.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-[var(--text-secondary)]" />
            <h2 className="font-semibold text-[var(--text-primary)]">Installation Script</h2>
          </div>
          <Button variant="secondary" size="sm" onClick={copyToClipboard}>
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Code
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          <pre className="bg-[var(--surface-tertiary)] p-4 rounded-lg overflow-x-auto text-sm font-mono text-[var(--text-primary)]">
            {embedCode}
          </pre>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <h2 className="font-semibold text-[var(--text-primary)]">Installation Instructions</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center font-semibold text-sm flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="font-medium text-[var(--text-primary)]">Copy the code</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Click the &quot;Copy Code&quot; button above to copy the installation script.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center font-semibold text-sm flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="font-medium text-[var(--text-primary)]">Paste before closing body tag</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Add the script to your website, just before the closing <code className="bg-[var(--surface-tertiary)] px-1 py-0.5 rounded text-xs">&lt;/body&gt;</code> tag.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center font-semibold text-sm flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="font-medium text-[var(--text-primary)]">That&apos;s it!</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                The chat widget will appear on your website. Customize colors and greeting in the Widget settings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 border-[var(--info)] bg-blue-50">
        <CardContent className="py-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--info)] text-white flex items-center justify-center flex-shrink-0">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-medium text-[var(--text-primary)]">Need help with installation?</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Works with WordPress, Shopify, Webflow, Squarespace, and any HTML website. Contact support if you need help with your specific platform.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
