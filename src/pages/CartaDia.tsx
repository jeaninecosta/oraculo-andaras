import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import cartas from '../data/cartas.json'

interface Carta {
  id: string
  nome: string
  palavrasChave: string
  mensagem: string
  acaoPratica: string
  imagem: string
  elemento: string
  cor: string
}

const descElemento: Record<string, string> = {
  Água:  'cura emocional e fluxo suave',
  Fogo:  'ação, transformação e força vital',
  Terra: 'aterramento, proteção e verdade',
  Ar:    'expansão, clareza mental e leveza',
  Éter:  'conexão espiritual, sabedoria e amor',
}

function gerarSinteseCombinada(pessoal: Carta, coletiva: Carta): string {
  const ep = descElemento[pessoal.elemento] ?? pessoal.elemento
  const ec = descElemento[coletiva.elemento] ?? coletiva.elemento
  if (pessoal.elemento === coletiva.elemento) {
    return `Tanto sua energia pessoal quanto o campo coletivo ressoam com ${pessoal.elemento} hoje. Essa confluência amplifica a frequência de ${ep} — um convite poderoso para se aprofundar nessa vibração e deixá-la trabalhar em todas as áreas da sua vida.`
  }
  return `Sua energia pessoal traz ${pessoal.elemento}, com sua frequência de ${ep}. O campo coletivo hoje vibra em ${coletiva.elemento}, carregando ${ec}. Juntas, essas forças te convidam a integrar ação e receptividade — honre o que é seu enquanto se abre ao que o campo oferece.`
}

function seedRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

function getDataHoje(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getSeedFromData(dataStr: string): number {
  return dataStr.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
}

function getCartaDoDia(userId: string): Carta {
  const data = getDataHoje()
  const chave = `carta_dia_${userId}_${data}`
  const salvo = localStorage.getItem(chave)
  if (salvo) {
    try {
      return JSON.parse(salvo) as Carta
    } catch {
      // ignora erro de parse
    }
  }
  const seed = getSeedFromData(data + userId)
  const idx = Math.floor(seedRandom(seed) * (cartas as Carta[]).length)
  const carta = (cartas as Carta[])[idx]
  localStorage.setItem(chave, JSON.stringify(carta))
  return carta
}

function getCartaColetiva(cartaPessoalId: string): Carta {
  const data = getDataHoje()
  const seed = getSeedFromData(data + 'coletiva-andara')
  const total = (cartas as Carta[]).length
  let idx = Math.floor(seedRandom(seed) * total)
  // garante que seja diferente da carta pessoal
  if ((cartas as Carta[])[idx].id === cartaPessoalId) {
    idx = (idx + 1) % total
  }
  return (cartas as Carta[])[idx]
}

export default function CartaDia() {
  const { user, isPro } = useAuth()
  const [carta, setCarta] = useState<Carta | null>(null)
  const [cartaColetiva, setCartaColetiva] = useState<Carta | null>(null)
  const [revelada, setRevelada] = useState(false)
  const [compartilhando, setCompartilhando] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      const c = getCartaDoDia(user.id)
      setCarta(c)
      if (isPro) {
        setCartaColetiva(getCartaColetiva(c.id))
      }
    }
  }, [user, isPro])

  async function handleCompartilhar() {
    if (!cardRef.current || !carta) return
    setCompartilhando(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#080414',
        scale: 2,
      })
      const link = document.createElement('a')
      link.download = `carta-do-dia-${carta.id}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Erro ao gerar imagem:', err)
    } finally {
      setCompartilhando(false)
    }
  }

  if (!carta) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-dourado border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-serif text-gradient mb-2">Carta do Dia</h1>
        <p className="text-white text-sm">
          {getDataHoje().split('-').reverse().join('/')} — Uma mensagem especial para você hoje
        </p>
      </div>

      {/* Card capturável */}
      <div ref={cardRef} className="max-w-sm mx-auto">
        <div className="glass-dourado rounded-3xl overflow-hidden">
          {/* Topo com nome do app */}
          <div className="px-6 pt-5 pb-3 text-center border-b border-dourado/10">
            <p className="text-dourado/90 text-xs tracking-widest uppercase font-serif">Oráculo Andara</p>
            <p className="text-white/90 text-xs mt-0.5">Carta do Dia</p>
          </div>

          {/* Imagem */}
          <div className="relative">
            {!revelada ? (
              <button
                onClick={() => setRevelada(true)}
                className="w-full flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/5 transition-all"
                style={{ minHeight: '180px', background: 'linear-gradient(135deg, #2d1b69, #0d0618)' }}
              >
                <span className="text-dourado/85 text-6xl animate-brilhar">✦</span>
                <p className="text-white/90 text-sm">Toque para revelar</p>
              </button>
            ) : (
              <div className="w-full flex items-center justify-center animate-revelar" style={{ background: '#0d0618', minHeight: '180px' }}>
                <img
                  src={carta.imagem}
                  alt={carta.nome}
                  className="max-h-64 w-auto object-contain"
                />
              </div>
            )}
          </div>

          {/* Conteúdo */}
          {revelada && (
            <div className="p-6 space-y-4 animate-revelar">
              <div className="text-center">
                <h2 className="font-serif text-dourado text-xl">{carta.nome}</h2>
                <span
                  className="inline-block mt-2 text-xs px-3 py-0.5 rounded-full"
                  style={{ backgroundColor: carta.cor + '22', color: carta.cor, border: `1px solid ${carta.cor}44` }}
                >
                  {carta.elemento}
                </span>
              </div>

              <div className="border-t border-white/5 pt-4">
                <p className="text-white/90 text-sm leading-relaxed">{carta.mensagem}</p>
              </div>

              <div className="border-t border-white/5 pt-4">
                <p className="text-xs text-dourado/90 uppercase tracking-wider mb-2">Ação Prática</p>
                <p className="text-white text-sm leading-relaxed italic">{carta.acaoPratica}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botão compartilhar */}
      {revelada && (
        <div className="text-center animate-revelar">
          <button
            onClick={handleCompartilhar}
            disabled={compartilhando}
            className="bg-dourado/10 hover:bg-dourado/20 border border-dourado/20 text-dourado px-6 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50"
          >
            {compartilhando ? 'Gerando imagem...' : '↓ Compartilhar Carta'}
          </button>
        </div>
      )}

      {/* Energia Coletiva — PRO */}
      {isPro && cartaColetiva && revelada && (
        <div className="glass rounded-2xl p-6 border border-dourado/10 max-w-sm mx-auto animate-revelar space-y-4">
          <p className="text-xs text-dourado/85 uppercase tracking-widest text-center">✦ Energia Coletiva de Hoje</p>
          <div className="flex items-center gap-3">
            <img
              src={cartaColetiva.imagem}
              alt={cartaColetiva.nome}
              className="w-14 object-contain rounded-lg flex-shrink-0 border border-dourado/20"
              style={{ maxHeight: '72px' }}
            />
            <div>
              <p className="text-white text-sm font-serif text-dourado">{cartaColetiva.nome}</p>
              <span
                className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: cartaColetiva.cor + '22', color: cartaColetiva.cor, border: `1px solid ${cartaColetiva.cor}44` }}
              >
                {cartaColetiva.elemento}
              </span>
            </div>
          </div>
          <p className="text-white text-sm leading-relaxed border-t border-white/5 pt-4">
            {cartaColetiva.mensagem}
          </p>
          <div className="border-t border-dourado/10 pt-4 space-y-2">
            <p className="text-xs text-dourado/90 uppercase tracking-widest">✦ Síntese das Energias</p>
            <p className="text-white/90 text-sm leading-relaxed italic">
              {gerarSinteseCombinada(carta, cartaColetiva)}
            </p>
          </div>
        </div>
      )}

      {!isPro && revelada && (
        <div className="glass rounded-2xl p-5 text-center max-w-sm mx-auto border border-dourado/10">
          <p className="text-dourado/90 text-xs uppercase tracking-widest mb-2">Energia Coletiva</p>
          <p className="text-white/95 text-sm">
            Usuários PRO têm acesso à carta coletiva do dia, compartilhada por toda a comunidade.
          </p>
          <span className="inline-block mt-3 text-xs bg-dourado/10 text-dourado border border-dourado/20 px-3 py-1 rounded-full">
            Recurso PRO
          </span>
        </div>
      )}
    </div>
  )
}
