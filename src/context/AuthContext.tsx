import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, type Perfil } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthCtx {
  user: User | null
  perfil: Perfil | null
  loading: boolean
  signIn: (email: string, senha: string) => Promise<string | null>
  signUp: (email: string, senha: string, nome: string, plano?: 'basico' | 'pro') => Promise<string | null>
  signOut: () => Promise<void>
  isPro: boolean
}

const Ctx = createContext<AuthCtx>({} as AuthCtx)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)

  async function carregarPerfil(uid: string) {
    const { data } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', uid)
      .single()
    if (data) setPerfil(data as Perfil)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) carregarPerfil(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) carregarPerfil(session.user.id)
      else setPerfil(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email: string, senha: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    return error?.message ?? null
  }

  async function signUp(email: string, senha: string, nome: string, plano: 'basico' | 'pro' = 'basico') {
    const { data, error } = await supabase.auth.signUp({ email, password: senha })
    if (error) return error.message
    if (data.user) {
      await supabase.from('perfis').insert({
        id: data.user.id,
        email,
        nome,
        plano,
        ativo: true, // TODO: substituir por verificação Stripe ao integrar pagamento
      })
    }
    return null
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <Ctx.Provider value={{
      user, perfil, loading,
      signIn, signUp, signOut,
      isPro: perfil?.plano === 'pro' && perfil?.ativo === true,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)
