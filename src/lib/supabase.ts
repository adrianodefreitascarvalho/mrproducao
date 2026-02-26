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
          product_type: string | null
          wood_grade: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          sku: string
          name: string
          description?: string | null
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
        }
        Update: Partial<Database['public']['Tables']['weapons']['Insert']>
        Relationships: []
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