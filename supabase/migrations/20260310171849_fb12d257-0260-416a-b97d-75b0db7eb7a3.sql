
-- =====================================================
-- Replace ALL public-role RLS policies with authenticated-only
-- =====================================================

-- body_measurements: drop public ALL, add authenticated CRUD
DROP POLICY IF EXISTS "Acesso total a body_measurements" ON public.body_measurements;
CREATE POLICY "Authenticated users can select body_measurements" ON public.body_measurements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert body_measurements" ON public.body_measurements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update body_measurements" ON public.body_measurements FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete body_measurements" ON public.body_measurements FOR DELETE TO authenticated USING (true);

-- forehand_dimensions: drop public ALL, add authenticated CRUD
DROP POLICY IF EXISTS "Acesso total a forehand_dimensions" ON public.forehand_dimensions;
CREATE POLICY "Authenticated users can select forehand_dimensions" ON public.forehand_dimensions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert forehand_dimensions" ON public.forehand_dimensions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update forehand_dimensions" ON public.forehand_dimensions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete forehand_dimensions" ON public.forehand_dimensions FOR DELETE TO authenticated USING (true);

-- gunstock_dimensions: drop public ALL, add authenticated CRUD
DROP POLICY IF EXISTS "Acesso total a gunstock_dimensions" ON public.gunstock_dimensions;
CREATE POLICY "Authenticated users can select gunstock_dimensions" ON public.gunstock_dimensions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert gunstock_dimensions" ON public.gunstock_dimensions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update gunstock_dimensions" ON public.gunstock_dimensions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete gunstock_dimensions" ON public.gunstock_dimensions FOR DELETE TO authenticated USING (true);

-- shooter_profiles: drop redundant public ALL (authenticated policies already exist)
DROP POLICY IF EXISTS "Acesso total a shooter_profiles" ON public.shooter_profiles;

-- client_weapons: drop public SELECT, add authenticated SELECT
DROP POLICY IF EXISTS "Permitir leitura para todos" ON public.client_weapons;
CREATE POLICY "Authenticated users can select client_weapons" ON public.client_weapons FOR SELECT TO authenticated USING (true);

-- operations: drop all public policies, add authenticated
DROP POLICY IF EXISTS "Public operations are viewable by everyone." ON public.operations;
DROP POLICY IF EXISTS "Allow all users to insert operations" ON public.operations;
DROP POLICY IF EXISTS "Allow all users to update operations" ON public.operations;
DROP POLICY IF EXISTS "Allow all users to delete operations" ON public.operations;
CREATE POLICY "Authenticated users can select operations" ON public.operations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert operations" ON public.operations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update operations" ON public.operations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete operations" ON public.operations FOR DELETE TO authenticated USING (true);

-- production_orders: drop public policies (authenticated ones already exist)
DROP POLICY IF EXISTS "Allow all users to delete production_orders" ON public.production_orders;
DROP POLICY IF EXISTS "Allow all users to insert production_orders" ON public.production_orders;
DROP POLICY IF EXISTS "Allow all users to update production_orders" ON public.production_orders;

-- products: drop all public policies, add authenticated
DROP POLICY IF EXISTS "Public products are viewable by everyone." ON public.products;
DROP POLICY IF EXISTS "Allow all users to insert products" ON public.products;
DROP POLICY IF EXISTS "Allow all users to update products" ON public.products;
DROP POLICY IF EXISTS "Allow all users to delete products" ON public.products;
CREATE POLICY "Authenticated users can select products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update products" ON public.products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete products" ON public.products FOR DELETE TO authenticated USING (true);

-- release_orders: drop all public policies, add authenticated
DROP POLICY IF EXISTS "Allow all users to view release_orders" ON public.release_orders;
DROP POLICY IF EXISTS "Allow all users to insert release_orders" ON public.release_orders;
DROP POLICY IF EXISTS "Allow all users to update release_orders" ON public.release_orders;
DROP POLICY IF EXISTS "Allow all users to delete release_orders" ON public.release_orders;
CREATE POLICY "Authenticated users can select release_orders" ON public.release_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert release_orders" ON public.release_orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update release_orders" ON public.release_orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete release_orders" ON public.release_orders FOR DELETE TO authenticated USING (true);

-- sales_orders: drop all public policies, add authenticated
DROP POLICY IF EXISTS "Sales orders are viewable by everyone." ON public.sales_orders;
DROP POLICY IF EXISTS "Allow all users to insert sales_orders" ON public.sales_orders;
DROP POLICY IF EXISTS "Allow all users to update sales_orders" ON public.sales_orders;
DROP POLICY IF EXISTS "Allow all users to delete sales_orders" ON public.sales_orders;
CREATE POLICY "Authenticated users can select sales_orders" ON public.sales_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert sales_orders" ON public.sales_orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update sales_orders" ON public.sales_orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete sales_orders" ON public.sales_orders FOR DELETE TO authenticated USING (true);

-- sales_order_items: drop all public policies, add authenticated
DROP POLICY IF EXISTS "Sales order items are viewable by everyone." ON public.sales_order_items;
DROP POLICY IF EXISTS "Allow all users to insert sales_order_items" ON public.sales_order_items;
DROP POLICY IF EXISTS "Allow all users to update sales_order_items" ON public.sales_order_items;
DROP POLICY IF EXISTS "Allow all users to delete sales_order_items" ON public.sales_order_items;
CREATE POLICY "Authenticated users can select sales_order_items" ON public.sales_order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert sales_order_items" ON public.sales_order_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update sales_order_items" ON public.sales_order_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete sales_order_items" ON public.sales_order_items FOR DELETE TO authenticated USING (true);

-- weapons: drop all public policies, add authenticated
DROP POLICY IF EXISTS "Public weapons are viewable by everyone." ON public.weapons;
DROP POLICY IF EXISTS "Allow all users to insert weapons" ON public.weapons;
DROP POLICY IF EXISTS "Allow all users to update weapons" ON public.weapons;
DROP POLICY IF EXISTS "Allow all users to delete weapons" ON public.weapons;
CREATE POLICY "Authenticated users can select weapons" ON public.weapons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert weapons" ON public.weapons FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update weapons" ON public.weapons FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete weapons" ON public.weapons FOR DELETE TO authenticated USING (true);

-- workstations: drop all public policies, add authenticated
DROP POLICY IF EXISTS "Public workstations are viewable by everyone." ON public.workstations;
DROP POLICY IF EXISTS "Allow all users to insert workstations" ON public.workstations;
DROP POLICY IF EXISTS "Allow all users to update workstations" ON public.workstations;
DROP POLICY IF EXISTS "Allow all users to delete workstations" ON public.workstations;
CREATE POLICY "Authenticated users can select workstations" ON public.workstations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert workstations" ON public.workstations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update workstations" ON public.workstations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete workstations" ON public.workstations FOR DELETE TO authenticated USING (true);

-- price_tables: drop redundant public SELECT (authenticated policies already exist)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.price_tables;
