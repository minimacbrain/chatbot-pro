import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }
  return createClient(url, key);
}

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

function chunkText(text: string, maxChunkSize = 1000): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter(chunk => chunk.length > 50);
}

async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAIClient();
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

async function fetchUrlContent(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ChatBotPro/1.0 (Knowledge Crawler)',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await response.text();
  
  const text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

  return text;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { sourceId } = await req.json();

    if (!sourceId) {
      return NextResponse.json({ error: 'sourceId is required' }, { status: 400 });
    }

    // Get the source
    const { data: source, error: sourceError } = await supabase
      .from('sources')
      .select('*')
      .eq('id', sourceId)
      .single();

    if (sourceError || !source) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    if (source.type !== 'url' || !source.url) {
      return NextResponse.json({ error: 'Only URL sources can be refreshed' }, { status: 400 });
    }

    // Update status to processing
    await supabase
      .from('sources')
      .update({ status: 'processing' })
      .eq('id', sourceId);

    // Delete existing chunks
    await supabase
      .from('chunks')
      .delete()
      .eq('source_id', sourceId);

    // Fetch and process content
    try {
      const text = await fetchUrlContent(source.url);

      if (!text || text.length < 50) {
        throw new Error('Not enough content extracted');
      }

      const chunks = chunkText(text);

      for (const chunkContent of chunks) {
        const embedding = await generateEmbedding(chunkContent);

        await supabase.from('chunks').insert({
          source_id: sourceId,
          chatbot_id: source.chatbot_id,
          content: chunkContent,
          embedding,
          metadata: { source_type: 'url', url: source.url },
        });
      }

      await supabase
        .from('sources')
        .update({
          status: 'ready',
          chunk_count: chunks.length,
          error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sourceId);

    } catch (error) {
      await supabase
        .from('sources')
        .update({
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          updated_at: new Date().toISOString(),
        })
        .eq('id', sourceId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error refreshing source:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
