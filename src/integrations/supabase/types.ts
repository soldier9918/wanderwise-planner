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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      autopilot_plans: {
        Row: {
          create_on: string
          created_at: string
          id: string
          publish_on: string | null
          settings: Json
          status: string
          topic: string
          user_id: string
          video_id: string | null
        }
        Insert: {
          create_on: string
          created_at?: string
          id?: string
          publish_on?: string | null
          settings?: Json
          status?: string
          topic: string
          user_id: string
          video_id?: string | null
        }
        Update: {
          create_on?: string
          created_at?: string
          id?: string
          publish_on?: string | null
          settings?: Json
          status?: string
          topic?: string
          user_id?: string
          video_id?: string | null
        }
        Relationships: []
      }
      billing_config: {
        Row: {
          id: boolean
          live: boolean
          updated_at: string
        }
        Insert: {
          id?: boolean
          live?: boolean
          updated_at?: string
        }
        Update: {
          id?: boolean
          live?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      coupon_codes: {
        Row: {
          active: boolean
          code: string
          created_at: string
          credits: number
          expires_at: string | null
          max_uses: number
          used_count: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          credits: number
          expires_at?: string | null
          max_uses?: number
          used_count?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          credits?: number
          expires_at?: string | null
          max_uses?: number
          used_count?: number
        }
        Relationships: []
      }
      coupon_redemptions: {
        Row: {
          code: string
          redeemed_at: string
          user_id: string
        }
        Insert: {
          code: string
          redeemed_at?: string
          user_id: string
        }
        Update: {
          code?: string
          redeemed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_code_fkey"
            columns: ["code"]
            isOneToOne: false
            referencedRelation: "coupon_codes"
            referencedColumns: ["code"]
          },
        ]
      }
      credit_accounts: {
        Row: {
          created_at: string
          referral_code: string
          referred_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          referral_code: string
          referred_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          referral_code?: string
          referred_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      credit_ledger: {
        Row: {
          amount: number
          created_at: string
          id: string
          livemode: boolean | null
          reason: string
          stripe_invoice_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          livemode?: boolean | null
          reason: string
          stripe_invoice_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          livemode?: boolean | null
          reason?: string
          stripe_invoice_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      live_activation_audit: {
        Row: {
          activated_at: string
          adjustments: number
          admin_id: string
          details: Json
          id: string
        }
        Insert: {
          activated_at?: string
          adjustments: number
          admin_id: string
          details?: Json
          id?: string
        }
        Update: {
          activated_at?: string
          adjustments?: number
          admin_id?: string
          details?: Json
          id?: string
        }
        Relationships: []
      }
      price_alerts: {
        Row: {
          adults: number
          cabin: string
          created_at: string | null
          current_price: number | null
          depart_date: string
          from_iata: string
          id: string
          return_date: string | null
          session_id: string
          target_price: number | null
          to_iata: string
        }
        Insert: {
          adults?: number
          cabin?: string
          created_at?: string | null
          current_price?: number | null
          depart_date: string
          from_iata: string
          id?: string
          return_date?: string | null
          session_id: string
          target_price?: number | null
          to_iata: string
        }
        Update: {
          adults?: number
          cabin?: string
          created_at?: string | null
          current_price?: number | null
          depart_date?: string
          from_iata?: string
          id?: string
          return_date?: string | null
          session_id?: string
          target_price?: number | null
          to_iata?: string
        }
        Relationships: []
      }
      processed_stripe_events: {
        Row: {
          event_id: string
          event_type: string
          processed_at: string
        }
        Insert: {
          event_id: string
          event_type: string
          processed_at?: string
        }
        Update: {
          event_id?: string
          event_type?: string
          processed_at?: string
        }
        Relationships: []
      }
      user_brand_cards: {
        Row: {
          cards: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          cards?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          cards?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          current_period_end: string | null
          livemode: boolean
          plan_tier: string | null
          price_id: string | null
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          current_period_end?: string | null
          livemode?: boolean
          plan_tier?: string | null
          price_id?: string | null
          status?: string
          stripe_customer_id: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          current_period_end?: string | null
          livemode?: boolean
          plan_tier?: string | null
          price_id?: string | null
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      video_exports: {
        Row: {
          completed_at: string | null
          content_type: string | null
          created_at: string
          credits_charged: number
          format: string
          id: string
          path: string | null
          quality: string
          refunded: boolean
          size_bytes: number | null
          status: string
          user_id: string
          version_hash: string
          video_id: string
        }
        Insert: {
          completed_at?: string | null
          content_type?: string | null
          created_at?: string
          credits_charged?: number
          format: string
          id?: string
          path?: string | null
          quality: string
          refunded?: boolean
          size_bytes?: number | null
          status?: string
          user_id: string
          version_hash: string
          video_id: string
        }
        Update: {
          completed_at?: string | null
          content_type?: string | null
          created_at?: string
          credits_charged?: number
          format?: string
          id?: string
          path?: string | null
          quality?: string
          refunded?: boolean
          size_bytes?: number | null
          status?: string
          user_id?: string
          version_hash?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_exports_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_scenes: {
        Row: {
          audio_path: string | null
          clip_credit: string | null
          clip_job_id: string | null
          clip_path: string | null
          created_at: string
          heading: string
          id: string
          image_path: string | null
          initial_narration: string | null
          narration: string
          position: number
          user_id: string
          video_id: string
          visual_prompt: string
        }
        Insert: {
          audio_path?: string | null
          clip_credit?: string | null
          clip_job_id?: string | null
          clip_path?: string | null
          created_at?: string
          heading?: string
          id?: string
          image_path?: string | null
          initial_narration?: string | null
          narration: string
          position: number
          user_id: string
          video_id: string
          visual_prompt: string
        }
        Update: {
          audio_path?: string | null
          clip_credit?: string | null
          clip_job_id?: string | null
          clip_path?: string | null
          created_at?: string
          heading?: string
          id?: string
          image_path?: string | null
          initial_narration?: string | null
          narration?: string
          position?: number
          user_id?: string
          video_id?: string
          visual_prompt?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_scenes_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          accent: string
          aspect_ratio: string
          caption_color: string
          caption_font: string
          caption_size: string
          caption_style: string
          created_at: string
          description: string | null
          id: string
          logo_opacity: number
          logo_path: string | null
          logo_position: string
          motion_enabled: boolean
          motion_type: string
          music_ducking: boolean
          music_enabled: boolean
          music_mood: string
          music_path: string | null
          music_volume: number
          narration_speed: number
          quality: string
          seo: Json | null
          sfx_enabled: boolean
          sfx_type: string
          sfx_volume: number
          source_url: string | null
          sources: Json | null
          style: string
          target_seconds: number | null
          thumbnail_path: string | null
          title: string
          tone: string
          topic: string
          transition_enabled: boolean
          transition_type: string
          updated_at: string
          user_id: string
          voice: string
        }
        Insert: {
          accent?: string
          aspect_ratio?: string
          caption_color?: string
          caption_font?: string
          caption_size?: string
          caption_style?: string
          created_at?: string
          description?: string | null
          id?: string
          logo_opacity?: number
          logo_path?: string | null
          logo_position?: string
          motion_enabled?: boolean
          motion_type?: string
          music_ducking?: boolean
          music_enabled?: boolean
          music_mood?: string
          music_path?: string | null
          music_volume?: number
          narration_speed?: number
          quality?: string
          seo?: Json | null
          sfx_enabled?: boolean
          sfx_type?: string
          sfx_volume?: number
          source_url?: string | null
          sources?: Json | null
          style?: string
          target_seconds?: number | null
          thumbnail_path?: string | null
          title?: string
          tone?: string
          topic: string
          transition_enabled?: boolean
          transition_type?: string
          updated_at?: string
          user_id: string
          voice?: string
        }
        Update: {
          accent?: string
          aspect_ratio?: string
          caption_color?: string
          caption_font?: string
          caption_size?: string
          caption_style?: string
          created_at?: string
          description?: string | null
          id?: string
          logo_opacity?: number
          logo_path?: string | null
          logo_position?: string
          motion_enabled?: boolean
          motion_type?: string
          music_ducking?: boolean
          music_enabled?: boolean
          music_mood?: string
          music_path?: string | null
          music_volume?: number
          narration_speed?: number
          quality?: string
          seo?: Json | null
          sfx_enabled?: boolean
          sfx_type?: string
          sfx_volume?: number
          source_url?: string | null
          sources?: Json | null
          style?: string
          target_seconds?: number | null
          thumbnail_path?: string | null
          title?: string
          tone?: string
          topic?: string
          transition_enabled?: boolean
          transition_type?: string
          updated_at?: string
          user_id?: string
          voice?: string
        }
        Relationships: []
      }
      youtube_connections: {
        Row: {
          access_token: string
          channel_id: string
          channel_thumbnail: string | null
          channel_title: string
          connected_at: string
          expires_at: string
          refresh_token: string
          user_id: string
        }
        Insert: {
          access_token: string
          channel_id: string
          channel_thumbnail?: string | null
          channel_title?: string
          connected_at?: string
          expires_at: string
          refresh_token: string
          user_id: string
        }
        Update: {
          access_token?: string
          channel_id?: string
          channel_thumbnail?: string | null
          channel_title?: string
          connected_at?: string
          expires_at?: string
          refresh_token?: string
          user_id?: string
        }
        Relationships: []
      }
      youtube_uploads: {
        Row: {
          created_at: string
          error: string | null
          id: string
          privacy: string
          publish_at: string | null
          status: string
          title: string | null
          user_id: string
          video_id: string
          youtube_video_id: string | null
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          privacy: string
          publish_at?: string | null
          status?: string
          title?: string | null
          user_id: string
          video_id: string
          youtube_video_id?: string | null
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          privacy?: string
          publish_at?: string | null
          status?: string
          title?: string | null
          user_id?: string
          video_id?: string
          youtube_video_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_live_billing: { Args: never; Returns: number }
      activate_live_billing_audited: {
        Args: { _admin: string; _details: Json }
        Returns: number
      }
      admin_adjust_credits: {
        Args: { _amount: number; _note: string; _user: string }
        Returns: undefined
      }
      admin_coupons: {
        Args: never
        Returns: {
          active: boolean
          code: string
          created_at: string
          credits: number
          expires_at: string
          max_uses: number
          used_count: number
        }[]
      }
      admin_create_coupon: {
        Args: {
          _code: string
          _credits: number
          _expires_at: string
          _max_uses: number
        }
        Returns: undefined
      }
      admin_ledger: {
        Args: { _limit?: number }
        Returns: {
          amount: number
          created_at: string
          email: string
          id: string
          livemode: boolean
          reason: string
        }[]
      }
      admin_overview: { Args: never; Returns: Json }
      admin_set_coupon_active: {
        Args: { _active: boolean; _code: string }
        Returns: undefined
      }
      admin_users: {
        Args: never
        Returns: {
          balance: number
          confirmed: boolean
          created_at: string
          email: string
          invites: number
          is_admin: boolean
          last_sign_in_at: string
          paid_total: number
          plan: string
          provider: string
          referral_code: string
          referred_by_email: string
          user_id: string
          videos: number
        }[]
      }
      admin_videos: {
        Args: { _limit?: number }
        Returns: {
          aspect_ratio: string
          created_at: string
          email: string
          id: string
          quality: string
          scenes: number
          style: string
          title: string
          voice: string
        }[]
      }
      can_mutate_project: { Args: { _user_id: string }; Returns: boolean }
      claim_monthly_free_credits: { Args: never; Returns: number }
      claim_referral: { Args: { _code: string }; Returns: string }
      credit_balance: { Args: { _user: string }; Returns: number }
      grant_monthly_free_credits_all: { Args: never; Returns: number }
      has_active_subscription: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      live_activation_ready: { Args: never; Returns: Json }
      narration_total_char_limit: { Args: { _video: string }; Returns: number }
      new_referral_code: { Args: never; Returns: string }
      redeem_coupon: { Args: { _code: string }; Returns: string }
      refund_credits: {
        Args: { _amount: number; _reason: string; _user: string }
        Returns: undefined
      }
      spend_credits: {
        Args: { _amount: number; _reason: string; _user: string }
        Returns: string
      }
      stripe_livemode: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
