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
      users: {
        Row: {
          id: string
          username: string
          password: string
          full_name: string
          role: 'Administrator' | 'Mitarbeiter'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          password: string
          full_name: string
          role?: 'Administrator' | 'Mitarbeiter'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          password?: string
          full_name?: string
          role?: 'Administrator' | 'Mitarbeiter'
          avatar_url?: string | null
          updated_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          name: string
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          title: string
          location: string
          address: string
          customer: string
          workers: string[]
          equipment: string
          notes: string
          start_date: string
          end_date: string
          color: string
          all_day: boolean
          multi_day_group_id: string | null
          is_first_day: boolean | null
          is_last_day: boolean | null
          job_group_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          location: string
          address?: string
          customer?: string
          workers?: string[]
          equipment?: string
          notes?: string
          start_date: string
          end_date: string
          color?: string
          all_day?: boolean
          multi_day_group_id?: string | null
          is_first_day?: boolean | null
          is_last_day?: boolean | null
          job_group_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          location?: string
          address?: string
          customer?: string
          workers?: string[]
          equipment?: string
          notes?: string
          start_date?: string
          end_date?: string
          color?: string
          all_day?: boolean
          multi_day_group_id?: string | null
          is_first_day?: boolean | null
          is_last_day?: boolean | null
          job_group_id?: string | null
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          street: string | null
          postal_code: string | null
          report_form: 'Tagesbericht' | 'Leistungsbericht' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          street?: string | null
          postal_code?: string | null
          report_form?: 'Tagesbericht' | 'Leistungsbericht' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          street?: string | null
          postal_code?: string | null
          report_form?: 'Tagesbericht' | 'Leistungsbericht' | null
          updated_at?: string
        }
      }
      contact_persons: {
        Row: {
          id: string
          customer_id: string
          name: string
          phone: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          name: string
          phone?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          name?: string
          phone?: string | null
          email?: string | null
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          job_number: string
          customer_id: string
          contact_person_id: string
          street: string
          postal_code: string
          description: string
          status: 'offen' | 'in_bearbeitung' | 'abgeschlossen'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_number: string
          customer_id: string
          contact_person_id: string
          street?: string
          postal_code?: string
          description?: string
          status?: 'offen' | 'in_bearbeitung' | 'abgeschlossen'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_number?: string
          customer_id?: string
          contact_person_id?: string
          street?: string
          postal_code?: string
          description?: string
          status?: 'offen' | 'in_bearbeitung' | 'abgeschlossen'
          updated_at?: string
        }
      }
      absences: {
        Row: {
          id: string
          user_id: string
          start_date: string
          end_date: string
          reason: string
          absence_type: 'urlaub' | 'sonstige'
          custom_reason: string | null
          status: 'pending' | 'approved' | 'rejected'
          requires_approval: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          start_date: string
          end_date: string
          reason?: string
          absence_type?: 'urlaub' | 'sonstige'
          custom_reason?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          requires_approval?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          start_date?: string
          end_date?: string
          reason?: string
          absence_type?: 'urlaub' | 'sonstige'
          custom_reason?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          requires_approval?: boolean | null
          updated_at?: string
        }
      }
      emergencies: {
        Row: {
          id: string
          title: string
          description: string
          priority: 'low' | 'medium' | 'high'
          status: 'open' | 'in_progress' | 'resolved'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          priority?: 'low' | 'medium' | 'high'
          status?: 'open' | 'in_progress' | 'resolved'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          priority?: 'low' | 'medium' | 'high'
          status?: 'open' | 'in_progress' | 'resolved'
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          user_id: string
          key: string
          value: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          key: string
          value: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          key?: string
          value?: Json
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'Administrator' | 'Mitarbeiter'
      job_status: 'offen' | 'in_bearbeitung' | 'abgeschlossen'
      absence_type: 'urlaub' | 'sonstige'
      absence_status: 'pending' | 'approved' | 'rejected'
      report_form_type: 'Tagesbericht' | 'Leistungsbericht'
      emergency_priority: 'low' | 'medium' | 'high'
      emergency_status: 'open' | 'in_progress' | 'resolved'
    }
  }
}
