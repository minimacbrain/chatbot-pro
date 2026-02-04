# Roadmap

## Phase 1: Foundation
**Goal:** Project scaffold, routing, data model, core layout, Supabase setup
**Success criteria:** 
- App runs with `npm run dev`
- All routes resolve (/, /dashboard, /dashboard/inbox, /dashboard/sources, /dashboard/settings, /dashboard/widget)
- Layout skeleton matches chatbot-design system
- Supabase connected with auth working
- Database schema created (users, chatbots, sources, conversations, messages, chunks)
**Estimated time:** 45-60 min

## Phase 2: Core Features
**Goal:** The RAG pipeline and widget that makes this product valuable
**Success criteria:**
- Can upload URL or file as knowledge source
- RAG pipeline processes and stores embeddings
- Widget renders and can send/receive messages
- AI responds using context from knowledge base
- Escalation detection works
**Estimated time:** 90-120 min

## Phase 3: UI/Polish
**Goal:** Apply chatbot-design system fully, landing page, responsive, real copy
**Success criteria:**
- Landing page complete with hero, features, pricing, demo widget
- Dashboard follows chatbot-design tokens exactly
- Widget matches chatbot-design patterns
- All animations smooth (widget open/close, message appear, typing indicator)
- Passes The Nate Test visual bar
**Estimated time:** 60-90 min

## Phase 4: Deploy & Verify
**Goal:** Production-ready on Vercel with working URL
**Success criteria:**
- `npm run build` passes with zero errors
- Deploys to Vercel successfully
- Preview URL loads and is functional
- Environment variables documented and set
- Core flow works: sign up → add source → test chat
- README.md complete with deployment instructions
**Estimated time:** 30 min
