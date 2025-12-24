-- ============================================
-- EXECUTE ESTE SQL NO SUPABASE
-- Adiciona coluna expires_at na tabela ps360_access
-- ============================================

-- 1. Adicionar coluna expires_at
ALTER TABLE ps360_access 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- 2. Atualizar registros existentes para expirar 1 ano após criação
UPDATE ps360_access 
SET expires_at = created_at + INTERVAL '1 year'
WHERE expires_at IS NULL;

-- 3. Verificar resultado
SELECT id, email, is_active, created_at, expires_at 
FROM ps360_access 
LIMIT 10;
