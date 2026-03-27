import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, key)

export type Plano = 'basico' | 'pro'

export interface Perfil {
  id: string
  email: string
  nome: string
  plano: Plano
  ativo: boolean
  stripe_customer_id?: string
  stripe_subscription_id?: string
  criado_em: string
}

export interface ClientePro {
  id: string
  user_id: string
  nome: string
  data_nascimento: string
  notas?: string
  criado_em: string
}

export interface Relatorio {
  id: string
  user_id: string
  cliente_id: string
  cliente_nome: string
  tiragem: number[]
  texto_editado: string
  criado_em: string
}
