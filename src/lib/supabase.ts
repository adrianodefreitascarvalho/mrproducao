import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://mrproducao.lovable.app";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yY2Zpcm9kaGdheGZsdWhyeWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDk1NTIsImV4cCI6MjA4NzUyNTU1Mn0.Pbaafc5HhtiZf5QJ4KWKDQMi3ScdK0RWrtLD0zy-KcA";

// Em desenvolvimento, usamos a URL local para que as requisições passem pelo proxy
// configurado no vite.config.ts, evitando Erros de CORS.
// Verificamos explicitamente se estamos no localhost para forçar o uso do proxy.
const isLocal = import.meta.env.DEV || (typeof window !== 'undefined' && window.location.hostname === 'localhost');

// Usa a origem atual se estiver no browser (ex: http://localhost:8082), 
// para garantir que usamos a mesma porta onde o proxy está a correr.
const clientUrl = isLocal && typeof window !== 'undefined' 
  ? window.location.origin 
  : (isLocal ? "http://localhost:8082" : supabaseUrl);

console.log("Supabase Config:", {
  isLocal,
  clientUrl,
  hasKey: !!supabaseKey, // Verifica se a chave existe (true/false)
  targetUrl: supabaseUrl // Para verificar se a variável de ambiente está carregada
});

// Singleton para evitar múltiplas instâncias durante o desenvolvimento (HMR)
let client: ReturnType<typeof createClient>;

if (isLocal && typeof window !== 'undefined') {
  const win = window as unknown as { __supabaseClient?: ReturnType<typeof createClient> };
  if (!win.__supabaseClient) {
    win.__supabaseClient = createClient(clientUrl, supabaseKey);
  }
  client = win.__supabaseClient as ReturnType<typeof createClient>;
} else {
  client = createClient(clientUrl, supabaseKey);
}

export const supabase = client;