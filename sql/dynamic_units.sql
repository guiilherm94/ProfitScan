-- =====================================================
-- SISTEMA DE UNIDADES DINÂMICAS - ProfitScan 360
-- Execute este SQL no Supabase
-- =====================================================

-- 1. Criar tabela de unidades
CREATE TABLE IF NOT EXISTS public.ps360_units (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol text NOT NULL,
    name text NOT NULL,
    is_global boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT unique_user_symbol UNIQUE NULLS NOT DISTINCT (user_id, symbol)
);

-- 2. Habilitar RLS
ALTER TABLE public.ps360_units ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de acesso
CREATE POLICY "Users can view global units and own units" ON public.ps360_units
    FOR SELECT USING (is_global = true OR auth.uid() = user_id);

CREATE POLICY "Users can create own units" ON public.ps360_units
    FOR INSERT WITH CHECK (auth.uid() = user_id AND is_global = false);

CREATE POLICY "Users can update own units" ON public.ps360_units
    FOR UPDATE USING (auth.uid() = user_id AND is_global = false);

CREATE POLICY "Users can delete own units" ON public.ps360_units
    FOR DELETE USING (auth.uid() = user_id AND is_global = false);

-- 4. Inserir unidades globais padrão (apenas as principais)
INSERT INTO public.ps360_units (user_id, symbol, name, is_global) VALUES
(NULL, 'kg', 'Quilograma', true),
(NULL, 'g', 'Grama', true),
(NULL, 'L', 'Litro', true),
(NULL, 'ml', 'Mililitro', true),
(NULL, 'un', 'Unidade', true)
ON CONFLICT DO NOTHING;

-- 5. Remover constraint de unit da tabela ps360_ingredients
-- (isso permite qualquer valor de unit)
ALTER TABLE public.ps360_ingredients DROP CONSTRAINT IF EXISTS ps360_ingredients_unit_check;

-- 6. Permitir unit NULL nos ingredientes
ALTER TABLE public.ps360_ingredients ALTER COLUMN unit DROP NOT NULL;
ALTER TABLE public.ps360_ingredients ALTER COLUMN unit DROP DEFAULT;

-- Pronto! Agora o sistema suporta unidades dinâmicas.
