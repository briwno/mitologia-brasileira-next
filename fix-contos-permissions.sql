-- Execute este SQL no painel do Supabase para corrigir permissões

-- 1) Remover RLS temporariamente para testar
ALTER TABLE public.contos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contos_cards DISABLE ROW LEVEL SECURITY;

-- 2) Aplicar GRANTs explícitos
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.contos TO service_role;
GRANT ALL ON TABLE public.contos_cards TO service_role;
GRANT SELECT ON TABLE public.contos TO anon, authenticated;
GRANT SELECT ON TABLE public.contos_cards TO anon, authenticated;

-- 3) Reabilitar RLS com policies corretas
ALTER TABLE public.contos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contos_cards ENABLE ROW LEVEL SECURITY;

-- 4) Recriar policies (drop + create)
DROP POLICY IF EXISTS "contos_read" ON public.contos;
DROP POLICY IF EXISTS "contos_insert" ON public.contos;
DROP POLICY IF EXISTS "contos_update" ON public.contos;
DROP POLICY IF EXISTS "contos_delete" ON public.contos;

CREATE POLICY "contos_read" ON public.contos FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "contos_insert" ON public.contos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "contos_update" ON public.contos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "contos_delete" ON public.contos FOR DELETE TO authenticated USING (true);

-- 5) Verificar se dados existem
SELECT COUNT(*) as total_contos FROM public.contos;
SELECT id, slug, card_id, is_active FROM public.contos LIMIT 3;
