import { createClient } from '@supabase/supabase-js';
import { ChatWidget } from '@/components/widget/ChatWidget';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }
  return createClient(url, key);
}

interface Props {
  params: Promise<{ botId: string }>;
}

export default async function WidgetPage({ params }: Props) {
  const { botId } = await params;
  
  const supabase = getSupabaseClient();
  const { data: chatbot } = await supabase
    .from('chatbots')
    .select('*')
    .eq('id', botId)
    .single();

  if (!chatbot) {
    return <div>Chatbot not found</div>;
  }

  return (
    <div className="min-h-screen bg-transparent">
      <ChatWidget
        botId={botId}
        primaryColor={chatbot.primary_color}
        greeting={chatbot.greeting}
        companyName={chatbot.name}
      />
    </div>
  );
}
