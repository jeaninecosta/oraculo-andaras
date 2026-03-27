import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase, type ClientePro } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function Clientes() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [clientes, setClientes] = useState<ClientePro[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [nome, setNome] = useState('')
  const [dataNasc, setDataNasc] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    const { data } = await supabase
      .from('clientes_pro')
      .select('*')
      .eq('user_id', user!.id)
      .order('nome')
    setClientes((data ?? []) as ClientePro[])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  async function salvar() {
    if (!nome.trim() || !dataNasc) return
    setSalvando(true)
    await supabase.from('clientes_pro').insert({
      user_id: user!.id,
      nome: nome.trim(),
      data_nascimento: dataNasc,
    })
    setNome(''); setDataNasc(''); setModal(false)
    await carregar()
    setSalvando(false)
  }

  async function excluir(id: string) {
    if (!confirm('Excluir este cliente?')) return
    await supabase.from('clientes_pro').delete().eq('id', id)
    setClientes(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif text-gradient">Meus Clientes</h1>
        <button onClick={() => setModal(true)}
          className="bg-dourado hover:bg-dourado-claro text-mistico-fundo font-semibold px-4 py-2 rounded-xl text-sm transition-all">
          + Novo cliente
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-dourado border-t-transparent rounded-full animate-spin" />
        </div>
      ) : clientes.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-4xl mb-4">👤</p>
          <p className="text-cristal/50">Nenhum cliente cadastrado ainda.</p>
          <p className="text-cristal/30 text-sm mt-1">Clique em "Novo cliente" para começar.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {clientes.map(c => (
            <div key={c.id} className="glass rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-cristal">{c.nome}</p>
                <p className="text-cristal/40 text-xs mt-0.5">
                  Nascimento: {new Date(c.data_nascimento + 'T12:00:00').toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/app/consulta', { state: { cliente: c } })}
                  className="text-xs bg-dourado/10 hover:bg-dourado/20 text-dourado border border-dourado/20 px-3 py-1.5 rounded-xl transition-all">
                  Consultar
                </button>
                <button onClick={() => excluir(c.id)}
                  className="text-cristal/30 hover:text-red-400 transition-colors text-sm p-1">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal novo cliente */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-serif text-dourado text-xl mb-4">Novo Cliente</h3>
            <div className="space-y-3">
              <div>
                <label className="text-cristal/70 text-xs mb-1 block">Nome</label>
                <input value={nome} onChange={e => setNome(e.target.value)}
                  placeholder="Nome completo do cliente"
                  className="w-full bg-mistico-escuro border border-white/10 rounded-xl px-4 py-2.5 text-cristal text-sm focus:outline-none focus:border-dourado/50 placeholder:text-cristal/30" />
              </div>
              <div>
                <label className="text-cristal/70 text-xs mb-1 block">Data de nascimento</label>
                <input type="date" value={dataNasc} onChange={e => setDataNasc(e.target.value)}
                  className="w-full bg-mistico-escuro border border-white/10 rounded-xl px-4 py-2.5 text-cristal text-sm focus:outline-none focus:border-dourado/50" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setModal(false)}
                className="flex-1 border border-white/10 text-cristal/60 hover:text-cristal py-2.5 rounded-xl text-sm transition-all">
                Cancelar
              </button>
              <button onClick={salvar} disabled={salvando || !nome.trim() || !dataNasc}
                className="flex-1 bg-dourado hover:bg-dourado-claro text-mistico-fundo font-semibold py-2.5 rounded-xl text-sm transition-all disabled:opacity-50">
                {salvando ? '...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
