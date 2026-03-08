-- Habilitar a extensão pgcrypto para geração de UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Criação da tabela price_tables baseada na estrutura usada em PriceTable.tsx
CREATE TABLE IF NOT EXISTS public.price_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    items JSONB DEFAULT '[]'::jsonb, -- Armazena o array de itens: { description: string, price: number }[]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS) por segurança
ALTER TABLE public.price_tables ENABLE ROW LEVEL SECURITY;

-- Política de acesso permissiva para desenvolvimento (permite leitura e escrita para todos)
-- IMPORTANTE: Em produção, restrinja isso para usuários autenticados ou admin
DROP POLICY IF EXISTS "Acesso total a price_tables" ON public.price_tables;
CREATE POLICY "Acesso total a price_tables"
ON public.price_tables
FOR ALL
USING (true);

-- Criação da tabela production_orders baseada na estrutura de pendingProductionOrders do localStorage em orderIntegration.ts
-- Esta tabela armazena as ordens de produção (que podem ser referentes a Armas)
CREATE TABLE IF NOT EXISTS public.production_orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL,
    client TEXT NOT NULL,
    product TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    current_workstation TEXT,
    current_operation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS) para production_orders
ALTER TABLE public.production_orders ENABLE ROW LEVEL SECURITY;

-- Política de acesso para production_orders
DROP POLICY IF EXISTS "Acesso total a production_orders" ON public.production_orders;
CREATE POLICY "Acesso total a production_orders"
ON public.production_orders
FOR ALL
USING (true);

-- Criação da tabela clients (Clientes)
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    nif TEXT,
    addresses JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Habilitar Row Level Security (RLS) para clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Política de acesso para clients
DROP POLICY IF EXISTS "Acesso total a clients" ON public.clients;
CREATE POLICY "Acesso total a clients"
ON public.clients
FOR ALL
USING (true);

-- Inserir cliente padrão para compatibilidade com o fallback em orderIntegration.ts
INSERT INTO public.clients (first_name, last_name)
SELECT 'Cliente', 'Desconhecido'
WHERE NOT EXISTS (SELECT 1 FROM public.clients WHERE first_name = 'Cliente' AND last_name = 'Desconhecido');

-- Adicionar coluna de categoria à tabela de produtos
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT;

-- Criação da tabela contacts (Contactos)
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    nif TEXT,
    address JSONB,
    hearaboutus TEXT,
    created TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso total a contacts" ON public.contacts FOR ALL USING (true);

-- Criação da tabela shooter_profiles (Perfil de Atirador)
CREATE TABLE IF NOT EXISTS public.shooter_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    dominant_hand TEXT,
    dominant_eye TEXT,
    glasses BOOLEAN DEFAULT false,
    shooting_vision TEXT,
    shooting_discipline TEXT,
    practice_frequence TEXT,
    competition_frequence TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT one_owner_check CHECK (
        (client_id IS NOT NULL AND contact_id IS NULL) OR
        (client_id IS NULL AND contact_id IS NOT NULL)
    )
);

ALTER TABLE public.shooter_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso total a shooter_profiles" ON public.shooter_profiles FOR ALL USING (true);