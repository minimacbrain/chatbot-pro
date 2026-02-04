import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }
  return createClient(url, key);
}

function getAnthropicClient() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Escalation triggers
const ESCALATION_TRIGGERS = [
  'talk to human',
  'talk to a human',
  'speak to someone',
  'speak to a person',
  'agent please',
  'real person',
  'human agent',
  'customer service',
  'support agent',
  'get me a human',
  'transfer me',
];

function detectEscalation(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return ESCALATION_TRIGGERS.some(trigger => lowerMessage.includes(trigger));
}

async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAIClient();
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

async function searchKnowledge(chatbotId: string, query: string, limit = 5): Promise<string[]> {
  const supabase = getSupabaseClient();
  const embedding = await generateEmbedding(query);
  
  // Use pgvector similarity search via RPC
  const { data, error } = await supabase.rpc('match_chunks', {
    query_embedding: embedding,
    match_chatbot_id: chatbotId,
    match_count: limit,
    match_threshold: 0.3,
  });

  if (error) {
    console.error('Error searching knowledge:', error);
    return [];
  }

  return data?.map((chunk: { content: string }) => chunk.content) || [];
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const anthropic = getAnthropicClient();
    const body = await req.json();
    const { botId, conversationId, visitorId, message } = body;

    if (!botId || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get chatbot settings
    const { data: chatbot } = await supabase
      .from('chatbots')
      .select('*')
      .eq('id', botId)
      .single();

    if (!chatbot) {
      return new Response(JSON.stringify({ error: 'Chatbot not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get or create conversation
    let convId = conversationId;
    if (!convId) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          chatbot_id: botId,
          visitor_id: visitorId || 'anonymous',
          status: 'open',
        })
        .select()
        .single();
      convId = newConv?.id;
    }

    // Save user message
    await supabase.from('messages').insert({
      conversation_id: convId,
      role: 'user',
      content: message,
    });

    // Check for escalation
    if (detectEscalation(message)) {
      const escalationResponse = "I understand you'd like to speak with a human. I've flagged this conversation for our team. They'll reach out to you soon. In the meantime, is there anything else I can help you with?";
      
      await supabase
        .from('conversations')
        .update({ status: 'escalated', updated_at: new Date().toISOString() })
        .eq('id', convId);

      await supabase.from('messages').insert({
        conversation_id: convId,
        role: 'assistant',
        content: escalationResponse,
      });

      return new Response(JSON.stringify({
        response: escalationResponse,
        conversationId: convId,
        escalated: true,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Search knowledge base
    const relevantChunks = await searchKnowledge(botId, message);
    const context = relevantChunks.length > 0 
      ? relevantChunks.join('\n\n---\n\n')
      : '';

    // Build prompt
    const systemPrompt = `You are a helpful customer support assistant for ${chatbot.name}.
Answer the customer's question using ONLY the information provided in the context below.
If you cannot answer from the provided context, say "I don't have that specific information. Would you like me to connect you with our team?"

Guidelines:
- Be concise and friendly
- If unsure, offer to escalate to human support
- Never make up information
- Keep responses under 3 sentences when possible

${context ? `Context:\n${context}` : 'No specific context available for this question.'}`;

    // Generate response with Claude
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: systemPrompt,
      messages: [
        { role: 'user', content: message }
      ],
    });

    const assistantMessage = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'I apologize, but I had trouble processing your request. Would you like to speak with our team?';

    // Save assistant message
    await supabase.from('messages').insert({
      conversation_id: convId,
      role: 'assistant',
      content: assistantMessage,
    });

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', convId);

    return new Response(JSON.stringify({
      response: assistantMessage,
      conversationId: convId,
      escalated: false,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
