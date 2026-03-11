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
      body_measurements: {
        Row: {
          body_measurements_age: number | null
          body_measurements_between_hands: number | null
          body_measurements_body1: number | null
          body_measurements_body2: number | null
          body_measurements_body3: number | null
          body_measurements_hand_in_position1: number | null
          body_measurements_hand_in_position2: number | null
          body_measurements_hand_in_position3: number | null
          body_measurements_open_palm1: number | null
          body_measurements_open_palm2: number | null
          body_measurements_open_palm3: number | null
          body_measurements_open_palm4: number | null
          body_measurements_open_palm5: number | null
          body_measurements_open_palm6: number | null
          body_measurements_weight: number | null
          client_id: string | null
          created_at: string
          id: string
          order_id: string | null
          units: string | null
          updated_at: string
          weapon_id: string | null
        }
        Insert: {
          body_measurements_age?: number | null
          body_measurements_between_hands?: number | null
          body_measurements_body1?: number | null
          body_measurements_body2?: number | null
          body_measurements_body3?: number | null
          body_measurements_hand_in_position1?: number | null
          body_measurements_hand_in_position2?: number | null
          body_measurements_hand_in_position3?: number | null
          body_measurements_open_palm1?: number | null
          body_measurements_open_palm2?: number | null
          body_measurements_open_palm3?: number | null
          body_measurements_open_palm4?: number | null
          body_measurements_open_palm5?: number | null
          body_measurements_open_palm6?: number | null
          body_measurements_weight?: number | null
          client_id?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          units?: string | null
          updated_at?: string
          weapon_id?: string | null
        }
        Update: {
          body_measurements_age?: number | null
          body_measurements_between_hands?: number | null
          body_measurements_body1?: number | null
          body_measurements_body2?: number | null
          body_measurements_body3?: number | null
          body_measurements_hand_in_position1?: number | null
          body_measurements_hand_in_position2?: number | null
          body_measurements_hand_in_position3?: number | null
          body_measurements_open_palm1?: number | null
          body_measurements_open_palm2?: number | null
          body_measurements_open_palm3?: number | null
          body_measurements_open_palm4?: number | null
          body_measurements_open_palm5?: number | null
          body_measurements_open_palm6?: number | null
          body_measurements_weight?: number | null
          client_id?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          units?: string | null
          updated_at?: string
          weapon_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "body_measurements_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "body_measurements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "production_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      calibers: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      client_weapons: {
        Row: {
          client_id: string
          created_at: string
          id: string
          identification_number: string
          weapon_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          identification_number: string
          weapon_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          identification_number?: string
          weapon_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_weapons_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_weapons_weapon_id_fkey"
            columns: ["weapon_id"]
            isOneToOne: false
            referencedRelation: "weapons"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          addresses: Json | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
        }
        Insert: {
          addresses?: Json | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
        }
        Update: {
          addresses?: Json | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      competition_frequencies: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          address: Json | null
          created: string
          email: string | null
          first_name: string | null
          hearaboutus: string | null
          id: string
          last_name: string | null
          nif: string | null
          phone: string | null
          updated: string
        }
        Insert: {
          address?: Json | null
          created?: string
          email?: string | null
          first_name?: string | null
          hearaboutus?: string | null
          id?: string
          last_name?: string | null
          nif?: string | null
          phone?: string | null
          updated?: string
        }
        Update: {
          address?: Json | null
          created?: string
          email?: string | null
          first_name?: string | null
          hearaboutus?: string | null
          id?: string
          last_name?: string | null
          nif?: string | null
          phone?: string | null
          updated?: string
        }
        Relationships: []
      }
      dominant_hands: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      forehand_dimensions: {
        Row: {
          client_id: string | null
          created_at: string
          forehand_dimensions_side_view4: number | null
          forehand_dimensions_side_view5: number | null
          forehand_dimensions_side_view6: number | null
          forehand_dimensions_side_view7: number | null
          forehand_dimensions_top_view1: number | null
          forehand_dimensions_top_view2: number | null
          forehand_dimensions_top_view3: number | null
          id: string
          order_id: string | null
          units: string | null
          updated_at: string
          weapon_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          forehand_dimensions_side_view4?: number | null
          forehand_dimensions_side_view5?: number | null
          forehand_dimensions_side_view6?: number | null
          forehand_dimensions_side_view7?: number | null
          forehand_dimensions_top_view1?: number | null
          forehand_dimensions_top_view2?: number | null
          forehand_dimensions_top_view3?: number | null
          id?: string
          order_id?: string | null
          units?: string | null
          updated_at?: string
          weapon_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          forehand_dimensions_side_view4?: number | null
          forehand_dimensions_side_view5?: number | null
          forehand_dimensions_side_view6?: number | null
          forehand_dimensions_side_view7?: number | null
          forehand_dimensions_top_view1?: number | null
          forehand_dimensions_top_view2?: number | null
          forehand_dimensions_top_view3?: number | null
          id?: string
          order_id?: string | null
          units?: string | null
          updated_at?: string
          weapon_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forehand_dimensions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forehand_dimensions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "production_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      grip_types: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      gunstock_dimensions: {
        Row: {
          client_id: string | null
          created_at: string
          gunstock_cast_off1: number | null
          gunstock_cast_off2: number | null
          gunstock_cast_off3: number | null
          gunstock_cast_off4: number | null
          gunstock_cast_on1: number | null
          gunstock_cast_on2: number | null
          gunstock_cast_on3: number | null
          gunstock_cast_on4: number | null
          gunstock_measurements1: number | null
          gunstock_measurements2: number | null
          gunstock_measurements3: number | null
          gunstock_measurements4: number | null
          gunstock_measurements5: number | null
          gunstock_measurements6: number | null
          gunstock_measurements7: number | null
          gunstock_recoil_pad1: number | null
          gunstock_recoil_pad2: number | null
          gunstock_recoil_pad3: number | null
          gunstock_width1: number | null
          gunstock_width2: number | null
          gunstock_width3: number | null
          id: string
          order_id: string | null
          units: string | null
          updated_at: string
          weapon_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          gunstock_cast_off1?: number | null
          gunstock_cast_off2?: number | null
          gunstock_cast_off3?: number | null
          gunstock_cast_off4?: number | null
          gunstock_cast_on1?: number | null
          gunstock_cast_on2?: number | null
          gunstock_cast_on3?: number | null
          gunstock_cast_on4?: number | null
          gunstock_measurements1?: number | null
          gunstock_measurements2?: number | null
          gunstock_measurements3?: number | null
          gunstock_measurements4?: number | null
          gunstock_measurements5?: number | null
          gunstock_measurements6?: number | null
          gunstock_measurements7?: number | null
          gunstock_recoil_pad1?: number | null
          gunstock_recoil_pad2?: number | null
          gunstock_recoil_pad3?: number | null
          gunstock_width1?: number | null
          gunstock_width2?: number | null
          gunstock_width3?: number | null
          id?: string
          order_id?: string | null
          units?: string | null
          updated_at?: string
          weapon_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          gunstock_cast_off1?: number | null
          gunstock_cast_off2?: number | null
          gunstock_cast_off3?: number | null
          gunstock_cast_off4?: number | null
          gunstock_cast_on1?: number | null
          gunstock_cast_on2?: number | null
          gunstock_cast_on3?: number | null
          gunstock_cast_on4?: number | null
          gunstock_measurements1?: number | null
          gunstock_measurements2?: number | null
          gunstock_measurements3?: number | null
          gunstock_measurements4?: number | null
          gunstock_measurements5?: number | null
          gunstock_measurements6?: number | null
          gunstock_measurements7?: number | null
          gunstock_recoil_pad1?: number | null
          gunstock_recoil_pad2?: number | null
          gunstock_recoil_pad3?: number | null
          gunstock_width1?: number | null
          gunstock_width2?: number | null
          gunstock_width3?: number | null
          id?: string
          order_id?: string | null
          units?: string | null
          updated_at?: string
          weapon_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gunstock_dimensions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gunstock_dimensions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "production_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      operations: {
        Row: {
          created_at: string
          cycle_time: number | null
          description: string | null
          id: string
          name: string
          sequence: number
          setup_time: number | null
          workstation_id: string
        }
        Insert: {
          created_at?: string
          cycle_time?: number | null
          description?: string | null
          id?: string
          name: string
          sequence?: number
          setup_time?: number | null
          workstation_id: string
        }
        Update: {
          created_at?: string
          cycle_time?: number | null
          description?: string | null
          id?: string
          name?: string
          sequence?: number
          setup_time?: number | null
          workstation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "operations_workstation_id_fkey"
            columns: ["workstation_id"]
            isOneToOne: false
            referencedRelation: "workstations"
            referencedColumns: ["id"]
          },
        ]
      }
      price_items: {
        Row: {
          created_at: string
          description: string
          id: string
          price: number
          price_table_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          price?: number
          price_table_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          price?: number
          price_table_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_items_price_table_id_fkey"
            columns: ["price_table_id"]
            isOneToOne: false
            referencedRelation: "price_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      price_tables: {
        Row: {
          id: string
          items: Json | null
          name: string
        }
        Insert: {
          id: string
          items?: Json | null
          name: string
        }
        Update: {
          id?: string
          items?: Json | null
          name?: string
        }
        Relationships: []
      }
      product_types: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      production_orders: {
        Row: {
          client: string
          created_at: string
          current_operation: string | null
          current_workstation: string | null
          due_date: string | null
          id: string
          order_number: string
          product: string
          progress: number | null
          quantity: number
          routing: Json | null
          start_date: string | null
          status: string
        }
        Insert: {
          client: string
          created_at?: string
          current_operation?: string | null
          current_workstation?: string | null
          due_date?: string | null
          id: string
          order_number: string
          product: string
          progress?: number | null
          quantity: number
          routing?: Json | null
          start_date?: string | null
          status: string
        }
        Update: {
          client?: string
          created_at?: string
          current_operation?: string | null
          current_workstation?: string | null
          due_date?: string | null
          id?: string
          order_number?: string
          product?: string
          progress?: number | null
          quantity?: number
          routing?: Json | null
          start_date?: string | null
          status?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          product_type: string | null
          sku: string
          wood_grade: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          product_type?: string | null
          sku: string
          wood_grade?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          product_type?: string | null
          sku?: string
          wood_grade?: string | null
        }
        Relationships: []
      }
      release_orders: {
        Row: {
          created_at: string
          external_order_id: string
          id: string
          items: Json | null
          status: string
        }
        Insert: {
          created_at?: string
          external_order_id: string
          id?: string
          items?: Json | null
          status?: string
        }
        Update: {
          created_at?: string
          external_order_id?: string
          id?: string
          items?: Json | null
          status?: string
        }
        Relationships: []
      }
      ribs: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      sales_order_items: {
        Row: {
          created_at: string
          customization: Json | null
          id: string
          product_id: string
          quantity: number
          sales_order_id: string
        }
        Insert: {
          created_at?: string
          customization?: Json | null
          id?: string
          product_id: string
          quantity: number
          sales_order_id: string
        }
        Update: {
          created_at?: string
          customization?: Json | null
          id?: string
          product_id?: string
          quantity?: number
          sales_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_order_items_sales_order_id_fkey"
            columns: ["sales_order_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_orders: {
        Row: {
          client_id: string | null
          created_at: string
          estimated_completion_date: string | null
          id: string
          notes: string | null
          order_number: string
          priority: string | null
          status: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          estimated_completion_date?: string | null
          id?: string
          notes?: string | null
          order_number: string
          priority?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          estimated_completion_date?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          priority?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      shooter_profiles: {
        Row: {
          client_id: string | null
          competition_frequence: string | null
          contact_id: string | null
          created_at: string
          dominant_eye: string | null
          dominant_hand: string | null
          glasses: boolean | null
          id: string
          practice_frequence: string | null
          shooting_discipline: string | null
          shooting_vision: string | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          competition_frequence?: string | null
          contact_id?: string | null
          created_at?: string
          dominant_eye?: string | null
          dominant_hand?: string | null
          glasses?: boolean | null
          id?: string
          practice_frequence?: string | null
          shooting_discipline?: string | null
          shooting_vision?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          competition_frequence?: string | null
          contact_id?: string | null
          created_at?: string
          dominant_eye?: string | null
          dominant_hand?: string | null
          glasses?: boolean | null
          id?: string
          practice_frequence?: string | null
          shooting_discipline?: string | null
          shooting_vision?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shooter_profiles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shooter_profiles_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      side_plates: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      weapon_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      weapons: {
        Row: {
          barrel_length: number
          barrel_weight: number
          brand: string
          caliber: string
          category: string | null
          competition_frequency: string
          created_at: string
          discipline: string
          dominant_hand: string
          forend_weight: number
          id: string
          model: string
          rib: string
          serial_number: string
          side_plates: string
          total_weight: number
        }
        Insert: {
          barrel_length: number
          barrel_weight: number
          brand: string
          caliber: string
          category?: string | null
          competition_frequency: string
          created_at?: string
          discipline: string
          dominant_hand: string
          forend_weight: number
          id?: string
          model: string
          rib: string
          serial_number: string
          side_plates: string
          total_weight: number
        }
        Update: {
          barrel_length?: number
          barrel_weight?: number
          brand?: string
          caliber?: string
          category?: string | null
          competition_frequency?: string
          created_at?: string
          discipline?: string
          dominant_hand?: string
          forend_weight?: number
          id?: string
          model?: string
          rib?: string
          serial_number?: string
          side_plates?: string
          total_weight?: number
        }
        Relationships: []
      }
      wood_grades: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      workstations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
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
