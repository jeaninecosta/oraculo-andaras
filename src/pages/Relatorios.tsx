import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase, type Relatorio } from '../lib/supabase'
import jsPDF from 'jspdf'

export default function Relatorios() {
  const { user } = useAuth()
  const [relatorios, setRelatorios] = useState<Relatorio[]>([])
  const [loading, setLoading] = useState(true)
  const [aberto, setAberto] = useState<Relatorio | null>(null)
  const [texto, setTexto] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function carregar() {
    const { data } = await supabase
      .from('relatorios')
      .select('*')
      .eq('user_id', user!.id)
      .order('criado_em', { ascending: false })
    setRelatorios((data ?? []) as Relatorio[])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  function abrirRelatorio(r: Relatorio) {
    setAberto(r)
    setTexto(r.texto_editado)
  }

  async function salvarEdicao() {
    if (!aberto) return
    setSalvando(true)
    await supabase.from('relatorios').update({ texto_editado: texto }).eq('id', aberto.id)
    setRelatorios(prev => prev.map(r => r.id === aberto.id ? { ...r, texto_editado: texto } : r))
    setSalvando(false)
  }

  async function excluir(id: string) {
    if (!confirm('Excluir este relatório?')) return
    await supabase.from('relatorios').delete().eq('id', id)
    setRelatorios(prev => prev.filter(r => r.id !== id))
    if (aberto?.id === id) setAberto(null)
  }

  function copiarTexto() {
    navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  function exportarPDF() {
    if (!aberto) return
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const margin = 20
    const maxW = 210 - margin * 2
    let y = margin

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(212, 175, 55)
    doc.text('Oráculo Andara', margin, y)
    y += 10

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    doc.setTextColor(60, 60, 60)
    doc.text(`Cliente: ${aberto.cliente_nome}`, margin, y)
    y += 6
    doc.text(`Data: ${new Date(aberto.criado_em).toLocaleDateString('pt-BR')}`, margin, y)
    y += 12

    doc.setFontSize(11)
    doc.setTextColor(40, 40, 40)
    const linhas = doc.splitTextToSize(texto, maxW)
    for (const linha of linhas) {
      if (y > 280) { doc.addPage(); y = margin }
      doc.text(linha, margin, y)
      y += 6
    }

    doc.save(`relatorio-${aberto.cliente_nome.toLowerCase().replace(/\s+/g, '-')}.pdf`)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif text-gradient">Relatórios</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-dourado border-t-transparent rounded-full animate-spin" />
        </div>
      ) : relatorios.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-cristal/50">Nenhum relatório ainda.</p>
          <p className="text-cristal/30 text-sm mt-1">Os relatórios são gerados nas consultas de clientes Pro.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Lista horizontal compacta */}
          <div className="flex flex-wrap gap-2">
            {relatorios.map(r => (
              <button key={r.id} onClick={() => abrirRelatorio(r)}
                className={`glass rounded-xl px-4 py-2.5 text-left transition-all hover:border-dourado/30 ${
                  aberto?.id === r.id ? 'border-dourado/50 bg-dourado/10 text-dourado' : 'text-cristal/70'
                }`}>
                <p className="font-medium text-sm">{r.cliente_nome}</p>
                <p className="text-cristal/40 text-xs">
                  {new Date(r.criado_em).toLocaleDateString('pt-BR')} · {r.tiragem.length} carta{r.tiragem.length > 1 ? 's' : ''}
                </p>
              </button>
            ))}
          </div>

          {/* Editor em tela cheia */}
          {aberto ? (
            <div className="glass rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-dourado text-xl">{aberto.cliente_nome}</h3>
                  <p className="text-cristal/40 text-xs mt-0.5">{new Date(aberto.criado_em).toLocaleDateString('pt-BR')} · {aberto.tiragem.length} carta{aberto.tiragem.length > 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={copiarTexto}
                    className="glass hover:bg-white/10 px-3 py-1.5 rounded-xl text-xs transition-all text-cristal/70">
                    {copiado ? '✓ Copiado' : '📋 Copiar'}
                  </button>
                  <button onClick={exportarPDF}
                    className="glass hover:bg-white/10 px-3 py-1.5 rounded-xl text-xs transition-all text-cristal/70">
                    📄 PDF
                  </button>
                  <button onClick={salvarEdicao} disabled={salvando}
                    className="bg-dourado/10 hover:bg-dourado/20 border border-dourado/20 text-dourado px-3 py-1.5 rounded-xl text-xs transition-all disabled:opacity-50">
                    {salvando ? 'Salvando...' : '💾 Salvar'}
                  </button>
                  <button onClick={() => excluir(aberto.id)} className="text-cristal/30 hover:text-red-400 text-sm transition-colors ml-1">✕</button>
                </div>
              </div>

              <textarea ref={textareaRef} value={texto} onChange={e => setTexto(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-cristal text-sm resize-none focus:outline-none focus:border-dourado/30 leading-relaxed"
                style={{ minHeight: '60vh' }} />
            </div>
          ) : (
            <div className="glass rounded-2xl p-12 flex items-center justify-center text-cristal/30 text-sm">
              Selecione um relatório acima para visualizar e editar
            </div>
          )}
        </div>
      )}
    </div>
  )
}
