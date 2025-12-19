import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

export const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables not configured')
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}

// Legacy export for compatibility (lazy getter)
export const supabase = {
  get auth() { return getSupabase().auth },
  from: (table: string) => getSupabase().from(table)
}

export type HistoryEntry = {
  id: string
  user_id: string
  produto: string
  custo_producao: number
  preco_venda: number
  custos_fixos: number
  margem: number
  resposta_ia: string
  created_at: string
}
