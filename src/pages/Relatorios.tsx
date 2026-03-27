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
        <div className="grid md:grid-cols-2 gap-4">
          {/* Lista */}
          <div className="space-y-2">
            {relatorios.map(r => (
              <button key={r.id} onClick={() => abrirRelatorio(r)}
                className={`w-full glass rounded-xl p-4 text-left transition-all hover:border-dourado/30 ${
                  aberto?.id === r.id ? 'border-dourado/40 bg-dourado/5' : ''
                }`}>
                <p className="font-medium text-cristal">{r.cliente_nome}</p>
                <p className="text-cristal/40 text-xs mt-0.5">
                  {new Date(r.criado_em).toLocaleDateString('pt-BR')} · {r.tiragem.length} cartas
                </p>
              </button>
            ))}
          </div>

          {/* Editor */}
          {aberto ? (
            <div className="glass rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-dourado text-lg">{aberto.cliente_nome}</h3>
                  <p className="text-cristal/40 text-xs">{new Date(aberto.criado_em).toLocaleDateString('pt-BR')}</p>
                </div>
                <button onClick={() => excluir(aberto.id)} className="text-cristal/30 hover:text-red-400 text-sm transition-colors">✕</button>
              </div>

              <textarea ref={textareaRef} value={texto} onChange={e => setTexto(e.target.value)}
                className="w-full bg-mistico-escuro border border-white/10 rounded-xl p-3 text-cristal text-sm resize-none focus:outline-none focus:border-dourado/30 min-h-[300px]" />

              <div className="flex gap-2 flex-wrap">
                <button onClick={salvarEdicao} disabled={salvando}
                  className="flex-1 bg-dourado/10 hover:bg-dourado/20 border border-dourado/20 text-dourado py-2 rounded-xl text-sm transition-all disabled:opacity-50">
                  {salvando ? 'Salvando...' : '💾 Salvar'}
                </button>
                <button onClick={copiarTexto}
                  className="flex-1 glass hover:bg-white/10 py-2 rounded-xl text-sm transition-all text-cristal/70">
                  {copiado ? '✓ Copiado!' : '📋 Copiar'}
                </button>
                <button onClick={exportarPDF}
                  className="flex-1 glass hover:bg-white/10 py-2 rounded-xl text-sm transition-all text-cristal/70">
                  📄 PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl p-8 flex items-center justify-center text-cristal/30 text-sm">
              Selecione um relatório para editar
            </div>
          )}
        </div>
      )}
    </div>
  )
}
