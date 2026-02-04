# ChatBot Pro

AI-powered customer support chatbot for SMBs. Train on your business docs, embed on your website, answer customer questions 24/7.

## Features

- **AI Chat Widget**: Embeddable chat bubble that works on any website
- **Knowledge Base**: Train your chatbot on URLs, documents, or text content
- **RAG Pipeline**: Uses OpenAI embeddings + pgvector for accurate answers
- **Claude AI**: Powered by Claude claude-sonnet-4-20250514 for natural responses
- **Dashboard**: Manage knowledge sources, customize widget, view conversations
- **Escalation**: Automatic detection when customers want to talk to a human

## Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS
- **Backend**: Supabase (Auth, PostgreSQL, pgvector)
- **AI**: Claude claude-sonnet-4-20250514 (responses), OpenAI text-embedding-3-small (embeddings)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- OpenAI API key
- Anthropic API key

### 1. Clone and Install

```bash
cd chatbot-pro
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. This creates all tables, enables pgvector, and sets up RLS policies

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your credentials:

```env
# Supabase (from project settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI (for embeddings)
OPENAI_API_KEY=sk-your-openai-key

# Anthropic (for chat responses)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/chatbot-pro.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and import your repository
2. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY`
3. Deploy!

### 3. Update Supabase Auth Settings

In Supabase Dashboard > Authentication > URL Configuration:
- Set Site URL to your Vercel domain
- Add your Vercel domain to Redirect URLs

## Usage

### For You (Admin)

1. Sign up at `/signup`
2. Add knowledge sources in Dashboard > Knowledge Base
3. Customize widget colors in Dashboard > Widget
4. Copy embed code from Dashboard > Embed Code

### For Your Customers

Paste the embed code before `</body>` on your website:

```html
<script>
  (function(w, d, s, o, f, js, fjs) {
    w['ChatBotPro'] = o;
    w[o] = w[o] || function() { (w[o].q = w[o].q || []).push(arguments) };
    js = d.createElement(s); fjs = d.getElementsByTagName(s)[0];
    js.id = o; js.src = f; js.async = 1;
    fjs.parentNode.insertBefore(js, fjs);
  }(window, document, 'script', 'cbp', 'https://your-domain.com/widget.js'));
  cbp('init', { botId: 'your-bot-id' });
</script>
```

## Project Structure

```
chatbot-pro/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/          # Chat API (RAG + Claude)
│   │   │   └── sources/       # Knowledge base API
│   │   ├── dashboard/         # Admin dashboard pages
│   │   ├── login/             # Auth pages
│   │   ├── signup/
│   │   └── widget/[botId]/    # Embeddable widget page
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   └── widget/            # Chat widget components
│   └── lib/
│       └── supabase/          # Supabase client + types
├── public/
│   └── widget.js              # Embeddable widget script
├── supabase/
│   └── schema.sql             # Database schema
└── .env.example
```

## API Endpoints

### POST /api/chat
Send a message and get an AI response.

```json
{
  "botId": "uuid",
  "message": "What are your business hours?",
  "conversationId": "uuid (optional)",
  "visitorId": "string"
}
```

### POST /api/sources
Add a knowledge source.

```json
{
  "chatbotId": "uuid",
  "type": "url | text",
  "url": "https://example.com/faq",
  "name": "FAQ",
  "content": "text content (for type=text)"
}
```

## License

MIT
