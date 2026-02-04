-- Enable the vector extension
create extension if not exists vector;

-- Chatbots table
create table if not exists chatbots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  greeting text default 'Hi! How can I help you today?',
  primary_color text default '#6366F1',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Sources table (knowledge base)
create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  chatbot_id uuid references chatbots(id) on delete cascade not null,
  type text check (type in ('url', 'file', 'text')) not null,
  name text not null,
  content text,
  url text,
  status text check (status in ('pending', 'processing', 'ready', 'error')) default 'pending',
  chunk_count integer default 0,
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Chunks table (for RAG)
create table if not exists chunks (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references sources(id) on delete cascade not null,
  chatbot_id uuid references chatbots(id) on delete cascade not null,
  content text not null,
  embedding vector(1536),
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Conversations table
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  chatbot_id uuid references chatbots(id) on delete cascade not null,
  visitor_id text not null,
  status text check (status in ('open', 'resolved', 'escalated')) default 'open',
  visitor_email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Messages table
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  role text check (role in ('user', 'assistant', 'system')) not null,
  content text not null,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists chatbots_user_id_idx on chatbots(user_id);
create index if not exists sources_chatbot_id_idx on sources(chatbot_id);
create index if not exists chunks_chatbot_id_idx on chunks(chatbot_id);
create index if not exists chunks_source_id_idx on chunks(source_id);
create index if not exists conversations_chatbot_id_idx on conversations(chatbot_id);
create index if not exists messages_conversation_id_idx on messages(conversation_id);

-- Vector similarity search function
create or replace function match_chunks(
  query_embedding vector(1536),
  match_chatbot_id uuid,
  match_count int default 5,
  match_threshold float default 0.3
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    chunks.id,
    chunks.content,
    chunks.metadata,
    1 - (chunks.embedding <=> query_embedding) as similarity
  from chunks
  where chunks.chatbot_id = match_chatbot_id
    and chunks.embedding is not null
    and 1 - (chunks.embedding <=> query_embedding) > match_threshold
  order by chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- RLS Policies
alter table chatbots enable row level security;
alter table sources enable row level security;
alter table chunks enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

-- Chatbots: users can only see their own
create policy "Users can view own chatbots" on chatbots
  for select using (auth.uid() = user_id);
create policy "Users can insert own chatbots" on chatbots
  for insert with check (auth.uid() = user_id);
create policy "Users can update own chatbots" on chatbots
  for update using (auth.uid() = user_id);
create policy "Users can delete own chatbots" on chatbots
  for delete using (auth.uid() = user_id);

-- Sources: through chatbot ownership
create policy "Users can view sources for own chatbots" on sources
  for select using (
    exists (select 1 from chatbots where chatbots.id = sources.chatbot_id and chatbots.user_id = auth.uid())
  );
create policy "Users can insert sources for own chatbots" on sources
  for insert with check (
    exists (select 1 from chatbots where chatbots.id = sources.chatbot_id and chatbots.user_id = auth.uid())
  );
create policy "Users can update sources for own chatbots" on sources
  for update using (
    exists (select 1 from chatbots where chatbots.id = sources.chatbot_id and chatbots.user_id = auth.uid())
  );
create policy "Users can delete sources for own chatbots" on sources
  for delete using (
    exists (select 1 from chatbots where chatbots.id = sources.chatbot_id and chatbots.user_id = auth.uid())
  );

-- Chunks: through chatbot ownership (service role for insert)
create policy "Users can view chunks for own chatbots" on chunks
  for select using (
    exists (select 1 from chatbots where chatbots.id = chunks.chatbot_id and chatbots.user_id = auth.uid())
  );

-- Conversations: through chatbot ownership (public insert for widget)
create policy "Users can view conversations for own chatbots" on conversations
  for select using (
    exists (select 1 from chatbots where chatbots.id = conversations.chatbot_id and chatbots.user_id = auth.uid())
  );
create policy "Anyone can insert conversations" on conversations
  for insert with check (true);
create policy "Anyone can update conversations" on conversations
  for update using (true);

-- Messages: through conversation
create policy "Users can view messages for own conversations" on messages
  for select using (
    exists (
      select 1 from conversations 
      join chatbots on chatbots.id = conversations.chatbot_id 
      where conversations.id = messages.conversation_id 
      and chatbots.user_id = auth.uid()
    )
  );
create policy "Anyone can insert messages" on messages
  for insert with check (true);
