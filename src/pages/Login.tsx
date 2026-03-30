import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const planoSelecionado = (searchParams.get('plano') === 'pro' ? 'pro' : 'basico') as 'basico' | 'pro'
  const [modo, setModo] = useState<'login' | 'cadastro'>(searchParams.get('plano') ? 'cadastro' : 'login')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  if (user) { navigate('/app'); return null }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    if (modo === 'login') {
      const err = await signIn(email, senha)
      if (err) setErro('E-mail ou senha incorretos.')
      else navigate('/app')
    } else {
      if (!nome.trim()) { setErro('Informe seu nome.'); setLoading(false); return }
      const err = await signUp(email, senha, nome, planoSelecionado)
      if (err) setErro('Erro ao criar conta. Verifique os dados.')
      else setSucesso(true)
    }
    setLoading(false)
  }

  if (sucesso) return (
    <div className="min-h-screen bg-mistico-fundo flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 max-w-sm text-center">
        <div className="text-4xl mb-4">✉️</div>
        <h2 className="text-xl font-serif text-dourado mb-3">Confirme seu e-mail</h2>
        <p className="text-cristal/70 text-sm">
          Enviamos um link de confirmação para <strong>{email}</strong>. Após confirmar, você será redirecionado para o pagamento.
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-mistico-fundo flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at top, #2d1b69 0%, #0d0618 70%)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="text-dourado font-serif text-3xl">✦ Oráculo Andara</Link>
          <p className="text-cristal/50 text-sm mt-1">Uma ferramenta de orientação e frequência</p>
        </div>

        <div className="glass rounded-2xl p-8">
          {modo === 'cadastro' && (
            <div className={`mb-4 text-center text-xs px-3 py-2 rounded-xl ${
              planoSelecionado === 'pro'
                ? 'bg-dourado/10 text-dourado border border-dourado/20'
                : 'bg-white/5 text-cristal/50 border border-white/10'
            }`}>
              {planoSelecionado === 'pro' ? '⭐ Plano Profissional (PRO)' : 'Plano Básico'}
              {' '}· <span className="opacity-60">modo teste ativo</span>
            </div>
          )}
          <div className="flex mb-6 bg-mistico-escuro rounded-xl p-1">
            {(['login', 'cadastro'] as const).map(m => (
              <button key={m} onClick={() => setModo(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  modo === m ? 'bg-mistico-medio text-dourado' : 'text-cristal/50 hover:text-cristal'
                }`}>
                {m === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {modo === 'cadastro' && (
              <div>
                <label className="text-cristal/70 text-xs mb-1 block">Nome</label>
                <input type="text" value={nome} onChange={e => setNome(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full bg-mistico-escuro border border-white/10 rounded-xl px-4 py-3 text-cristal text-sm focus:outline-none focus:border-dourado/50 placeholder:text-cristal/30" />
              </div>
            )}
            <div>
              <label className="text-cristal/70 text-xs mb-1 block">E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-mistico-escuro border border-white/10 rounded-xl px-4 py-3 text-cristal text-sm focus:outline-none focus:border-dourado/50 placeholder:text-cristal/30" />
            </div>
            <div>
              <label className="text-cristal/70 text-xs mb-1 block">Senha</label>
              <input type="password" value={senha} onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-mistico-escuro border border-white/10 rounded-xl px-4 py-3 text-cristal text-sm focus:outline-none focus:border-dourado/50 placeholder:text-cristal/30" />
            </div>

            {erro && <p className="text-red-400 text-xs text-center">{erro}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-dourado hover:bg-dourado-claro text-mistico-fundo font-semibold py-3 rounded-xl transition-all disabled:opacity-50">
              {loading ? '...' : modo === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>
        </div>

        <p className="text-center text-cristal/40 text-xs mt-6">
          <Link to="/" className="hover:text-cristal/70">← Voltar ao início</Link>
        </p>
      </div>
    </div>
  )
}
