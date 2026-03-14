import { createClient, SupabaseClient } from "@supabase/supabase-js";

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
      production_orders: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          related_order_id: string | null
          order_number: string
          weapon_id: string | null
          client: { id: string; name: string; }
          products: { product_id: string; quantity: number; }[]
          current_workstation: string
          current_operation: string
          status: string
          start_date: string
          due_date: string
          progress: number
          routing: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          related_order_id?: string | null
          order_number: string
          weapon_id?: string | null
          client: { id: string; name: string; }
          products: { product_id: string; quantity: number; }[]
          current_workstation: string
          current_operation: string
          status: string
          start_date: string
          due_date: string
          progress: number
          routing?: Json | null
        }
        Update: Partial<Database['public']['Tables']['production_orders']['Insert']>
        Relationships: []
      },
      products: {
        Row: {
          id: string
          created_at: string
          sku: string
          name: string
          description: string | null
          category: string | null
          product_type: string | null
          wood_grade: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          sku: string
          name: string
          description?: string | null
          category?: string | null
          product_type?: string | null
          wood_grade?: string | null
        }
        Update: Partial<Database['public']['Tables']['products']['Insert']>
        Relationships: []
      },
      clients: {
        Row: {
          id: string
          created_at: string
          first_name: string | null
          last_name: string | null
          email: string | null
          phone: string | null
          address: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          address?: Json | null
        }
        Update: Partial<Database['public']['Tables']['clients']['Insert']>
        Relationships: []
      },
      contacts: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          email: string | null
          phone: string | null
          nif: string | null
          address: Json | null
          hearaboutus: string | null
          created: string
          updated: string
        }
        Insert: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          nif?: string | null
          address?: Json | null
          hearaboutus?: string | null
          created?: string
          updated?: string
        }
        Update: Partial<Database['public']['Tables']['contacts']['Insert']>
        Relationships: []
      },
      sales_orders: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          order_number: string
          client_id: string | null
          status: string
          notes: string | null
          priority: string | null
          estimated_completion_date: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          order_number: string
          client_id?: string | null
          status?: string
          notes?: string | null
          priority?: string | null
          estimated_completion_date?: string | null
        }
        Update: Partial<Database['public']['Tables']['sales_orders']['Insert']>
        Relationships: [
          {
            foreignKeyName: "sales_orders_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "clients"
            referencedColumns: ["id"]
          }
        ]
      },
      sales_order_items: {
        Row: {
          id: string
          created_at: string
          sales_order_id: string
          product_id: string
          quantity: number
          customization: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          sales_order_id: string
          product_id: string
          quantity: number
          customization?: Json | null
        }
        Update: Partial<Database['public']['Tables']['sales_order_items']['Insert']>
        Relationships: [
          {
            foreignKeyName: "sales_order_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_order_items_sales_order_id_fkey"
            columns: ["sales_order_id"]
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          }
        ]
      },
      workstations: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['workstations']['Insert']>
        Relationships: []
      },
      operations: {
        Row: {
          id: string
          workstation_id: string
          name: string
          description: string | null
          sequence: number
          setup_time: number | null
          cycle_time: number | null
          created_at: string
        }
        Insert: {
          id?: string
          workstation_id: string
          name: string
          description?: string | null
          sequence?: number
          setup_time?: number | null
          cycle_time?: number | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['operations']['Insert']>
        Relationships: [
          {
            foreignKeyName: "operations_workstation_id_fkey"
            columns: ["workstation_id"]
            referencedRelation: "workstations"
            referencedColumns: ["id"]
          }
        ]
      },
      release_orders: {
        Row: {
          id: string
          created_at: string
          external_order_id: string
          status: string
          items: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          external_order_id: string
          status?: string
          items?: Json | null
        }
        Update: Partial<Database['public']['Tables']['release_orders']['Insert']>
        Relationships: []
      },
      client_weapons: {
        Row: {
          id: string
          created_at: string
          client_id: string
          weapon_id: string
          identification_number: string
        }
        Insert: {
          id?: string
          created_at?: string
          client_id: string
          weapon_id: string
          identification_number: string
        }
        Update: Partial<Database['public']['Tables']['client_weapons']['Insert']>
        Relationships: [
          {
            foreignKeyName: "client_weapons_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_weapons_weapon_id_fkey"
            columns: ["weapon_id"]
            referencedRelation: "weapons"
            referencedColumns: ["id"]
          }
        ]
      },
      weapons: {
        Row: {
          id: string
          created_at: string
          brand: string
          model: string
          serial_number: string
          caliber: string
          dominant_hand: string
          side_plates: string
          barrel_length: number
          barrel_weight: number
          forend_weight: number
          rib: string
          total_weight: number
          discipline: string
          competition_frequency: string
          observations: string | null
          category: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          brand: string
          model: string
          serial_number: string
          caliber: string
          dominant_hand: string
          side_plates: string
          barrel_length: number
          barrel_weight: number
          forend_weight: number
          rib: string
          total_weight: number
          discipline: string
          competition_frequency: string
          observations?: string | null
          category?: string | null
        }
        Update: Partial<Database['public']['Tables']['weapons']['Insert']>
        Relationships: []
      },
      price_tables: {
        Row: {
          id: string
          created_at: string
          name: string
          items: Json
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          items: Json
        }
        Update: Partial<Database['public']['Tables']['price_tables']['Insert']>
        Relationships: []
      },
      price_items: {
        Row: {
          id: string
          price_table_id: string
          description: string
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          price_table_id: string
          description: string
          price: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['price_items']['Insert']>
        Relationships: [
          {
            foreignKeyName: "price_items_price_table_id_fkey"
            columns: ["price_table_id"]
            referencedRelation: "price_tables"
            referencedColumns: ["id"]
          }
        ]
      },
      weapon_categories: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: { id?: string; name: string; created_at?: string }
        Update: { id?: string; name?: string; created_at?: string }
        Relationships: []
      },
      calibers: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: { id?: string; name: string; created_at?: string }
        Update: { id?: string; name?: string; created_at?: string }
        Relationships: []
      },
      dominant_hands: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: { id?: string; name: string; created_at?: string }
        Update: { id?: string; name?: string; created_at?: string }
        Relationships: []
      },
      side_plates: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: { id?: string; name: string; created_at?: string }
        Update: { id?: string; name?: string; created_at?: string }
        Relationships: []
      },
      ribs: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: { id?: string; name: string; created_at?: string }
        Update: { id?: string; name?: string; created_at?: string }
        Relationships: []
      },
      competition_frequencies: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: { id?: string; name: string; created_at?: string }
        Update: { id?: string; name?: string; created_at?: string }
        Relationships: []
      },
      product_types: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: { id?: string; name: string; created_at?: string }
        Update: { id?: string; name?: string; created_at?: string }
        Relationships: []
      },
      wood_grades: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: { id?: string; name: string; created_at?: string }
        Update: { id?: string; name?: string; created_at?: string }
        Relationships: []
      },
      grip_types: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: { id?: string; name: string; created_at?: string }
        Update: { id?: string; name?: string; created_at?: string }
        Relationships: []
      }
      shooter_profiles: {
        Row: {
          id: string
          client_id: string | null
          contact_id: string | null
          dominant_hand: string | null
          dominant_eye: string | null
          glasses: boolean | null
          shooting_vision: string | null
          shooting_discipline: string | null
          practice_frequence: string | null
          competition_frequence: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id?: string | null
          contact_id?: string | null
          dominant_hand?: string | null
          dominant_eye?: string | null
          glasses?: boolean | null
          shooting_vision?: string | null
          shooting_discipline?: string | null
          practice_frequence?: string | null
          competition_frequence?: string | null
        }
        Update: Partial<Database['public']['Tables']['shooter_profiles']['Insert']>
        Relationships: []
      }
      prospects: {
        Row: {
          id: string
          status: string
          first_name: string | null
          last_name: string | null
          email: string | null
          phone: string | null
          nif: string | null
          addresses: Json | null
          weapon_brand: string | null
          weapon_model: string | null
          weapon_category: string | null
          weapon_serial_number: string | null
          weapon_caliber: string | null
          weapon_dominant_hand: string | null
          weapon_side_plates: string | null
          weapon_barrel_length: number | null
          weapon_barrel_weight: number | null
          weapon_forend_weight: number | null
          weapon_rib: string | null
          weapon_total_weight: number | null
          weapon_discipline: string | null
          weapon_competition_frequency: string | null
          weapon_observations: string | null
          gunstock_measurements1: number | null
          gunstock_measurements2: number | null
          gunstock_measurements3: number | null
          gunstock_measurements4: number | null
          gunstock_measurements5: number | null
          gunstock_measurements6: number | null
          gunstock_measurements7: number | null
          gunstock_cast_on1: number | null
          gunstock_cast_on2: number | null
          gunstock_cast_on3: number | null
          gunstock_cast_on4: number | null
          gunstock_cast_off1: number | null
          gunstock_cast_off2: number | null
          gunstock_cast_off3: number | null
          gunstock_cast_off4: number | null
          gunstock_width1: number | null
          gunstock_width2: number | null
          gunstock_width3: number | null
          gunstock_recoil_pad1: number | null
          gunstock_recoil_pad2: number | null
          gunstock_recoil_pad3: number | null
          gunstock_grip_measurements1: number | null
          gunstock_grip_measurements2: number | null
          gunstock_grip_measurements3: number | null
          gunstock_grip_measurements4: number | null
          gunstock_grip_measurements5: number | null
          gunstock_grip_measurements6: number | null
          gunstock_units: string | null
          body_measurements_open_palm1: number | null
          body_measurements_open_palm2: number | null
          body_measurements_open_palm3: number | null
          body_measurements_open_palm4: number | null
          body_measurements_open_palm5: number | null
          body_measurements_open_palm6: number | null
          body_measurements_body1: number | null
          body_measurements_body2: number | null
          body_measurements_body3: number | null
          body_measurements_weight: number | null
          body_measurements_age: number | null
          body_measurements_hand_in_position1: number | null
          body_measurements_hand_in_position2: number | null
          body_measurements_hand_in_position3: number | null
          body_measurements_between_hands: number | null
          body_units: string | null
          forehand_dimensions_top_view1: number | null
          forehand_dimensions_top_view2: number | null
          forehand_dimensions_top_view3: number | null
          forehand_dimensions_side_view4: number | null
          forehand_dimensions_side_view5: number | null
          forehand_dimensions_side_view6: number | null
          forehand_dimensions_side_view7: number | null
          forehand_units: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          status?: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          nif?: string | null
          addresses?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['prospects']['Insert']>
        Relationships: []
      }
      prospect_interactions: {
        Row: {
          id: string
          prospect_id: string
          message_content: string
          message_date: string
          reply_content: string | null
          reply_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          prospect_id: string
          message_content: string
          message_date?: string
          reply_content?: string | null
          reply_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          message_content?: string
          reply_content?: string | null
          reply_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospect_interactions_prospect_id_fkey"
            columns: ["prospect_id"]
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
  );
}

// Em desenvolvimento, usamos a URL local para que as requisições passem pelo proxy
// configurado no vite.config.ts, evitando Erros de CORS.
// Verificamos explicitamente se estamos no localhost para forçar o uso do proxy.
const isLocal = import.meta.env.DEV || (typeof window !== 'undefined' && window.location.hostname === 'localhost');

// Usa a origem atual se estiver no browser (ex: http://localhost:8082), 
// para garantir que usamos a mesma porta onde o proxy está a correr.
const clientUrl = isLocal && typeof window !== 'undefined' 
  ? window.location.origin 
  : (isLocal ? "http://localhost:8082" : supabaseUrl);

if (import.meta.env.DEV) {
  console.log("Supabase Config:", {
    isLocal,
    clientUrl,
    hasKey: !!supabaseKey,
  });
}

// Singleton para evitar múltiplas instâncias durante o desenvolvimento (HMR)
let client: SupabaseClient<Database>;

if (isLocal && typeof window !== 'undefined') {
  const win = window as unknown as { __supabaseClient?: SupabaseClient<Database> };
  if (!win.__supabaseClient) {
    win.__supabaseClient = createClient<Database>(clientUrl, supabaseKey);
  }
  client = win.__supabaseClient!;
} else {
  client = createClient<Database>(clientUrl, supabaseKey);
}

export const supabase = client;