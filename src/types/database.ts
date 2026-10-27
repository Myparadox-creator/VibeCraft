export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          user_id: string
          title: string
          event_type: string
          target_date: string
          location: string | null
          guest_count: number
          total_budget: number
          currency: string
          theme_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          event_type: string
          target_date: string
          location?: string | null
          guest_count?: number
          total_budget?: number
          currency?: string
          theme_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          event_type?: string
          target_date?: string
          location?: string | null
          guest_count?: number
          total_budget?: number
          currency?: string
          theme_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      budget_items: {
        Row: {
          id: string
          event_id: string
          category: string
          item_name: string
          allocated_amount: number
          actual_amount: number
          payment_status: string
          due_date: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          event_id: string
          category: string
          item_name: string
          allocated_amount?: number
          actual_amount?: number
          payment_status?: string
          due_date?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          category?: string
          item_name?: string
          allocated_amount?: number
          actual_amount?: number
          payment_status?: string
          due_date?: string | null
          notes?: string | null
        }
      }
      timeline_milestones: {
        Row: {
          id: string
          event_id: string
          phase: string
          title: string
          description: string | null
          start_time: string | null
          end_time: string | null
          is_completed: boolean
          order_index: number
        }
        Insert: {
          id?: string
          event_id: string
          phase: string
          title: string
          description?: string | null
          start_time?: string | null
          end_time?: string | null
          is_completed?: boolean
          order_index?: number
        }
        Update: {
          id?: string
          event_id?: string
          phase?: string
          title?: string
          description?: string | null
          start_time?: string | null
          end_time?: string | null
          is_completed?: boolean
          order_index?: number
        }
      }
      vendors_tasks: {
        Row: {
          id: string
          event_id: string
          category: string
          vendor_name: string
          contact_email: string | null
          contact_phone: string | null
          contract_status: string
          checklist_tasks: Json
          notes: string | null
        }
        Insert: {
          id?: string
          event_id: string
          category: string
          vendor_name: string
          contact_email?: string | null
          contact_phone?: string | null
          contract_status?: string
          checklist_tasks?: Json
          notes?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          category?: string
          vendor_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          contract_status?: string
          checklist_tasks?: Json
          notes?: string | null
        }
      }
    }
  }
}
