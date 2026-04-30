import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase, type Relatorio } from '../lib/supabase'
import jsPDF from 'jspdf'

export default function Relatorios() {
  const { user } = useAuth()
  const [relatorios, setRelatorios] = useState<Relatorio[]>([])
  const [loading, setLoading] = useState(true)
  const [clienteAberto, setClienteAberto] = useState<string | null>(null)
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

  // Group reports by client name
  const porCliente: Record<string, Relatorio[]> = {}
  for (const r of relatorios) {
    if (!porCliente[r.cliente_nome]) porCliente[r.cliente_nome] = []
    porCliente[r.cliente_nome].push(r)
  }
  const clientes = Object.keys(porCliente)

  function abrirRelatorio(r: Relatorio) {
    setAberto(r)
    // Strip legacy name/date header lines if present
    const linhas = r.texto_editado.split('\n')
    let inicio = 0
    if (linhas[0]?.trim() === r.cliente_nome.trim()) inicio++
    if (linhas[inicio] && /\d{2}\/\d{2}\/\d{4}/.test(linhas[inicio].trim())) inicio++
    while (inicio < linhas.length && linhas[inicio].trim() === '') inicio++
    setTexto(linhas.slice(inicio).join('\n'))
  }

  function toggleCliente(nome: string) {
    setClienteAberto(prev => prev === nome ? null : nome)
    setAberto(null)
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
    const PAGE_W = 210
    const PAGE_H = 297
    const margin = 22
    const maxW = PAGE_W - margin * 2
    let y = margin

    // Justificação manual: distribui espaço entre palavras — garante alinhamento real
    function justifyLinha(linha: string, curY: number): void {
      const palavras = linha.trim().split(/\s+/).filter(Boolean)
      if (palavras.length <= 1) { doc.text(linha.trim(), margin, curY); return }
      const larguraPalavras = palavras.reduce((s, p) => s + doc.getTextWidth(p), 0)
      const espacoExtra = (maxW - larguraPalavras) / (palavras.length - 1)
      let cx = margin
      for (const palavra of palavras) {
        doc.text(palavra, cx, curY)
        cx += doc.getTextWidth(palavra) + espacoExtra
      }
    }

    function renderPara(paragrafo: string, fontSize: number, color: [number,number,number], lineH: number, justified = true): void {
      if (!paragrafo.trim()) return
      doc.setFontSize(fontSize)
      doc.setTextColor(...color)
      const linhas = doc.splitTextToSize(paragrafo.trim(), maxW).filter((l: string) => l !== '%P')
      for (let i = 0; i < linhas.length; i++) {
        if (y > PAGE_H - margin - lineH) { doc.addPage(); y = margin }
        const isUltima = i === linhas.length - 1
        if (justified && !isUltima) {
          justifyLinha(linhas[i], y)
        } else {
          doc.text(linhas[i], margin, y)
        }
        y += lineH
      }
      y += lineH * 0.3
    }

    // ── Cabeçalho ─────────────────────────────────────────────────
    const dataStr = new Date(aberto.criado_em).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric'
    })
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.setTextColor(140, 110, 50)
    doc.text(dataStr, PAGE_W - margin, y, { align: 'right' })
    y += 9

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(19)
    doc.setTextColor(190, 150, 40)
    // jsPDF suporta latin-1; acento via unicode escape garante render correto
    doc.text('Or\u00e1culo Andara', PAGE_W / 2, y, { align: 'center' })
    y += 7

    doc.setDrawColor(212, 175, 55)
    doc.setLineWidth(0.6)
    doc.line(margin, y, PAGE_W - margin, y, 'S')
    y += 9

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(15)
    doc.setTextColor(60, 40, 90)
    doc.text(aberto.cliente_nome, PAGE_W / 2, y, { align: 'center' })
    y += 6

    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.setTextColor(140, 110, 160)
    doc.text('Consulta Oracular', PAGE_W / 2, y, { align: 'center' })
    y += 12

    // ── Corpo: separa síntese das cartas ──────────────────────────
    // suporta tanto o novo separador '---DIVISOR---' quanto legado '══'
    const partes = texto.split(/---DIVISOR---|[═]{5,}/)
    const sinteseTexto = partes[0].trim()
    const cartasRaw = partes[1] ?? ''

    // ── Síntese justificada ────────────────────────────────────────
    doc.setFont('helvetica', 'normal')
    for (const para of sinteseTexto.split(/\n\n+/)) {
      if (y > PAGE_H - 30) { doc.addPage(); y = margin }
      renderPara(para, 11, [40, 40, 40], 6.2)
    }

    // ── Divisor dourado + Cartas ───────────────────────────────────
    if (cartasRaw.trim()) {
      y += 4
      if (y > PAGE_H - 40) { doc.addPage(); y = margin }
      doc.setDrawColor(180, 150, 60)
      doc.setLineWidth(0.4)
      doc.line(margin, y, PAGE_W - margin, y, 'S')
      y += 7

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(160, 120, 40)
      doc.text('CARTAS DA TIRAGEM', margin, y)
      y += 7

      // separa as cartas individuais pelo marcador '---CARTA---' ou legado '──'
      const cartasSegments = cartasRaw
        .replace(/^\s*CARTAS DA TIRAGEM\s*/i, '')
        .split(/---CARTA---|[─]{5,}/)

      for (let ci = 0; ci < cartasSegments.length; ci++) {
        const seg = cartasSegments[ci].trim()
        if (!seg) continue

        // cada linha do segmento: títulos (curtos, sem ponto) = bold; corpo = justificado
        const segLinhas = seg.split('\n')
        let i = 0
        while (i < segLinhas.length) {
          const linha = segLinhas[i].trim()
          if (!linha) { y += 3; i++; continue }

          // detecta linha de título/label (posição, nome da carta, "Mensagem:", "Ação Prática:", "Palavras-chave:")
          const isLabel = /^(PASSADO|PRESENTE|FUTURO|SITUAÇÃO|DESAFIO|ACIMA|ABAIXO|RESULTADO|Mensagem:|Ação Prática:|Palavras-chave:|Carta \d)/i.test(linha)
          const isNomeCarta = i === 0 || segLinhas.slice(0, i).every(l => !l.trim())

          if (isLabel || isNomeCarta) {
            doc.setFont('helvetica', 'bold')
            renderPara(linha, 10, [80, 60, 120], 5.5, false)
            doc.setFont('helvetica', 'normal')
          } else {
            // agrupa linhas de corpo até próxima linha vazia ou label
            let corpo = linha
            while (i + 1 < segLinhas.length) {
              const prox = segLinhas[i + 1].trim()
              const proxIsLabel = /^(Mensagem:|Ação Prática:|Palavras-chave:)/i.test(prox)
              if (!prox || proxIsLabel) break
              corpo += ' ' + prox
              i++
            }
            renderPara(corpo, 10, [60, 60, 60], 5.5, true)
          }
          i++
        }

        // linha divisória entre cartas (exceto na última)
        if (ci < cartasSegments.length - 1) {
          y += 2
          if (y > PAGE_H - margin - 10) { doc.addPage(); y = margin }
          doc.setDrawColor(200, 180, 220)
          doc.setLineWidth(0.2)
          doc.line(margin + 10, y, PAGE_W - margin - 10, y, 'S')
          y += 6
        }
      }
    }

    // ── Assinatura ─────────────────────────────────────────────────
    y += 18
    if (y > PAGE_H - 20) { doc.addPage(); y = PAGE_H - 40 }
    doc.setDrawColor(160, 140, 180)
    doc.setLineWidth(0.3)
    doc.line(PAGE_W / 2 - 38, y, PAGE_W / 2 + 38, y, 'S')

    doc.save(`relatorio-${aberto.cliente_nome.toLowerCase().replace(/\s+/g, '-')}.pdf`)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif text-gradient">Relatórios</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-dourado border-t-transparent rounded-full animate-spin" />
        </div>
      ) : clientes.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-white">Nenhum relatório ainda.</p>
          <p className="text-white/90 text-sm mt-1">Os relatórios são gerados nas consultas de clientes Pro.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clientes.map(nome => {
            const lista = porCliente[nome]
            const expandido = clienteAberto === nome
            return (
              <div key={nome} className="glass rounded-2xl overflow-hidden">
                {/* Cliente header - clicável */}
                <button
                  onClick={() => toggleCliente(nome)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-dourado text-lg font-serif">{nome}</span>
                    <span className="text-white/90 text-xs bg-white/5 px-2 py-0.5 rounded-full">
                      {lista.length} relatório{lista.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className={`text-dourado/90 text-sm transition-transform duration-200 ${expandido ? 'rotate-180' : ''}`}>
                    ▾
                  </span>
                </button>

                {/* Lista de relatórios do cliente */}
                {expandido && (
                  <div className="border-t border-white/5 px-6 pb-4 space-y-2 pt-3">
                    {lista.map(r => (
                      <button
                        key={r.id}
                        onClick={() => abrirRelatorio(r)}
                        className={`w-full text-left rounded-xl px-4 py-3 transition-all flex items-center justify-between ${
                          aberto?.id === r.id
                            ? 'bg-dourado/15 border border-dourado/40 text-dourado'
                            : 'hover:bg-white/5 border border-transparent text-white'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {new Date(r.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </p>
                          <p className="text-white/90 text-xs mt-0.5">
                            {r.tiragem.length} carta{r.tiragem.length > 1 ? 's' : ''}
                          </p>
                        </div>
                        <span className="text-white text-xs">→</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Editor */}
      {aberto && (
        <div className="glass rounded-2xl p-6 space-y-4">

          {/* Cabeçalho visual — espelho do PDF */}
          <div className="bg-black/20 border border-dourado/20 rounded-xl px-6 pt-4 pb-5">
            <div className="flex justify-end mb-1">
              <p className="text-white/95 text-xs italic">
                {new Date(aberto.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <p className="font-serif text-dourado text-xl tracking-wide text-center mb-2">✦ Oráculo Andara</p>
            <div className="border-t border-dourado/30 mb-3" />
            <p className="font-serif text-white text-lg font-semibold text-center">{aberto.cliente_nome}</p>
            <p className="text-white/95 text-xs mt-1 italic text-center">Consulta Oracular</p>
          </div>

          {/* Barra de ações */}
          <div className="flex items-center justify-between">
            <p className="text-white/90 text-xs">
              {aberto.tiragem.length} carta{aberto.tiragem.length > 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={copiarTexto}
                className="glass hover:bg-white/10 px-3 py-1.5 rounded-xl text-xs transition-all text-white">
                {copiado ? '✓ Copiado' : '📋 Copiar'}
              </button>
              <button onClick={exportarPDF}
                className="glass hover:bg-white/10 px-3 py-1.5 rounded-xl text-xs transition-all text-white">
                📄 PDF
              </button>
              <button onClick={salvarEdicao} disabled={salvando}
                className="bg-dourado/10 hover:bg-dourado/20 border border-dourado/20 text-dourado px-3 py-1.5 rounded-xl text-xs transition-all disabled:opacity-50">
                {salvando ? 'Salvando...' : '💾 Salvar'}
              </button>
              <button onClick={() => excluir(aberto.id)} className="text-white hover:text-red-400 text-sm transition-colors ml-1">✕</button>
            </div>
          </div>

          <textarea ref={textareaRef} value={texto} onChange={e => setTexto(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white text-sm resize-none focus:outline-none focus:border-dourado/30 leading-relaxed"
            style={{ minHeight: '55vh', textAlign: 'justify' }} />
        </div>
      )}
    </div>
  )
}
