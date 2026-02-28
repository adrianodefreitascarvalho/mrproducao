-- Adiciona a coluna category à tabela weapons se ela não existir
ALTER TABLE public.weapons ADD COLUMN IF NOT EXISTS category text;