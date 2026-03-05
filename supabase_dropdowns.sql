-- Criar tabelas para as listas suspensas (dropdowns)

CREATE TABLE IF NOT EXISTS public.weapon_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.calibers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.dominant_hands (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.side_plates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ribs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.competition_frequencies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_types (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wood_grades (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.grip_types (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Inserir valores padrão (baseados no código existente)

INSERT INTO public.weapon_categories (name) VALUES
('Platinas L_IV'), ('Platinas D_IF'), ('Platinas SO'), ('Meias Platinas'), ('Semi Automáticas'), ('Carabinas'), ('Carabinas 2'), ('Ergonómicas')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.calibers (name) VALUES
('12'), ('16'), ('20'), ('28'), ('410')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.dominant_hands (name) VALUES
('Direita'), ('Esquerda')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.side_plates (name) VALUES
('Inteiras'), ('Inteiras falsas'), ('Meias')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.ribs (name) VALUES
('Alta'), ('Media'), ('Baixa'), ('Rasa'), ('Ajustável')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.competition_frequencies (name) VALUES
('Não Frequente'), ('Frequente'), ('Intensiva'), ('Profissional')
ON CONFLICT (name) DO NOTHING;

-- Unificação dos tipos de produto encontrados em NewProduct e EditProduct
INSERT INTO public.product_types (name) VALUES
('Coronha'), ('Fuste'), ('Reparação'), ('Garantia'), ('Outro'), ('Semi-Automática'), ('Carabina'), ('Punho Glove')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.wood_grades (name) VALUES
('Grau 1'), ('Grau 2'), ('Grau 3'), ('Grau 4'), ('Grau 5'), ('Exhibition')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.grip_types (name) VALUES
('Punho Normal'), ('Punho Pistola'), ('Punho anatómico com dedos'), ('Punho anatómico sem dedos'), ('Punho papo de rôla')
ON CONFLICT (name) DO NOTHING;