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

// Chunk text into smaller pieces
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

// Generate embeddings for text
async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAIClient();
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

// Fetch and extract text from URL
async function fetchUrlContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ChatBotPro/1.0 (Knowledge Crawler)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    
    // Simple HTML to text extraction
    const text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();

    return text;
  } catch (error) {
    console.error('Error fetching URL:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await req.json();
    const { chatbotId, type, url, name, content } = body;

    if (!chatbotId) {
      return NextResponse.json({ error: 'chatbotId is required' }, { status: 400 });
    }

    // Create the source record
    const sourceName = name || (url ? new URL(url).hostname : 'Text Content');
    const { data: source, error: sourceError } = await supabase
      .from('sources')
      .insert({
        chatbot_id: chatbotId,
        type,
        name: sourceName,
        url: url || null,
        content: content || null,
        status: 'processing',
        chunk_count: 0,
      })
      .select()
      .single();

    if (sourceError) {
      console.error('Error creating source:', sourceError);
      return NextResponse.json({ error: 'Failed to create source' }, { status: 500 });
    }

    // Process the source asynchronously
    processSource(source.id, chatbotId, type, url, content).catch(console.error);

    return NextResponse.json({ source });
  } catch (error) {
    console.error('Error in sources API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function processSource(
  sourceId: string,
  chatbotId: string,
  type: string,
  url?: string,
  content?: string
) {
  const supabase = getSupabaseClient();
  
  try {
    let text = '';

    if (type === 'url' && url) {
      text = await fetchUrlContent(url);
    } else if (type === 'text' && content) {
      text = content;
    } else {
      throw new Error('Invalid source type or missing content');
    }

    if (!text || text.length < 50) {
      throw new Error('Not enough content extracted');
    }

    // Chunk the text
    const chunks = chunkText(text);

    // Generate embeddings and store chunks
    for (const chunkContent of chunks) {
      const embedding = await generateEmbedding(chunkContent);

      await supabase.from('chunks').insert({
        source_id: sourceId,
        chatbot_id: chatbotId,
        content: chunkContent,
        embedding,
        metadata: { source_type: type, url },
      });
    }

    // Update source status
    await supabase
      .from('sources')
      .update({
        status: 'ready',
        chunk_count: chunks.length,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sourceId);

  } catch (error) {
    console.error('Error processing source:', error);
    await supabase
      .from('sources')
      .update({
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        updated_at: new Date().toISOString(),
      })
      .eq('id', sourceId);
  }
}
