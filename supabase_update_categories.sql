-- Adicionar colunas de categoria se não existirem
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.weapons ADD COLUMN IF NOT EXISTS category text;

-- Atualizar categorias na tabela de produtos
UPDATE public.products SET category = 'Platinas L_IV' WHERE category = 'Platinas L - IV' OR category = 'Platinas L – IV';
UPDATE public.products SET category = 'Platinas D_IF' WHERE category = 'Platinas D - IF' OR category = 'Platinas D – IF';
UPDATE public.products SET category = 'Meias Platinas' WHERE category = 'Meia Platina';

-- Atualizar categorias na tabela de armas
UPDATE public.weapons SET category = 'Platinas L_IV' WHERE category = 'Platinas L - IV' OR category = 'Platinas L – IV';
UPDATE public.weapons SET category = 'Platinas D_IF' WHERE category = 'Platinas D - IF' OR category = 'Platinas D – IF';
UPDATE public.weapons SET category = 'Meias Platinas' WHERE category = 'Meia Platina';

-- Atualizar nomes das tabelas de preços
UPDATE public.price_tables SET name = 'Platinas L_IV' WHERE name = 'Platinas L - IV' OR name = 'Platinas L – IV';
UPDATE public.price_tables SET name = 'Platinas D_IF' WHERE name = 'Platinas D - IF' OR name = 'Platinas D – IF';
UPDATE public.price_tables SET name = 'Meias Platinas' WHERE name = 'Meia Platina';