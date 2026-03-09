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

-- Criação da tabela gunstock_dimensions
CREATE TABLE IF NOT EXISTS public.gunstock_dimensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT REFERENCES public.production_orders(id) ON DELETE SET NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    weapon_id UUID, -- FK para weapons(id) pode ser adicionada quando a tabela for formalmente definida no schema
    
    gunstock_measurements NUMERIC(10, 2),
    gunstock_measurements2 NUMERIC(10, 2),
    gunstock_measurements3 NUMERIC(10, 2),
    gunstock_measurements4 NUMERIC(10, 2),
    gunstock_measurements5 NUMERIC(10, 2),
    gunstock_measurements6 NUMERIC(10, 2),
    gunstock_measurements7 NUMERIC(10, 2),
    
    gunstock_cast_on1 NUMERIC(10, 2),
    gunstock_cast_on2 NUMERIC(10, 2),
    gunstock_cast_on3 NUMERIC(10, 2),
    gunstock_cast_on4 NUMERIC(10, 2),

    gunstock_cast_off1 NUMERIC(10, 2),
    gunstock_cast_off2 NUMERIC(10, 2),
    gunstock_cast_off3 NUMERIC(10, 2),
    gunstock_cast_off4 NUMERIC(10, 2),

    gunstock_width1 NUMERIC(10, 2),
    gunstock_width2 NUMERIC(10, 2),
    gunstock_width3 NUMERIC(10, 2),

    gunstock_recoil_pad1 NUMERIC(10, 2),
    gunstock_recoil_pad2 NUMERIC(10, 2),
    gunstock_recoil_pad3 NUMERIC(10, 2),

    units TEXT DEFAULT 'cm' CHECK (units IN ('cm', 'inches')),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.gunstock_dimensions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso total a gunstock_dimensions" ON public.gunstock_dimensions FOR ALL USING (true);

-- Criação da tabela body_measurements
CREATE TABLE IF NOT EXISTS public.body_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT REFERENCES public.production_orders(id) ON DELETE SET NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    weapon_id UUID,
    
    body_measurements_open_palm1 NUMERIC(10, 2),
    body_measurements_open_palm2 NUMERIC(10, 2),
    body_measurements_open_palm3 NUMERIC(10, 2),
    body_measurements_open_palm4 NUMERIC(10, 2),
    body_measurements_open_palm5 NUMERIC(10, 2),
    body_measurements_open_palm6 NUMERIC(10, 2),

    body_measurements_body1 NUMERIC(10, 2),
    body_measurements_body2 NUMERIC(10, 2),
    body_measurements_body3 NUMERIC(10, 2),

    body_measurements_weight NUMERIC(10, 2),
    body_measurements_age NUMERIC(10, 2),

    body_measurements_hand_in_position1 NUMERIC(10, 2),
    body_measurements_hand_in_position2 NUMERIC(10, 2),
    body_measurements_hand_in_position3 NUMERIC(10, 2),

    body_measurements_between_hands NUMERIC(10, 2),

    units TEXT DEFAULT 'cm' CHECK (units IN ('cm', 'inches')),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso total a body_measurements" ON public.body_measurements FOR ALL USING (true);

-- Criação da tabela forehand_dimensions
CREATE TABLE IF NOT EXISTS public.forehand_dimensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT REFERENCES public.production_orders(id) ON DELETE SET NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    weapon_id UUID,
    
    forehand_dimensions_top_view1 NUMERIC(10, 2),
    forehand_dimensions_top_view2 NUMERIC(10, 2),
    forehand_dimensions_top_view3 NUMERIC(10, 2),
    
    forehand_dimensions_side_view4 NUMERIC(10, 2),
    forehand_dimensions_side_view5 NUMERIC(10, 2),
    forehand_dimensions_side_view6 NUMERIC(10, 2),
    forehand_dimensions_side_view7 NUMERIC(10, 2),

    units TEXT DEFAULT 'cm' CHECK (units IN ('cm', 'inches')),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.forehand_dimensions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso total a forehand_dimensions" ON public.forehand_dimensions FOR ALL USING (true);