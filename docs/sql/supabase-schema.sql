-- ProfitScan AI - Supabase Database Schema
-- Execute this SQL in your Supabase SQL Editor

-- History table to store all profit calculations
CREATE TABLE history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  produto TEXT NOT NULL,
  custo_producao DECIMAL(10,2) NOT NULL,
  preco_venda DECIMAL(10,2) NOT NULL,
  custos_fixos DECIMAL(5,2) NOT NULL,
  margem DECIMAL(5,2) NOT NULL,
  resposta_ia TEXT,  -- Nullable: filled when AI analyzes
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own history
CREATE POLICY "Users can view own history" ON history
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own history
CREATE POLICY "Users can insert own history" ON history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own history (for AI response)
CREATE POLICY "Users can update own history" ON history
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own history
CREATE POLICY "Users can delete own history" ON history
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster queries by user_id
CREATE INDEX idx_history_user_id ON history(user_id);

-- Create index for ordering by created_at
CREATE INDEX idx_history_created_at ON history(created_at DESC);
