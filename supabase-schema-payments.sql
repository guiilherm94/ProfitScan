-- ProfitScan AI - Schema de Pagamentos CartPanda
-- Adicione ao seu banco Supabase

-- Tabela de pedidos/pagamentos
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cartpanda_order_id BIGINT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_cpf TEXT,
  product_name TEXT NOT NULL,
  product_id BIGINT,
  amount DECIMAL(10,2) NOT NULL,
  payment_type TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'paid',
  order_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de acesso dos usuários (para controle de quem pode acessar)
CREATE TABLE IF NOT EXISTS user_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  access_type TEXT NOT NULL DEFAULT 'lifetime',
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_access ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para orders (apenas para service role)
CREATE POLICY "Service role can manage orders" ON orders
  FOR ALL USING (auth.role() = 'service_role');

-- Políticas de segurança para user_access
CREATE POLICY "Users can view own access" ON user_access
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage access" ON user_access
  FOR ALL USING (auth.role() = 'service_role');

-- Índices para performance
CREATE INDEX idx_orders_email ON orders(customer_email);
CREATE INDEX idx_orders_cartpanda_id ON orders(cartpanda_order_id);
CREATE INDEX idx_user_access_email ON user_access(email);
CREATE INDEX idx_user_access_user_id ON user_access(user_id);
