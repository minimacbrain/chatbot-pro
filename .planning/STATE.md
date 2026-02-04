# State

## Current Status
- **Phase:** 4 - Deploy
- **Status:** Build Complete
- **Started:** 2026-02-04

## Completed
- [x] Project planning files created
- [x] Phase 1: Foundation (Next.js 14, Supabase, Tailwind)
- [x] Phase 2: Core Features (RAG pipeline, widget, dashboard)
- [x] Phase 3: UI/Polish (landing page, design system)
- [x] Build passes successfully

## What Was Built

### Landing Page (/)
- Hero section with value proposition
- Feature breakdown (4 features)
- Pricing tiers (Starter $29 / Growth $49 / Pro $99)
- Demo widget preview
- CTA buttons to signup

### Authentication
- Login page (/login)
- Signup page (/signup)
- Middleware for protected routes
- Auto-create chatbot on signup

### Dashboard
- Inbox (/dashboard) - view conversations and messages
- Knowledge Base (/dashboard/sources) - add URL or text sources
- Widget Customization (/dashboard/widget) - colors, greeting, preview
- Embed Code (/dashboard/embed) - copy-paste script

### Widget
- Chat bubble component (60x60, bottom-right)
- Full chat interface (380x600)
- Typing indicator
- Message history (localStorage visitor ID)
- Embeddable widget.js script

### AI Backend
- /api/sources - add and process knowledge sources
- /api/sources/refresh - re-crawl URL sources
- /api/chat - RAG pipeline with Claude claude-sonnet-4-20250514
- Escalation detection ("talk to human" triggers)
- pgvector similarity search

### Database Schema
- chatbots (user settings)
- sources (knowledge base items)
- chunks (embeddings for RAG)
- conversations (chat threads)
- messages (individual messages)
- RLS policies for security

## Blockers for Deployment
- Supabase project needed (run schema.sql)
- OpenAI API key (for embeddings)
- Anthropic API key (for Claude responses)
- Environment variables must be set in Vercel

## Time Tracking
- Planning: 15 min
- Phase 1: 30 min
- Phase 2: 60 min  
- Phase 3: 45 min
- Phase 4: 20 min
- Total: ~2.5 hours
