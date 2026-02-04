'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Chatbot } from '@/lib/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MessageSquare, Send, Bot } from 'lucide-react';

const colorPresets = [
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#06B6D4', // Cyan
];

export default function WidgetPage() {
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [name, setName] = useState('');
  const [greeting, setGreeting] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6366F1');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadChatbot();
  }, []);

  async function loadChatbot() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('chatbots') as any)
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setChatbot(data as Chatbot);
      setName(data.name);
      setGreeting(data.greeting);
      setPrimaryColor(data.primary_color);
    }
  }

  async function saveSettings() {
    if (!chatbot) return;
    setSaving(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('chatbots') as any)
      .update({
        name,
        greeting,
        primary_color: primaryColor,
        updated_at: new Date().toISOString(),
      })
      .eq('id', chatbot.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Widget Customization</h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Customize how your chatbot looks on your website.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Settings */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-[var(--text-primary)]">Settings</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label="Company Name"
              placeholder="Acme Inc"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Greeting Message
              </label>
              <textarea
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] resize-none"
                rows={3}
                placeholder="Hi! How can I help you today?"
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
                Primary Color
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {colorPresets.map((color) => (
                  <button
                    key={color}
                    onClick={() => setPrimaryColor(color)}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                      primaryColor === color ? 'ring-2 ring-offset-2 ring-[var(--primary)]' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 font-mono"
                />
              </div>
            </div>

            <Button onClick={saveSettings} loading={saving} className="w-full">
              {saved ? 'Saved!' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <div>
          <div className="text-sm font-medium text-[var(--text-primary)] mb-3">Preview</div>
          <div className="bg-[var(--surface-tertiary)] rounded-xl p-4 h-[500px] relative">
            {/* Widget Preview */}
            <div 
              className="absolute bottom-4 right-4 w-[340px] rounded-2xl shadow-xl overflow-hidden"
              style={{ boxShadow: '0 0 40px rgba(0, 0, 0, 0.12)' }}
            >
              {/* Header */}
              <div 
                className="h-14 px-4 flex items-center gap-3"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-white">{name || 'Support'}</div>
                  <div className="text-xs text-white/80">Usually replies instantly</div>
                </div>
              </div>

              {/* Messages */}
              <div className="bg-[var(--surface-secondary)] p-4 h-[300px] space-y-3">
                {/* Bot greeting */}
                <div className="flex items-end gap-2">
                  <div 
                    className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  >
                    <Bot className="w-4 h-4" style={{ color: primaryColor }} />
                  </div>
                  <div className="max-w-[240px] px-4 py-2.5 bg-[var(--chat-bot)] text-[var(--text-primary)] rounded-2xl rounded-bl-sm text-sm">
                    {greeting || 'Hi! How can I help you today?'}
                  </div>
                </div>

                {/* Sample user message */}
                <div className="flex justify-end">
                  <div 
                    className="max-w-[240px] px-4 py-2.5 text-white rounded-2xl rounded-br-sm text-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    What are your business hours?
                  </div>
                </div>

                {/* Sample bot response */}
                <div className="flex items-end gap-2">
                  <div 
                    className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  >
                    <Bot className="w-4 h-4" style={{ color: primaryColor }} />
                  </div>
                  <div className="max-w-[240px] px-4 py-2.5 bg-[var(--chat-bot)] text-[var(--text-primary)] rounded-2xl rounded-bl-sm text-sm">
                    We are open Monday through Friday, 9 AM to 6 PM EST. Is there anything specific I can help you with?
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="bg-white p-3 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-2.5 bg-[var(--surface-tertiary)] rounded-full text-sm text-[var(--text-tertiary)]">
                    Type your message...
                  </div>
                  <button 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bubble */}
            <div
              className="absolute bottom-4 right-[380px] w-14 h-14 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
