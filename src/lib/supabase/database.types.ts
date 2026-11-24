// Generado desde Supabase (generate_typescript_types). No editar a mano:
// regenerar tras cada migración.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      assistant_versions: {
        Row: {
          assistant_id: string
          config: Json
          created_at: string
          id: string
          is_current: boolean
          max_tokens: number
          model: string
          system_prompt: string
          version: number
        }
        Insert: {
          assistant_id: string
          config?: Json
          created_at?: string
          id?: string
          is_current?: boolean
          max_tokens: number
          model: string
          system_prompt: string
          version: number
        }
        Update: {
          assistant_id?: string
          config?: Json
          created_at?: string
          id?: string
          is_current?: boolean
          max_tokens?: number
          model?: string
          system_prompt?: string
          version?: number
        }
        Relationships: []
      }
      assistants: {
        Row: {
          active: boolean
          created_at: string
          description: string
          id: string
          name: string
          slug: string
          sort_order: number
          save_targets: string[]
          usage_tips: string
          starters: string[]
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
          save_targets?: string[]
          usage_tips?: string
          starters?: string[]
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          save_targets?: string[]
          usage_tips?: string
          starters?: string[]
        }
        Relationships: []
      }
      case_resources: {
        Row: {
          case_id: string
          content: string
          created_at: string
          id: string
          resource_type: string
          source_assistant_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          case_id: string
          content: string
          created_at?: string
          id?: string
          resource_type?: string
          source_assistant_id?: string | null
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          case_id?: string
          content?: string
          created_at?: string
          id?: string
          resource_type?: string
          source_assistant_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      case_memory: {
        Row: {
          case_id: string
          category_id: string
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          case_id: string
          category_id: string
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          case_id?: string
          category_id?: string
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_memory_case_fk"
            columns: ["case_id", "user_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "case_memory_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "memory_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          case_code: string
          created_at: string
          general_context: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          case_code?: string
          created_at?: string
          general_context?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          case_code?: string
          created_at?: string
          general_context?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          assistant_id: string
          case_id: string
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assistant_id: string
          case_id: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          assistant_id?: string
          case_id?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      memory_categories: {
        Row: {
          active: boolean
          description: string
          id: string
          name: string
          slug: string
          sort_order: number
          mode: string
        }
        Insert: {
          active?: boolean
          description?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
          mode?: string
        }
        Update: {
          active?: boolean
          description?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          mode?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          assistant_version_id: string | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          assistant_version_id?: string | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          assistant_version_id?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          case_id: string
          changes: string
          created_at: string
          data: Json
          date: string
          id: string
          notes: string
          relevant_info: string
          session_number: number
          session_type: string
          summary: string
          updated_at: string
          user_id: string
        }
        Insert: {
          case_id: string
          changes?: string
          created_at?: string
          data?: Json
          date?: string
          id?: string
          notes?: string
          relevant_info?: string
          session_number?: number
          session_type?: string
          summary?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          case_id?: string
          changes?: string
          created_at?: string
          data?: Json
          date?: string
          id?: string
          notes?: string
          relevant_info?: string
          session_number?: number
          session_type?: string
          summary?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_case_fk"
            columns: ["case_id", "user_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      usage_events: {
        Row: {
          assistant_id: string | null
          assistant_version_id: string | null
          cache_creation_input_tokens: number
          cache_read_input_tokens: number
          case_id: string | null
          conversation_id: string | null
          created_at: string
          estimated_cost_usd: number
          id: string
          input_tokens: number
          model: string
          output_tokens: number
          user_id: string
        }
        Insert: {
          assistant_id?: string | null
          assistant_version_id?: string | null
          cache_creation_input_tokens?: number
          cache_read_input_tokens?: number
          case_id?: string | null
          conversation_id?: string | null
          created_at?: string
          estimated_cost_usd?: number
          id?: string
          input_tokens?: number
          model: string
          output_tokens?: number
          user_id: string
        }
        Update: {
          assistant_id?: string | null
          assistant_version_id?: string | null
          cache_creation_input_tokens?: number
          cache_read_input_tokens?: number
          case_id?: string | null
          conversation_id?: string | null
          created_at?: string
          estimated_cost_usd?: number
          id?: string
          input_tokens?: number
          model?: string
          output_tokens?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database["public"]

export type Tables<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Update"]
