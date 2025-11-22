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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      card_exchanges: {
        Row: {
          completed_at: string | null
          exchange_method: string | null
          exchanged_at: string | null
          id: string
          initiator_accepted: boolean | null
          initiator_profile_id: string
          recipient_accepted: boolean | null
          recipient_profile_id: string
        }
        Insert: {
          completed_at?: string | null
          exchange_method?: string | null
          exchanged_at?: string | null
          id?: string
          initiator_accepted?: boolean | null
          initiator_profile_id: string
          recipient_accepted?: boolean | null
          recipient_profile_id: string
        }
        Update: {
          completed_at?: string | null
          exchange_method?: string | null
          exchanged_at?: string | null
          id?: string
          initiator_accepted?: boolean | null
          initiator_profile_id?: string
          recipient_accepted?: boolean | null
          recipient_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_exchanges_initiator_profile_id_fkey"
            columns: ["initiator_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_exchanges_recipient_profile_id_fkey"
            columns: ["recipient_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          push_sent: boolean | null
          read_at: string | null
          related_exchange_id: string | null
          related_profile_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          push_sent?: boolean | null
          read_at?: string | null
          related_exchange_id?: string | null
          related_profile_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          push_sent?: boolean | null
          read_at?: string | null
          related_exchange_id?: string | null
          related_profile_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_exchange_id_fkey"
            columns: ["related_exchange_id"]
            isOneToOne: false
            referencedRelation: "card_exchanges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_profile_id_fkey"
            columns: ["related_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_state: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          id: string
          skipped: boolean | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          skipped?: boolean | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          skipped?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          company: string | null
          created_at: string | null
          deleted_at: string | null
          email: string
          id: string
          name: string
          phone: string
          profile_picture_initials: string | null
          profile_picture_url: string | null
          resume_visible: boolean | null
          role: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bio?: string | null
          company?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email: string
          id?: string
          name: string
          phone: string
          profile_picture_initials?: string | null
          profile_picture_url?: string | null
          resume_visible?: boolean | null
          role?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bio?: string | null
          company?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string
          profile_picture_initials?: string | null
          profile_picture_url?: string | null
          resume_visible?: boolean | null
          role?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      resume_attachments: {
        Row: {
          file_name: string
          file_size: number
          file_url: string
          id: string
          profile_id: string
          uploaded_at: string | null
        }
        Insert: {
          file_name: string
          file_size: number
          file_url: string
          id?: string
          profile_id: string
          uploaded_at?: string | null
        }
        Update: {
          file_name?: string
          file_size?: number
          file_url?: string
          id?: string
          profile_id?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resume_attachments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_contacts: {
        Row: {
          custom_tags: string[] | null
          id: string
          is_favorite: boolean | null
          last_viewed_at: string | null
          notes: string | null
          profile_id: string
          profile_updated_since_save: boolean | null
          saved_at: string | null
          user_id: string
        }
        Insert: {
          custom_tags?: string[] | null
          id?: string
          is_favorite?: boolean | null
          last_viewed_at?: string | null
          notes?: string | null
          profile_id: string
          profile_updated_since_save?: boolean | null
          saved_at?: string | null
          user_id: string
        }
        Update: {
          custom_tags?: string[] | null
          id?: string
          is_favorite?: boolean | null
          last_viewed_at?: string | null
          notes?: string | null
          profile_id?: string
          profile_updated_since_save?: boolean | null
          saved_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_contacts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shareable_links: {
        Row: {
          access_count: number | null
          created_at: string | null
          full_url: string
          id: string
          last_accessed_at: string | null
          profile_id: string
          short_code: string
        }
        Insert: {
          access_count?: number | null
          created_at?: string | null
          full_url: string
          id?: string
          last_accessed_at?: string | null
          profile_id: string
          short_code: string
        }
        Update: {
          access_count?: number | null
          created_at?: string | null
          full_url?: string
          id?: string
          last_accessed_at?: string | null
          profile_id?: string
          short_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "shareable_links_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_links: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          platform: string
          profile_id: string
          url: string
          visible: boolean | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          platform: string
          profile_id: string
          url: string
          visible?: boolean | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          platform?: string
          profile_id?: string
          url?: string
          visible?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "social_links_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_short_code: { Args: { length?: number }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
