-- Fix clients: drop public policies, create authenticated policies
DROP POLICY IF EXISTS "Allow all users to delete clients" ON public.clients;
DROP POLICY IF EXISTS "Allow all users to insert clients" ON public.clients;
DROP POLICY IF EXISTS "Allow all users to update clients" ON public.clients;
DROP POLICY IF EXISTS "Public clients are viewable by everyone." ON public.clients;

CREATE POLICY "Authenticated users can view clients" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update clients" ON public.clients FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete clients" ON public.clients FOR DELETE TO authenticated USING (true);

-- Fix contacts: drop public ALL policy, create authenticated policies
DROP POLICY IF EXISTS "Acesso total a contacts" ON public.contacts;

CREATE POLICY "Authenticated users can view contacts" ON public.contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert contacts" ON public.contacts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update contacts" ON public.contacts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete contacts" ON public.contacts FOR DELETE TO authenticated USING (true);

-- Fix shooter_profiles: drop public ALL policy, create authenticated policies
DROP POLICY IF EXISTS "Acesso total a shooter_profiles" ON public.shooter_profiles;

CREATE POLICY "Authenticated users can view shooter_profiles" ON public.shooter_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert shooter_profiles" ON public.shooter_profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update shooter_profiles" ON public.shooter_profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete shooter_profiles" ON public.shooter_profiles FOR DELETE TO authenticated USING (true);

-- Fix price_items: drop public ALL policy, create authenticated policies
DROP POLICY IF EXISTS "Acesso total a price_items" ON public.price_items;

CREATE POLICY "Authenticated users can view price_items" ON public.price_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert price_items" ON public.price_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update price_items" ON public.price_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete price_items" ON public.price_items FOR DELETE TO authenticated USING (true);