export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      chatbots: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          greeting: string;
          primary_color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          greeting?: string;
          primary_color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          greeting?: string;
          primary_color?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      sources: {
        Row: {
          id: string;
          chatbot_id: string;
          type: 'url' | 'file' | 'text';
          name: string;
          content: string | null;
          url: string | null;
          status: 'pending' | 'processing' | 'ready' | 'error';
          chunk_count: number;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          chatbot_id: string;
          type: 'url' | 'file' | 'text';
          name: string;
          content?: string | null;
          url?: string | null;
          status?: 'pending' | 'processing' | 'ready' | 'error';
          chunk_count?: number;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          chatbot_id?: string;
          type?: 'url' | 'file' | 'text';
          name?: string;
          content?: string | null;
          url?: string | null;
          status?: 'pending' | 'processing' | 'ready' | 'error';
          chunk_count?: number;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      chunks: {
        Row: {
          id: string;
          source_id: string;
          chatbot_id: string;
          content: string;
          embedding: number[] | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          source_id: string;
          chatbot_id: string;
          content: string;
          embedding?: number[] | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          source_id?: string;
          chatbot_id?: string;
          content?: string;
          embedding?: number[] | null;
          metadata?: Json;
          created_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          chatbot_id: string;
          visitor_id: string;
          status: 'open' | 'resolved' | 'escalated';
          visitor_email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          chatbot_id: string;
          visitor_id: string;
          status?: 'open' | 'resolved' | 'escalated';
          visitor_email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          chatbot_id?: string;
          visitor_id?: string;
          status?: 'open' | 'resolved' | 'escalated';
          visitor_email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: 'user' | 'assistant' | 'system';
          content?: string;
          created_at?: string;
        };
      };
    };
  };
}

// Helper types
export type Chatbot = Database['public']['Tables']['chatbots']['Row'];
export type Source = Database['public']['Tables']['sources']['Row'];
export type Chunk = Database['public']['Tables']['chunks']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
