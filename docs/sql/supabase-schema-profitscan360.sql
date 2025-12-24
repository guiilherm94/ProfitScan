-- ProfitScan 360º - Schema de Banco de Dados
-- Execute no Supabase SQL Editor

-- =====================================================
-- TABELA: Controle de Acesso ao Módulo
-- =====================================================
CREATE TABLE IF NOT EXISTS ps360_access (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: Ingredientes / Matérias-Primas
-- =====================================================
CREATE TABLE IF NOT EXISTS ps360_ingredients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('purchased', 'manufactured')),
    
    -- Para ingredientes comprados
    package_cost DECIMAL(10,2) DEFAULT 0,
    package_quantity DECIMAL(10,4) DEFAULT 1,
    unit TEXT DEFAULT 'kg' CHECK (unit IN ('kg', 'g', 'L', 'ml', 'un')),
    
    -- Para ingredientes fabricados (referência à receita)
    recipe_yield DECIMAL(10,4) DEFAULT 1,
    recipe_yield_unit TEXT DEFAULT 'kg',
    
    -- Custo calculado automaticamente
    unit_cost DECIMAL(10,4) DEFAULT 0,
    
    -- % de aproveitamento/rendimento
    yield_percentage DECIMAL(5,2) DEFAULT 100,
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: Ingredientes de Ingredientes Fabricados
-- =====================================================
CREATE TABLE IF NOT EXISTS ps360_ingredient_components (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_ingredient_id UUID REFERENCES ps360_ingredients(id) ON DELETE CASCADE NOT NULL,
    child_ingredient_id UUID REFERENCES ps360_ingredients(id) ON DELETE CASCADE NOT NULL,
    quantity DECIMAL(10,4) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: Taxas Variáveis
-- =====================================================
CREATE TABLE IF NOT EXISTS ps360_taxes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
    value DECIMAL(10,4) NOT NULL,
    
    -- Se é aplicada a todos os produtos ou específica
    is_global BOOLEAN DEFAULT TRUE,
    
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: Despesas Fixas
-- =====================================================
CREATE TABLE IF NOT EXISTS ps360_fixed_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    name TEXT NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    recurrence TEXT DEFAULT 'monthly' CHECK (recurrence IN ('monthly', 'weekly', 'daily')),
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: Produtos
-- =====================================================
CREATE TABLE IF NOT EXISTS ps360_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('resold', 'manufactured')),
    
    -- Para produtos revendidos
    purchase_cost DECIMAL(10,2) DEFAULT 0,
    
    -- Para produtos fabricados
    recipe_yield DECIMAL(10,4) DEFAULT 1,
    recipe_yield_unit TEXT DEFAULT 'un',
    
    -- Preço de venda
    sale_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Faturamento médio mensal
    avg_monthly_revenue DECIMAL(10,2) DEFAULT 0,
    
    -- Arquivos da receita (URLs)
    recipe_files JSONB DEFAULT '[]',
    
    -- Notas e observações
    notes TEXT,
    
    -- Campos calculados (atualizados automaticamente)
    production_cost DECIMAL(10,4) DEFAULT 0,
    total_cost DECIMAL(10,4) DEFAULT 0,
    contribution_margin DECIMAL(10,4) DEFAULT 0,
    real_profit DECIMAL(10,4) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: Ingredientes do Produto (Ficha Técnica)
-- =====================================================
CREATE TABLE IF NOT EXISTS ps360_product_ingredients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES ps360_products(id) ON DELETE CASCADE NOT NULL,
    ingredient_id UUID REFERENCES ps360_ingredients(id) ON DELETE CASCADE NOT NULL,
    quantity DECIMAL(10,4) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: Produtos como Ingredientes de Outros Produtos
-- =====================================================
CREATE TABLE IF NOT EXISTS ps360_product_components (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_product_id UUID REFERENCES ps360_products(id) ON DELETE CASCADE NOT NULL,
    child_product_id UUID REFERENCES ps360_products(id) ON DELETE CASCADE NOT NULL,
    quantity DECIMAL(10,4) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: Taxas Específicas do Produto
-- =====================================================
CREATE TABLE IF NOT EXISTS ps360_product_taxes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES ps360_products(id) ON DELETE CASCADE NOT NULL,
    tax_id UUID REFERENCES ps360_taxes(id) ON DELETE CASCADE NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================
ALTER TABLE ps360_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE ps360_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ps360_ingredient_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE ps360_taxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ps360_fixed_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ps360_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ps360_product_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ps360_product_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE ps360_product_taxes ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (DROP antes de CREATE para idempotência)
DROP POLICY IF EXISTS "Users can view own access" ON ps360_access;
DROP POLICY IF EXISTS "Service role can manage access" ON ps360_access;
DROP POLICY IF EXISTS "Users can manage own ingredients" ON ps360_ingredients;
DROP POLICY IF EXISTS "Users can manage own ingredient components" ON ps360_ingredient_components;
DROP POLICY IF EXISTS "Users can manage own taxes" ON ps360_taxes;
DROP POLICY IF EXISTS "Users can manage own expenses" ON ps360_fixed_expenses;
DROP POLICY IF EXISTS "Users can manage own products" ON ps360_products;
DROP POLICY IF EXISTS "Users can manage own product ingredients" ON ps360_product_ingredients;
DROP POLICY IF EXISTS "Users can manage own product components" ON ps360_product_components;
DROP POLICY IF EXISTS "Users can manage own product taxes" ON ps360_product_taxes;

CREATE POLICY "Users can view own access" ON ps360_access FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage access" ON ps360_access FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can manage own ingredients" ON ps360_ingredients FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own ingredient components" ON ps360_ingredient_components FOR ALL USING (
    EXISTS (SELECT 1 FROM ps360_ingredients WHERE id = parent_ingredient_id AND user_id = auth.uid())
);

CREATE POLICY "Users can manage own taxes" ON ps360_taxes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own expenses" ON ps360_fixed_expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own products" ON ps360_products FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own product ingredients" ON ps360_product_ingredients FOR ALL USING (
    EXISTS (SELECT 1 FROM ps360_products WHERE id = product_id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage own product components" ON ps360_product_components FOR ALL USING (
    EXISTS (SELECT 1 FROM ps360_products WHERE id = parent_product_id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage own product taxes" ON ps360_product_taxes FOR ALL USING (
    EXISTS (SELECT 1 FROM ps360_products WHERE id = product_id AND user_id = auth.uid())
);

-- =====================================================
-- ÍNDICES (com IF NOT EXISTS)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_ps360_ingredients_user ON ps360_ingredients(user_id);
CREATE INDEX IF NOT EXISTS idx_ps360_taxes_user ON ps360_taxes(user_id);
CREATE INDEX IF NOT EXISTS idx_ps360_expenses_user ON ps360_fixed_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_ps360_products_user ON ps360_products(user_id);
CREATE INDEX IF NOT EXISTS idx_ps360_product_ingredients_product ON ps360_product_ingredients(product_id);
CREATE INDEX IF NOT EXISTS idx_ps360_access_user ON ps360_access(user_id);
CREATE INDEX IF NOT EXISTS idx_ps360_access_email ON ps360_access(email);

