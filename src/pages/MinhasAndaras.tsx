import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import cartas from '../data/cartas.json'

interface Carta {
  id: string
  nome: string
  palavrasChave: string
  imagem: string
  elemento: string
  cor: string
}

const SUGESTOES_USO: Record<string, string> = {
  Água: 'Use em consultas de cura emocional, limpeza energética ou momentos de transição. Segure-a durante meditações com água ou banhos rituais.',
  Fogo: 'Ideal para consultas de ação, motivação e transformação. Coloque próxima a velas durante rituais ou use quando precisar de coragem.',
  Terra: 'Perfeita para aterramento, estabilidade e cura física. Carregue na bolsa em dias de instabilidade ou coloque no seu espaço de trabalho.',
  Ar: 'Use em consultas de clareza mental, comunicação e criatividade. Ideal para meditações ao ar livre ou momentos de expansão.',
  Éter: 'Reserve para rituais espirituais elevados, conexão com guias e trabalhos de transmutação. Use em altares e cerimônias sagradas.',
}

function TelaUpgrade() {
  return (
    <div className="space-y-6 max-w-md mx-auto text-center py-10">
      <div className="glass-dourado rounded-3xl p-10 space-y-4">
        <div className="text-5xl">💎</div>
        <h2 className="font-serif text-dourado text-2xl">Minhas Andaras</h2>
        <p className="text-white text-sm leading-relaxed">
          Marque quais cristais Andara você possui fisicamente e receba sugestões personalizadas de uso para cada um deles.
        </p>
        <div className="border-t border-white/5 pt-4">
          <span className="text-xs bg-dourado/10 text-dourado border border-dourado/20 px-3 py-1.5 rounded-full">
            Recurso exclusivo PRO
          </span>
        </div>
      </div>
    </div>
  )
}

export default function MinhasAndaras() {
  const { isPro, user } = useAuth()
  const [minhas, setMinhas] = useState<Set<string>>(new Set())
  const [filtroElemento, setFiltroElemento] = useState<string | null>(null)
  const [filtroTipo, setFiltroTipo] = useState<'todas' | 'tenho' | 'nao-tenho'>('todas')
  const [cartaDetalhes, setCartaDetalhes] = useState<Carta | null>(null)

  const storageKey = user ? `minhas_andaras_${user.id}` : null

  useEffect(() => {
    if (!storageKey) return
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) setMinhas(new Set(JSON.parse(saved)))
    } catch {
      // ignora erro
    }
  }, [storageKey])

  function toggleAndara(id: string) {
    if (!storageKey) return
    setMinhas(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem(storageKey, JSON.stringify([...next]))
      return next
    })
  }

  if (!isPro) return <TelaUpgrade />

  const todasCartas = cartas as Carta[]
  const elementos = [...new Set(todasCartas.map(c => c.elemento))].sort()

  const cartasFiltradas = todasCartas.filter(c => {
    if (filtroElemento && c.elemento !== filtroElemento) return false
    if (filtroTipo === 'tenho' && !minhas.has(c.id)) return false
    if (filtroTipo === 'nao-tenho' && minhas.has(c.id)) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-serif text-gradient mb-2">Minhas Andaras</h1>
        <p className="text-white text-sm">
          Marque os cristais que você possui. {minhas.size} de {todasCartas.length} Andaras.
        </p>
      </div>

      {/* Progresso */}
      <div className="glass rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white">Coleção</span>
          <span className="text-dourado/90">{minhas.size}/{todasCartas.length}</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${(minhas.size / todasCartas.length) * 100}%`,
              background: 'linear-gradient(90deg, #d4af37, #9c27b0)',
            }}
          />
        </div>
      </div>

      {/* Filtros */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {(['todas', 'tenho', 'nao-tenho'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFiltroTipo(f)}
              className={`px-3 py-1.5 rounded-xl text-xs transition-all border ${
                filtroTipo === f
                  ? 'bg-dourado/15 text-dourado border-dourado/30'
                  : 'bg-white/5 text-white/95 border-white/10 hover:border-white/20'
              }`}
            >
              {f === 'todas' ? 'Todas' : f === 'tenho' ? 'Tenho' : 'Não tenho'}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroElemento(null)}
            className={`px-3 py-1.5 rounded-xl text-xs transition-all border ${
              !filtroElemento
                ? 'bg-dourado/15 text-dourado border-dourado/30'
                : 'bg-white/5 text-white/95 border-white/10 hover:border-white/20'
            }`}
          >
            Todos elementos
          </button>
          {elementos.map(el => (
            <button
              key={el}
              onClick={() => setFiltroElemento(prev => prev === el ? null : el)}
              className={`px-3 py-1.5 rounded-xl text-xs transition-all border ${
                filtroElemento === el
                  ? 'bg-dourado/15 text-dourado border-dourado/30'
                  : 'bg-white/5 text-white/95 border-white/10 hover:border-white/20'
              }`}
            >
              {el}
            </button>
          ))}
        </div>
      </div>

      {/* Sugestões baseadas na coleção */}
      {minhas.size > 0 && (() => {
        const elementosQuetenho = [...new Set(todasCartas.filter(c => minhas.has(c.id)).map(c => c.elemento))]
        return (
          <div className="glass-dourado rounded-2xl p-5 space-y-4">
            <p className="text-xs text-dourado/90 uppercase tracking-widest">✦ Sugestões para sua coleção</p>
            {elementosQuetenho.map(el => (
              <div key={el} className="space-y-1">
                <p className="text-sm font-medium text-white/90">{el}</p>
                <p className="text-white/95 text-sm leading-relaxed">{SUGESTOES_USO[el]}</p>
              </div>
            ))}
            <div className="border-t border-white/5 pt-3">
              <p className="text-white text-xs">
                Quer expandir sua coleção? Entre em contato com a Clarisse.
              </p>
            </div>
          </div>
        )
      })()}

      {/* Grid de cartas */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {cartasFiltradas.map(carta => {
          const tenho = minhas.has(carta.id)
          return (
            <div key={carta.id} className="flex flex-col gap-1.5">
              <button
                onClick={() => toggleAndara(carta.id)}
                className={`relative w-full aspect-[2/3] rounded-xl overflow-hidden border-2 transition-all ${
                  tenho
                    ? 'border-dourado shadow-md shadow-dourado/20'
                    : 'border-white/10 hover:border-white/20 opacity-50 hover:opacity-70'
                }`}
              >
                <img
                  src={carta.imagem}
                  alt={carta.nome}
                  className="w-full h-full object-cover"
                />
                {tenho && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-dourado flex items-center justify-center">
                    <span className="text-mistico-fundo text-xs font-bold">✓</span>
                  </div>
                )}
              </button>
              <p
                className={`text-xs text-center leading-tight transition-colors ${
                  tenho ? 'text-white' : 'text-white'
                }`}
              >
                {carta.nome.replace('Andara ', '')}
              </p>
              <button
                onClick={() => setCartaDetalhes(carta)}
                className="text-white/20 hover:text-white/95 text-xs text-center transition-colors"
              >
                ver detalhes
              </button>
            </div>
          )
        })}
      </div>

      {/* Modal de detalhes */}
      {cartaDetalhes && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
          onClick={() => setCartaDetalhes(null)}
        >
          <div
            className="glass-dourado rounded-2xl p-6 max-w-sm w-full space-y-4 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <img
                src={cartaDetalhes.imagem}
                alt={cartaDetalhes.nome}
                className="w-20 h-28 object-cover rounded-xl flex-shrink-0 border border-dourado/20"
              />
              <div>
                <h3 className="font-serif text-dourado text-lg">{cartaDetalhes.nome}</h3>
                <p className="text-white/95 text-xs mt-1 italic">{cartaDetalhes.palavrasChave}</p>
                <span
                  className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: cartaDetalhes.cor + '22',
                    color: cartaDetalhes.cor,
                    border: `1px solid ${cartaDetalhes.cor}44`,
                  }}
                >
                  {cartaDetalhes.elemento}
                </span>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4">
              <p className="text-xs text-dourado/90 uppercase tracking-wider mb-2">Como usar esta Andara</p>
              <p className="text-white text-sm leading-relaxed">
                {SUGESTOES_USO[cartaDetalhes.elemento] ?? 'Use em suas consultas e meditações conforme sua intuição guiar.'}
              </p>
            </div>

            <div className="border-t border-white/5 pt-4 space-y-2">
              <button
                onClick={() => { toggleAndara(cartaDetalhes.id); setCartaDetalhes(null) }}
                className={`w-full py-2 rounded-xl text-sm transition-all border ${
                  minhas.has(cartaDetalhes.id)
                    ? 'bg-red-500/10 text-red-400/70 border-red-500/20 hover:bg-red-500/20'
                    : 'bg-dourado/10 text-dourado border-dourado/20 hover:bg-dourado/20'
                }`}
              >
                {minhas.has(cartaDetalhes.id) ? 'Remover da minha coleção' : '+ Tenho esta Andara'}
              </button>

              {!minhas.has(cartaDetalhes.id) && (
                <p className="text-white text-xs text-center">
                  Não tem esta Andara? Entre em contato com a Clarisse.
                </p>
              )}
            </div>

            <button
              onClick={() => setCartaDetalhes(null)}
              className="w-full text-white hover:text-white text-sm py-1 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
