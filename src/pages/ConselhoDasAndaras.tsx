import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import cartas from '../data/cartas.json'

interface Carta {
  id: string
  nome: string
  palavrasChave: string
  mensagem: string
  acaoPratica: string
  imagem: string
  elemento?: string
  cor?: string
}

const POSICOES_CONSELHO = [
  'Energia Atual',
  'O Que Está Oculto',
  'O Que Liberar',
  'O Que Fortalecer',
  'Mensagem do Conselho Cristalino',
]

function sortear5(): Carta[] {
  return [...(cartas as Carta[])].sort(() => Math.random() - 0.5).slice(0, 5)
}

function gerarTextoConselho(sorteadas: Carta[]): string {
  return sorteadas.map((carta, i) => {
    return `POSIÇÃO ${i + 1}: ${POSICOES_CONSELHO[i].toUpperCase()}\n${carta.nome}\nPalavras-chave: ${carta.palavrasChave}\n\nMensagem:\n${carta.mensagem}\n\nAção Prática:\n${carta.acaoPratica}`
  }).join('\n\n---CARTA---\n\n')
}

async function gerarSinteseConselho(sorteadas: Carta[]): Promise<string> {
  try {
    const res = await fetch('/api/gerar-sintese', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cartas: sorteadas,
        posicoes: POSICOES_CONSELHO,
        cliente_nome: 'Consulente',
        intencao: 'Tiragem especial do Conselho das Andaras com 5 posições sagradas: Energia Atual, O que está oculto, O que liberar, O que fortalecer e a Mensagem do Conselho Cristalino.',
      }),
    })
    const data = await res.json()
    return data.sintese ?? ''
  } catch {
    return ''
  }
}

function TelaUpgrade() {
  return (
    <div className="space-y-6 max-w-md mx-auto text-center py-10">
      <div className="glass-dourado rounded-3xl p-10 space-y-4">
        <div className="text-5xl">✦</div>
        <h2 className="font-serif text-dourado text-2xl">Conselho das Andaras</h2>
        <p className="text-white text-sm leading-relaxed">
          Uma tiragem especial de 5 cartas com posições sagradas que revelam a energia atual, o que está oculto, o que liberar, o que fortalecer e a mensagem do conselho cristalino.
        </p>
        <div className="border-t border-white/5 pt-4">
          <span className="text-xs bg-dourado/10 text-dourado border border-dourado/20 px-3 py-1.5 rounded-full">
            Recurso exclusivo PRO
          </span>
        </div>
        <p className="text-white/90 text-xs">
          Faça upgrade para o plano PRO para acessar esta e outras features especiais.
        </p>
      </div>
    </div>
  )
}

export default function ConselhoDasAndaras() {
  const { isPro, user } = useAuth()

  const [iniciado, setIniciado] = useState(false)
  const [cartasSorteadas, setCartasSorteadas] = useState<Carta[]>([])
  const [reveladas, setReveladas] = useState<boolean[]>([])
  const [cartaAberta, setCartaAberta] = useState<number | null>(null)
  const [sintese, setSintese] = useState<string | null>(null)
  const [gerandoSintese, setGerandoSintese] = useState(false)
  const [salvo, setSalvo] = useState(false)

  const todasReveladas = reveladas.length === 5 && reveladas.every(Boolean)

  useEffect(() => {
    if (todasReveladas && !sintese && !gerandoSintese) {
      setGerandoSintese(true)
      gerarSinteseConselho(cartasSorteadas).then(async s => {
        setSintese(s)
        setGerandoSintese(false)

        if (user) {
          const textoCartas = gerarTextoConselho(cartasSorteadas)
          const textoFinal = s
            ? `CONSELHO DAS ANDARAS\n\n${s}\n\n---DIVISOR---\n\nCARTAS DA TIRAGEM\n\n${textoCartas}`
            : `CONSELHO DAS ANDARAS\n\nCARTAS DA TIRAGEM\n\n${textoCartas}`
          const { error } = await supabase.from('relatorios').insert({
            user_id: user.id,
            cliente_id: null,
            cliente_nome: 'Conselho das Andaras',
            tiragem: cartasSorteadas.map((_, i) => i),
            texto_editado: textoFinal,
          })
          if (!error) setSalvo(true)
        }
      })
    }
  }, [todasReveladas])

  if (!isPro) return <TelaUpgrade />

  function iniciar() {
    const sorteadas = sortear5()
    setCartasSorteadas(sorteadas)
    setReveladas(new Array(5).fill(false))
    setCartaAberta(null)
    setSintese(null)
    setGerandoSintese(false)
    setSalvo(false)
    setIniciado(true)
  }

  function revelarCarta(i: number) {
    setReveladas(prev => { const n = [...prev]; n[i] = true; return n })
    setCartaAberta(i)
  }

  function reiniciar() {
    setIniciado(false)
    setCartasSorteadas([])
    setReveladas([])
    setCartaAberta(null)
    setSintese(null)
    setGerandoSintese(false)
    setSalvo(false)
  }

  if (!iniciado) {
    return (
      <div className="space-y-8 max-w-lg mx-auto text-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-gradient mb-2">
            ✦ Conselho das Andaras ✦
          </h1>
          <p className="text-white text-sm">
            Uma tiragem sagrada de 5 cartas com posições especiais e síntese de inteligência espiritual
          </p>
        </div>

        <div className="glass-dourado rounded-2xl p-6 space-y-4 text-left">
          <p className="text-xs text-dourado/90 uppercase tracking-widest text-center mb-4">As 5 posições sagradas</p>
          {POSICOES_CONSELHO.map((pos, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-dourado/10 border border-dourado/20 flex items-center justify-center text-dourado text-xs flex-shrink-0">
                {i + 1}
              </span>
              <p className="text-white text-sm">{pos}</p>
            </div>
          ))}
        </div>

        <button
          onClick={iniciar}
          className="w-full bg-dourado/10 hover:bg-dourado/20 border border-dourado/30 text-dourado font-serif text-lg py-4 rounded-2xl transition-all"
        >
          Iniciar Conselho
        </button>
      </div>
    )
  }

  const cartaAtual = cartaAberta !== null ? cartasSorteadas[cartaAberta] : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif text-dourado">✦ Conselho das Andaras ✦</h1>
        <button onClick={reiniciar} className="text-white/90 hover:text-white text-sm transition-colors">
          ↩ Novo conselho
        </button>
      </div>

      {/* Grid de cartas */}
      <div className="grid grid-cols-5 gap-2 md:gap-4">
        {cartasSorteadas.map((carta, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <p className="text-white/90 text-xs text-center leading-tight hidden md:block">
              {POSICOES_CONSELHO[i]}
            </p>
            <p className="text-white/90 text-xs text-center md:hidden">{i + 1}</p>
            <button
              onClick={() => !reveladas[i] && revelarCarta(i)}
              className={`w-full aspect-[2/3] rounded-xl overflow-hidden border-2 transition-all ${
                reveladas[i]
                  ? cartaAberta === i ? 'border-dourado shadow-lg shadow-dourado/20' : 'border-white/10'
                  : 'border-dourado/30 hover:border-dourado/60 cursor-pointer'
              }`}
              style={reveladas[i] ? {} : { background: 'linear-gradient(135deg, #2d1b69, #0d0618)' }}
            >
              {reveladas[i] ? (
                <img
                  src={carta.imagem}
                  alt={carta.nome}
                  className="w-full h-full object-cover animate-revelar"
                  onClick={() => setCartaAberta(i)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-dourado/85 text-2xl animate-brilhar">✦</span>
                </div>
              )}
            </button>
            {reveladas[i] && (
              <p className="text-white/95 text-xs text-center leading-tight">
                {carta.nome.replace('Andara ', '')}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Carta aberta */}
      {cartaAtual && (
        <div className="glass-dourado rounded-2xl p-6 space-y-4 animate-revelar">
          <div className="flex items-start gap-4">
            <img
              src={cartaAtual.imagem}
              alt={cartaAtual.nome}
              className="w-20 h-28 object-cover rounded-xl flex-shrink-0 border border-dourado/20"
            />
            <div>
              <h2 className="font-serif text-dourado text-xl">{cartaAtual.nome}</h2>
              <p className="text-white/95 text-xs mt-1 italic">{cartaAtual.palavrasChave}</p>
              <span className="inline-block mt-2 text-xs bg-mistico-medio/50 text-white px-2 py-0.5 rounded-full">
                {POSICOES_CONSELHO[cartaAberta!]}
              </span>
              {cartaAtual.elemento && (
                <span
                  className="inline-block mt-2 ml-2 text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: (cartaAtual.cor ?? '#d4af37') + '22',
                    color: cartaAtual.cor ?? '#d4af37',
                    border: `1px solid ${cartaAtual.cor ?? '#d4af37'}44`,
                  }}
                >
                  {cartaAtual.elemento}
                </span>
              )}
            </div>
          </div>
          <div className="border-t border-white/5 pt-4">
            <p className="text-xs text-dourado/90 uppercase tracking-wider mb-2">Mensagem</p>
            <p className="text-white/90 text-sm leading-relaxed">{cartaAtual.mensagem}</p>
          </div>
          <div className="border-t border-white/5 pt-4">
            <p className="text-xs text-dourado/90 uppercase tracking-wider mb-2">Ação Prática</p>
            <p className="text-white text-sm leading-relaxed italic">{cartaAtual.acaoPratica}</p>
          </div>
          {!todasReveladas && (
            <p className="text-center text-white text-xs pt-2">
              Clique nas cartas ainda não reveladas para ver sua mensagem
            </p>
          )}
        </div>
      )}

      {/* Síntese IA */}
      {todasReveladas && (
        <div className="space-y-4">
          {gerandoSintese && (
            <div className="glass rounded-2xl p-8 text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-dourado/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-dourado/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-dourado/60 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <p className="text-white/90 text-sm">O Conselho Cristalino está preparando a síntese...</p>
            </div>
          )}

          {sintese && (
            <div className="glass-dourado rounded-2xl p-6 space-y-4 animate-revelar">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-dourado/90 text-lg">✦</span>
                <p className="text-xs text-dourado/90 uppercase tracking-wider">Síntese do Conselho Cristalino</p>
              </div>
              <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line">{sintese}</p>
              {salvo && (
                <p className="text-dourado/90 text-xs border-t border-white/5 pt-3">
                  ✦ Conselho salvo nos seus relatórios
                </p>
              )}
            </div>
          )}

          <div className="text-center">
            <button
              onClick={reiniciar}
              className="bg-dourado/10 hover:bg-dourado/20 border border-dourado/20 text-dourado px-6 py-2 rounded-xl text-sm transition-all"
            >
              Novo Conselho
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
