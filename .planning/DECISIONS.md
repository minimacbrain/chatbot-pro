# Decisions

### Use App Router over Pages Router
**Context:** Next.js 14 supports both routing patterns
**Options:** App Router, Pages Router
**Decision:** App Router
**Reason:** Modern patterns, better for server components, streaming responses for AI chat

### Supabase for Full Backend
**Context:** Need auth, database, and vector storage
**Options:** Separate services (Auth0 + Postgres + Pinecone), Supabase all-in-one
**Decision:** Supabase with pgvector extension
**Reason:** Single platform simplifies deployment, pgvector is sufficient for MVP scale, reduces complexity

### Claude claude-sonnet-4-20250514 for Responses
**Context:** Need LLM for RAG responses
**Options:** GPT-4, Claude claude-sonnet-4-20250514, open source models
**Decision:** Claude claude-sonnet-4-20250514
**Reason:** Specified in requirements, excellent at following instructions, good balance of quality and speed

### Embed Widget as iframe
**Context:** Widget needs to be embeddable on customer sites
**Options:** Direct script injection, iframe isolation
**Decision:** iframe with postMessage communication
**Reason:** Better isolation, prevents CSS conflicts, standard pattern from chatbot-saas skill

### OpenAI text-embedding-3-small for Embeddings
**Context:** Need embedding model for RAG
**Options:** OpenAI ada-002, text-embedding-3-small, Cohere, local models
**Decision:** text-embedding-3-small
**Reason:** Good quality, cost-effective, widely supported, 1536 dimensions fits pgvector well
