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
    weapon_id UUID,
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
    source_contact_id UUID,
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
    
    gunstock_measurements1 NUMERIC(10, 2),
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

    gunstock_grip_measurements1 NUMERIC(10, 2),
    gunstock_grip_measurements2 NUMERIC(10, 2),
    gunstock_grip_measurements3 NUMERIC(10, 2),
    gunstock_grip_measurements4 NUMERIC(10, 2),
    gunstock_grip_measurements5 NUMERIC(10, 2),
    gunstock_grip_measurements6 NUMERIC(10, 2),

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

-- Criação da tabela weapons (Armas)
CREATE TABLE IF NOT EXISTS public.weapons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT,
    model TEXT,
    category TEXT,
    serial_number TEXT,
    caliber TEXT,
    dominant_hand TEXT,
    side_plates TEXT,
    barrel_length NUMERIC(10, 2),
    barrel_weight NUMERIC(10, 2),
    forend_weight NUMERIC(10, 2),
    rib TEXT,
    total_weight NUMERIC(10, 2),
    discipline TEXT,
    competition_frequency TEXT,
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.weapons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso total a weapons" ON public.weapons FOR ALL USING (true);

-- Tabela de associação entre clientes e armas
CREATE TABLE IF NOT EXISTS public.client_weapons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    weapon_id UUID NOT NULL REFERENCES public.weapons(id) ON DELETE CASCADE,
    identification_number TEXT, -- Número de série específico desta arma para este cliente
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(client_id, weapon_id, identification_number)
);

ALTER TABLE public.client_weapons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso total a client_weapons" ON public.client_weapons FOR ALL USING (true);


-- Atualizar Foreign Keys para apontar para a nova tabela weapons
-- Nota: Executar estes comandos pode falhar se já existirem dados.
-- É uma correção de schema para novas instalações.

-- Adicionar coluna de FK em production_orders para a nova tabela weapons
ALTER TABLE public.production_orders DROP COLUMN IF EXISTS weapon_id;
ALTER TABLE public.production_orders ADD COLUMN weapon_id UUID REFERENCES public.weapons(id) ON DELETE SET NULL;

-- Adicionar coluna de FK em gunstock_dimensions
ALTER TABLE public.gunstock_dimensions DROP COLUMN IF EXISTS weapon_id;
ALTER TABLE public.gunstock_dimensions ADD COLUMN weapon_id UUID REFERENCES public.weapons(id) ON DELETE SET NULL;

-- Adicionar coluna de FK em body_measurements
ALTER TABLE public.body_measurements DROP COLUMN IF EXISTS weapon_id;
ALTER TABLE public.body_measurements ADD COLUMN weapon_id UUID REFERENCES public.weapons(id) ON DELETE SET NULL;

-- Adicionar coluna de FK em forehand_dimensions
ALTER TABLE public.forehand_dimensions DROP COLUMN IF EXISTS weapon_id;
ALTER TABLE public.forehand_dimensions ADD COLUMN weapon_id UUID REFERENCES public.weapons(id) ON DELETE SET NULL;

-- Tabela para Prospects (Leads) com dados completos para recolha de informação
CREATE TABLE IF NOT EXISTS public.prospects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status TEXT NOT NULL DEFAULT 'prospect' CHECK (status IN ('prospect', 'converted')),

    -- Dados do Prospect (semelhante a clients)
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    nif TEXT,
    addresses JSONB,

    -- Dados da Arma Potencial (semelhante a weapons)
    weapon_brand TEXT,
    weapon_model TEXT,
    weapon_category TEXT,
    weapon_serial_number TEXT,
    weapon_caliber TEXT,
    weapon_dominant_hand TEXT,
    weapon_side_plates TEXT,
    weapon_barrel_length NUMERIC(10, 2),
    weapon_barrel_weight NUMERIC(10, 2),
    weapon_forend_weight NUMERIC(10, 2),
    weapon_rib TEXT,
    weapon_total_weight NUMERIC(10, 2),
    weapon_discipline TEXT,
    weapon_competition_frequency TEXT,
    weapon_observations TEXT,

    -- Medidas da Coronha (de gunstock_dimensions)
    gunstock_measurements1 NUMERIC(10, 2),
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
    gunstock_grip_measurements1 NUMERIC(10, 2),
    gunstock_grip_measurements2 NUMERIC(10, 2),
    gunstock_grip_measurements3 NUMERIC(10, 2),
    gunstock_grip_measurements4 NUMERIC(10, 2),
    gunstock_grip_measurements5 NUMERIC(10, 2),
    gunstock_grip_measurements6 NUMERIC(10, 2),
    gunstock_units TEXT DEFAULT 'cm',

    -- Medidas Corporais (de body_measurements)
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
    body_units TEXT DEFAULT 'cm',

    -- Medidas do Fuste (de forehand_dimensions)
    forehand_dimensions_top_view1 NUMERIC(10, 2),
    forehand_dimensions_top_view2 NUMERIC(10, 2),
    forehand_dimensions_top_view3 NUMERIC(10, 2),
    forehand_dimensions_side_view4 NUMERIC(10, 2),
    forehand_dimensions_side_view5 NUMERIC(10, 2),
    forehand_dimensions_side_view6 NUMERIC(10, 2),
    forehand_dimensions_side_view7 NUMERIC(10, 2),
    forehand_units TEXT DEFAULT 'cm',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso total a prospects" ON public.prospects FOR ALL USING (true);

-- Função para converter um Prospect num Cliente, Arma e Medidas
CREATE OR REPLACE FUNCTION public.convert_prospect_to_client()
RETURNS TRIGGER AS $$
DECLARE
    new_client_id UUID;
    new_weapon_id UUID;
BEGIN
    -- Apenas executar se o status for alterado para 'converted'
    IF NEW.status = 'converted' AND OLD.status = 'prospect' THEN
        -- 1. Inserir na tabela de clientes
        INSERT INTO public.clients (first_name, last_name, email, phone, nif, addresses, created_at, updated_at)
        VALUES (NEW.first_name, NEW.last_name, NEW.email, NEW.phone, NEW.nif, NEW.addresses, NEW.created_at, NOW())
        RETURNING id INTO new_client_id;

        -- 2. Inserir na tabela de armas (se houver dados da arma)
        IF NEW.weapon_brand IS NOT NULL OR NEW.weapon_model IS NOT NULL THEN
            INSERT INTO public.weapons (brand, model, category, serial_number, caliber, dominant_hand, side_plates, barrel_length, barrel_weight, forend_weight, rib, total_weight, discipline, competition_frequency, observations)
            VALUES (NEW.weapon_brand, NEW.weapon_model, NEW.weapon_category, NEW.weapon_serial_number, NEW.weapon_caliber, NEW.weapon_dominant_hand, NEW.weapon_side_plates, NEW.weapon_barrel_length, NEW.weapon_barrel_weight, NEW.weapon_forend_weight, NEW.weapon_rib, NEW.weapon_total_weight, NEW.weapon_discipline, NEW.weapon_competition_frequency, NEW.weapon_observations)
            RETURNING id INTO new_weapon_id;

            -- Associar a nova arma ao novo cliente
            INSERT INTO public.client_weapons (client_id, weapon_id, identification_number)
            VALUES (new_client_id, new_weapon_id, NEW.weapon_serial_number);
        END IF;

        -- 3. Inserir medidas (se existirem e se uma arma foi criada)
        IF new_weapon_id IS NOT NULL THEN
            -- Medidas da coronha
            INSERT INTO public.gunstock_dimensions (client_id, weapon_id, gunstock_measurements1, gunstock_measurements2, gunstock_measurements3, gunstock_measurements4, gunstock_measurements5, gunstock_measurements6, gunstock_measurements7, gunstock_cast_on1, gunstock_cast_on2, gunstock_cast_on3, gunstock_cast_on4, gunstock_cast_off1, gunstock_cast_off2, gunstock_cast_off3, gunstock_cast_off4, gunstock_width1, gunstock_width2, gunstock_width3, gunstock_recoil_pad1, gunstock_recoil_pad2, gunstock_recoil_pad3, gunstock_grip_measurements1, gunstock_grip_measurements2, gunstock_grip_measurements3, gunstock_grip_measurements4, gunstock_grip_measurements5, gunstock_grip_measurements6, units)
            VALUES (new_client_id, new_weapon_id, NEW.gunstock_measurements1, NEW.gunstock_measurements2, NEW.gunstock_measurements3, NEW.gunstock_measurements4, NEW.gunstock_measurements5, NEW.gunstock_measurements6, NEW.gunstock_measurements7, NEW.gunstock_cast_on1, NEW.gunstock_cast_on2, NEW.gunstock_cast_on3, NEW.gunstock_cast_on4, NEW.gunstock_cast_off1, NEW.gunstock_cast_off2, NEW.gunstock_cast_off3, NEW.gunstock_cast_off4, NEW.gunstock_width1, NEW.gunstock_width2, NEW.gunstock_width3, NEW.gunstock_recoil_pad1, NEW.gunstock_recoil_pad2, NEW.gunstock_recoil_pad3, NEW.gunstock_grip_measurements1, NEW.gunstock_grip_measurements2, NEW.gunstock_grip_measurements3, NEW.gunstock_grip_measurements4, NEW.gunstock_grip_measurements5, NEW.gunstock_grip_measurements6, NEW.gunstock_units);

            -- Medidas corporais
            INSERT INTO public.body_measurements (client_id, weapon_id, body_measurements_open_palm1, body_measurements_open_palm2, body_measurements_open_palm3, body_measurements_open_palm4, body_measurements_open_palm5, body_measurements_open_palm6, body_measurements_body1, body_measurements_body2, body_measurements_body3, body_measurements_weight, body_measurements_age, body_measurements_hand_in_position1, body_measurements_hand_in_position2, body_measurements_hand_in_position3, body_measurements_between_hands, units)
            VALUES (new_client_id, new_weapon_id, NEW.body_measurements_open_palm1, NEW.body_measurements_open_palm2, NEW.body_measurements_open_palm3, NEW.body_measurements_open_palm4, NEW.body_measurements_open_palm5, NEW.body_measurements_open_palm6, NEW.body_measurements_body1, NEW.body_measurements_body2, NEW.body_measurements_body3, NEW.body_measurements_weight, NEW.body_measurements_age, NEW.body_measurements_hand_in_position1, NEW.body_measurements_hand_in_position2, NEW.body_measurements_hand_in_position3, NEW.body_measurements_between_hands, NEW.body_units);

            -- Medidas do fuste
            INSERT INTO public.forehand_dimensions (client_id, weapon_id, forehand_dimensions_top_view1, forehand_dimensions_top_view2, forehand_dimensions_top_view3, forehand_dimensions_side_view4, forehand_dimensions_side_view5, forehand_dimensions_side_view6, forehand_dimensions_side_view7, units)
            VALUES (new_client_id, new_weapon_id, NEW.forehand_dimensions_top_view1, NEW.forehand_dimensions_top_view2, NEW.forehand_dimensions_top_view3, NEW.forehand_dimensions_side_view4, NEW.forehand_dimensions_side_view5, NEW.forehand_dimensions_side_view6, NEW.forehand_dimensions_side_view7, NEW.forehand_units);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para executar a função quando o status de um prospect é atualizado
CREATE TRIGGER on_prospect_converted
    AFTER UPDATE ON public.prospects
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION public.convert_prospect_to_client();