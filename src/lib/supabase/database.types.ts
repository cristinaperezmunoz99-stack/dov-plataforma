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
      memory_categories: {
        Row: {
          active: boolean
          description: string
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          description?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          description?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
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
