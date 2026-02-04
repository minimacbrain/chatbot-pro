# Requirements

## V1 (Ship Tonight)

### Landing Page
- Hero section with clear value prop (Train AI on your docs, answer questions 24/7)
- Feature breakdown (3-4 key features with icons/illustrations)
- Pricing section (Starter $29 / Growth $49 / Pro $99)
- Demo widget embedded and functional on landing page
- CTA buttons: Start Free Trial

### Dashboard
- Supabase auth (email/password signup and login)
- Knowledge base management:
  - Add source via URL (website scraping)
  - Upload file (PDF, TXT)
  - View list of sources with status
  - Delete source
- Widget customization:
  - Primary color picker
  - Greeting message input
  - Company name input
- Embed code generator (copy-to-clipboard script tag)
- Conversation inbox:
  - List of recent conversations
  - View individual conversation messages
  - Basic status (open/resolved)

### Widget
- Embeddable chat bubble (bottom-right, 60x60 circle)
- Expand to full chat interface (380x600 on desktop, full screen mobile)
- Send message → receive AI response
- Typing indicator during AI response
- Minimize/close functionality
- Customizable colors from dashboard settings
- Stores conversation ID in localStorage

### AI Backend
- RAG pipeline:
  - Ingest URL: fetch → extract text → chunk (500-1000 tokens) → embed → store in pgvector
  - Ingest file: parse → chunk → embed → store
- Query flow:
  - Embed user question
  - Vector search (top 3-5 chunks)
  - Construct prompt with context
  - Stream response from Claude claude-sonnet-4-20250514
- Escalation trigger: detect "talk to human", "agent please", etc.
- Graceful fallback: "I don't have that information. Let me connect you with our team."

## V2 (If Time Allows)
- Real-time conversation updates (Supabase realtime)
- Proactive message triggers (page-based, scroll-based)
- Analytics dashboard (conversations, resolution rate)
- Multiple chatbot support per account
- Custom branding (logo upload)

## Out of Scope
- Payment processing (Stripe integration)
- Email notifications for escalations
- Multi-language support
- Voice/audio messages
- File sharing in chat
- Agent live takeover (queue only, no real-time handoff)

## Constraints
- Light mode only (business-facing)
- Desktop-first, responsive to tablet minimum
- No fake social proof or placeholder data implying real usage
- 5th-grade reading level for all customer-facing copy
- No em dashes in any text content
- Follow chatbot-design skill tokens exactly
