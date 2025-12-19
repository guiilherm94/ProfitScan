-- Blindagem de Reputação - Schema Supabase
-- Execute no SQL Editor do Supabase

-- Tabela de perfil da loja
CREATE TABLE IF NOT EXISTS store_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  store_name TEXT NOT NULL,
  store_niche TEXT NOT NULL,
  store_tone TEXT DEFAULT 'Profissional e Empático',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de acesso ao módulo Blindagem de Reputação
CREATE TABLE IF NOT EXISTS reputation_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Histórico de respostas geradas (opcional)
CREATE TABLE IF NOT EXISTS reputation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_comment TEXT NOT NULL,
  stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
  responses JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE store_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_history ENABLE ROW LEVEL SECURITY;

-- Políticas store_profiles
CREATE POLICY "Users can view own profile" ON store_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON store_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON store_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas reputation_access
CREATE POLICY "Users can view own access" ON reputation_access
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage access" ON reputation_access
  FOR ALL USING (auth.role() = 'service_role');

-- Políticas reputation_history
CREATE POLICY "Users can view own history" ON reputation_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history" ON reputation_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Índices
CREATE INDEX idx_store_profiles_user_id ON store_profiles(user_id);
CREATE INDEX idx_reputation_access_email ON reputation_access(email);
CREATE INDEX idx_reputation_history_user_id ON reputation_history(user_id);
