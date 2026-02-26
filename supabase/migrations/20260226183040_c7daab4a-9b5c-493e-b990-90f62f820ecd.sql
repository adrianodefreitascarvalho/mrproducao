
-- 1. Enable RLS on price_tables (currently disabled)
ALTER TABLE public.price_tables ENABLE ROW LEVEL SECURITY;

-- Add authenticated-only policies for price_tables
CREATE POLICY "Authenticated users can view price tables"
ON public.price_tables FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert price tables"
ON public.price_tables FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update price tables"
ON public.price_tables FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete price tables"
ON public.price_tables FOR DELETE
TO authenticated
USING (true);

-- 2. Replace overly permissive production_orders policy
DROP POLICY IF EXISTS "Acesso total a production_orders" ON public.production_orders;

CREATE POLICY "Authenticated users can view production orders"
ON public.production_orders FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert production orders"
ON public.production_orders FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update production orders"
ON public.production_orders FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete production orders"
ON public.production_orders FOR DELETE
TO authenticated
USING (true);
