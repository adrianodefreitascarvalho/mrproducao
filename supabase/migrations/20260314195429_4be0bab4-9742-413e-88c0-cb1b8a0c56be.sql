
-- Drop existing public policies on prospects
DROP POLICY IF EXISTS "Acesso total a prospects" ON public.prospects;

-- Create authenticated-only policies for prospects
CREATE POLICY "Authenticated users can select prospects"
ON public.prospects FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert prospects"
ON public.prospects FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update prospects"
ON public.prospects FOR UPDATE TO authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete prospects"
ON public.prospects FOR DELETE TO authenticated
USING (true);

-- Drop existing public policies on prospect_interactions
DROP POLICY IF EXISTS "Acesso total a prospect_interactions" ON public.prospect_interactions;

-- Create authenticated-only policies for prospect_interactions
CREATE POLICY "Authenticated users can select prospect_interactions"
ON public.prospect_interactions FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert prospect_interactions"
ON public.prospect_interactions FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update prospect_interactions"
ON public.prospect_interactions FOR UPDATE TO authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete prospect_interactions"
ON public.prospect_interactions FOR DELETE TO authenticated
USING (true);
