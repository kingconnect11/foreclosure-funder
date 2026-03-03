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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      court_research: {
        Row: {
          created_at: string | null
          estimated_offer_max: number | null
          estimated_offer_min: number | null
          id: string
          judgments: Json | null
          liens: Json | null
          property_id: string
          research_summary: string | null
          researched_at: string | null
          title_status: Database["public"]["Enums"]["title_status"] | null
        }
        Insert: {
          created_at?: string | null
          estimated_offer_max?: number | null
          estimated_offer_min?: number | null
          id?: string
          judgments?: Json | null
          liens?: Json | null
          property_id: string
          research_summary?: string | null
          researched_at?: string | null
          title_status?: Database["public"]["Enums"]["title_status"] | null
        }
        Update: {
          created_at?: string | null
          estimated_offer_max?: number | null
          estimated_offer_min?: number | null
          id?: string
          judgments?: Json | null
          liens?: Json | null
          property_id?: string
          research_summary?: string | null
          researched_at?: string | null
          title_status?: Database["public"]["Enums"]["title_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "court_research_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_rooms: {
        Row: {
          brand_colors: Json | null
          brand_logo_url: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          name: string
          owner_id: string | null
          settings: Json | null
          website_url: string | null
        }
        Insert: {
          brand_colors?: Json | null
          brand_logo_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          name: string
          owner_id?: string | null
          settings?: Json | null
          website_url?: string | null
        }
        Update: {
          brand_colors?: Json | null
          brand_logo_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          settings?: Json | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_deal_rooms_owner"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_pipeline: {
        Row: {
          created_at: string | null
          deal_room_id: string | null
          group_notes: string | null
          id: string
          investor_id: string
          notes: string | null
          offer_amount: number | null
          property_id: string
          stage: Database["public"]["Enums"]["pipeline_stage"] | null
          stage_changed_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deal_room_id?: string | null
          group_notes?: string | null
          id?: string
          investor_id: string
          notes?: string | null
          offer_amount?: number | null
          property_id: string
          stage?: Database["public"]["Enums"]["pipeline_stage"] | null
          stage_changed_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deal_room_id?: string | null
          group_notes?: string | null
          id?: string
          investor_id?: string
          notes?: string | null
          offer_amount?: number | null
          property_id?: string
          stage?: Database["public"]["Enums"]["pipeline_stage"] | null
          stage_changed_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investor_pipeline_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_pipeline_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_pipeline_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_preferences: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          condition_preference:
            | Database["public"]["Enums"]["condition_preference"]
            | null
          created_at: string | null
          deal_breakers: string[] | null
          desired_features: string[] | null
          dream_property_description: string | null
          financing_method:
            | Database["public"]["Enums"]["financing_method"]
            | null
          id: string
          intended_use: string[] | null
          investor_id: string
          location_preferences: Json | null
          property_types: string[] | null
          raw_preferences_json: Json | null
          risk_tolerance: number | null
          timeline_preference: string | null
          updated_at: string | null
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          condition_preference?:
            | Database["public"]["Enums"]["condition_preference"]
            | null
          created_at?: string | null
          deal_breakers?: string[] | null
          desired_features?: string[] | null
          dream_property_description?: string | null
          financing_method?:
            | Database["public"]["Enums"]["financing_method"]
            | null
          id?: string
          intended_use?: string[] | null
          investor_id: string
          location_preferences?: Json | null
          property_types?: string[] | null
          raw_preferences_json?: Json | null
          risk_tolerance?: number | null
          timeline_preference?: string | null
          updated_at?: string | null
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          condition_preference?:
            | Database["public"]["Enums"]["condition_preference"]
            | null
          created_at?: string | null
          deal_breakers?: string[] | null
          desired_features?: string[] | null
          dream_property_description?: string | null
          financing_method?:
            | Database["public"]["Enums"]["financing_method"]
            | null
          id?: string
          intended_use?: string[] | null
          investor_id?: string
          location_preferences?: Json | null
          property_types?: string[] | null
          raw_preferences_json?: Json | null
          risk_tolerance?: number | null
          timeline_preference?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investor_preferences_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      markets: {
        Row: {
          county: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          scraper_config: Json | null
          state: string
        }
        Insert: {
          county: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          scraper_config?: Json | null
          state: string
        }
        Update: {
          county?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          scraper_config?: Json | null
          state?: string
        }
        Relationships: []
      }
      pipeline_stage_history: {
        Row: {
          id: string
          pipeline_id: string
          stage: Database["public"]["Enums"]["pipeline_stage"]
          notes: string | null
          entered_at: string | null
          exited_at: string | null
        }
        Insert: {
          id?: string
          pipeline_id: string
          stage: Database["public"]["Enums"]["pipeline_stage"]
          notes?: string | null
          entered_at?: string | null
          exited_at?: string | null
        }
        Update: {
          id?: string
          pipeline_id?: string
          stage?: Database["public"]["Enums"]["pipeline_stage"]
          notes?: string | null
          entered_at?: string | null
          exited_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stage_history_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "investor_pipeline"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_campaigns: {
        Row: {
          created_at: string | null
          deal_room_id: string
          id: string
          property_id: string
          status: Database["public"]["Enums"]["outreach_status"] | null
          touch1_date: string | null
          touch1_sent: boolean | null
          touch2_date: string | null
          touch2_sent: boolean | null
          touch3_date: string | null
          touch3_sent: boolean | null
          touch3b_date: string | null
          touch3b_urgent_sent: boolean | null
        }
        Insert: {
          created_at?: string | null
          deal_room_id: string
          id?: string
          property_id: string
          status?: Database["public"]["Enums"]["outreach_status"] | null
          touch1_date?: string | null
          touch1_sent?: boolean | null
          touch2_date?: string | null
          touch2_sent?: boolean | null
          touch3_date?: string | null
          touch3_sent?: boolean | null
          touch3b_date?: string | null
          touch3b_urgent_sent?: boolean | null
        }
        Update: {
          created_at?: string | null
          deal_room_id?: string
          id?: string
          property_id?: string
          status?: Database["public"]["Enums"]["outreach_status"] | null
          touch1_date?: string | null
          touch1_sent?: boolean | null
          touch2_date?: string | null
          touch2_sent?: boolean | null
          touch3_date?: string | null
          touch3_sent?: boolean | null
          touch3b_date?: string | null
          touch3b_urgent_sent?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "outreach_campaigns_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_campaigns_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          deal_room_id: string | null
          email: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          onboarding_transcript_url: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          subscription_status:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deal_room_id?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          onboarding_transcript_url?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deal_room_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          onboarding_transcript_url?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string | null
          attorney_name: string | null
          bathrooms: number | null
          bedrooms: number | null
          case_number: string
          city: string | null
          county_appraisal: number | null
          created_at: string | null
          defendant_name: string | null
          foreclosure_amount: number | null
          id: string
          market_id: string
          notice_type: Database["public"]["Enums"]["notice_type"] | null
          plaintiff_name: string | null
          property_type: string | null
          rpr_value: number | null
          sale_date: string | null
          scraped_at: string | null
          source_url: string | null
          sqft: number | null
          stage: Database["public"]["Enums"]["property_stage"] | null
          state: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          attorney_name?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          case_number: string
          city?: string | null
          county_appraisal?: number | null
          created_at?: string | null
          defendant_name?: string | null
          foreclosure_amount?: number | null
          id?: string
          market_id: string
          notice_type?: Database["public"]["Enums"]["notice_type"] | null
          plaintiff_name?: string | null
          property_type?: string | null
          rpr_value?: number | null
          sale_date?: string | null
          scraped_at?: string | null
          source_url?: string | null
          sqft?: number | null
          stage?: Database["public"]["Enums"]["property_stage"] | null
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          attorney_name?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          case_number?: string
          city?: string | null
          county_appraisal?: number | null
          created_at?: string | null
          defendant_name?: string | null
          foreclosure_amount?: number | null
          id?: string
          market_id?: string
          notice_type?: Database["public"]["Enums"]["notice_type"] | null
          plaintiff_name?: string | null
          property_type?: string | null
          rpr_value?: number | null
          sale_date?: string | null
          scraped_at?: string | null
          source_url?: string | null
          sqft?: number | null
          stage?: Database["public"]["Enums"]["property_stage"] | null
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendation_scores: {
        Row: {
          computed_at: string | null
          id: string
          investor_id: string
          property_id: string
          reasons: Json | null
          score: number | null
        }
        Insert: {
          computed_at?: string | null
          id?: string
          investor_id: string
          property_id: string
          reasons?: Json | null
          score?: number | null
        }
        Update: {
          computed_at?: string | null
          id?: string
          investor_id?: string
          property_id?: string
          reasons?: Json | null
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_scores_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_scores_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_deal_room_id: { Args: never; Returns: string }
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_watching_count: { Args: { p_property_id: string }; Returns: number }
    }
    Enums: {
      condition_preference:
        | "teardown_ok"
        | "needs_work"
        | "cosmetic_only"
        | "structurally_sound"
      financing_method: "cash" | "loc" | "mortgage" | "mixed"
      notice_type: "new_filing" | "scheduled_sale"
      outreach_status: "active" | "paused" | "completed"
      pipeline_stage:
        | "watching"
        | "researching"
        | "site_visit"
        | "preparing_offer"
        | "offer_submitted"
        | "counter_offered"
        | "offer_accepted"
        | "in_closing"
        | "closed"
        | "rejected"
        | "no_response"
        | "passed"
      property_stage:
        | "new_filing"
        | "sale_date_assigned"
        | "upcoming"
        | "sold"
        | "redeemed"
        | "canceled"
      subscription_status: "trial" | "active" | "canceled" | "expired"
      subscription_tier: "free" | "standard" | "premium"
      title_status: "clean" | "clouded" | "complex"
      user_role: "super_admin" | "admin" | "investor"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      condition_preference: [
        "teardown_ok",
        "needs_work",
        "cosmetic_only",
        "structurally_sound",
      ],
      financing_method: ["cash", "loc", "mortgage", "mixed"],
      notice_type: ["new_filing", "scheduled_sale"],
      outreach_status: ["active", "paused", "completed"],
      pipeline_stage: [
        "watching",
        "researching",
        "site_visit",
        "preparing_offer",
        "offer_submitted",
        "counter_offered",
        "offer_accepted",
        "in_closing",
        "closed",
        "rejected",
        "no_response",
        "passed",
      ],
      property_stage: [
        "new_filing",
        "sale_date_assigned",
        "upcoming",
        "sold",
        "redeemed",
        "canceled",
      ],
      subscription_status: ["trial", "active", "canceled", "expired"],
      subscription_tier: ["free", "standard", "premium"],
      title_status: ["clean", "clouded", "complex"],
      user_role: ["super_admin", "admin", "investor"],
    },
  },
} as const

// Convenience type aliases
export type Property = Database['public']['Tables']['properties']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type InvestorPipeline = Database['public']['Tables']['investor_pipeline']['Row']
export type CourtResearch = Database['public']['Tables']['court_research']['Row']
export type DealRoom = Database['public']['Tables']['deal_rooms']['Row']
export type Market = Database['public']['Tables']['markets']['Row']
export type InvestorPreferences = Database['public']['Tables']['investor_preferences']['Row']
export type RecommendationScore = Database['public']['Tables']['recommendation_scores']['Row']
export type OutreachCampaign = Database['public']['Tables']['outreach_campaigns']['Row']
export type PipelineStage = Database['public']['Enums']['pipeline_stage']

export interface PipelineStageHistory {
  id: string
  pipeline_id: string
  stage: PipelineStage
  notes: string | null
  entered_at: string | null
  exited_at: string | null
}
export type PropertyStage = Database['public']['Enums']['property_stage']
export type UserRole = Database['public']['Enums']['user_role']
export type TitleStatus = Database['public']['Enums']['title_status']
export type SubscriptionTier = Database['public']['Enums']['subscription_tier']
export type SubscriptionStatus = Database['public']['Enums']['subscription_status']
