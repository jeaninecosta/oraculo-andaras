import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import cartas from '../data/cartas.json'

type Modalidade = 'uma' | 'tres' | 'cinco' | 'sete'

interface Carta {
  id: string
  nome: string
  palavrasChave: string
  mensagem: string
  acaoPratica: string
  imagem: string
}

const MODALIDADES: { id: Modalidade; label: string; qtd: number; somentePro?: boolean }[] = [
  { id: 'uma',   label: '1 Carta',              qtd: 1 },
  { id: 'tres',  label: '3 Cartas — Passado, Presente e Futuro', qtd: 3 },
  { id: 'cinco', label: '5 Cartas',              qtd: 5, somentePro: true },
  { id: 'sete',  label: '7 Cartas',              qtd: 7, somentePro: true },
]

const POSICOES_3 = ['Passado', 'Presente', 'Futuro']
const POSICOES_5 = ['Situação', 'Desafio', 'Passado', 'Futuro', 'Resultado']
const POSICOES_7 = ['Situação', 'Desafio', 'Passado', 'Futuro', 'Acima', 'Abaixo', 'Resultado']

function getPosicoes(qtd: number) {
  if (qtd === 3) return POSICOES_3
  if (qtd === 5) return POSICOES_5
  if (qtd === 7) return POSICOES_7
  return ['']
}

function sortear(qtd: number): Carta[] {
  const embaralhado = [...cartas].sort(() => Math.random() - 0.5)
  return embaralhado.slice(0, qtd) as Carta[]
}

export default function Consulta() {
  const { isPro, perfil } = useAuth()
  const [modalidade, setModalidade] = useState<Modalidade | null>(null)
  const [cartasSorteadas, setCartasSorteadas] = useState<Carta[]>([])
  const [reveladas, setReveladas] = useState<boolean[]>([])
  const [cartaAberta, setCartaAberta] = useState<number | null>(null)

  function iniciarConsulta(m: Modalidade) {
    const qtd = MODALIDADES.find(x => x.id === m)!.qtd
    const sorteadas = sortear(qtd)
    setModalidade(m)
    setCartasSorteadas(sorteadas)
    setReveladas(new Array(qtd).fill(false))
    setCartaAberta(null)
  }

  function revelarCarta(i: number) {
    setReveladas(prev => { const n = [...prev]; n[i] = true; return n })
    setCartaAberta(i)
  }

  function reiniciar() {
    setModalidade(null)
    setCartasSorteadas([])
    setReveladas([])
    setCartaAberta(null)
  }

  const posicoes = modalidade ? getPosicoes(MODALIDADES.find(x => x.id === modalidade)!.qtd) : []

  // Tela de seleção de modalidade
  if (!modalidade) return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-serif text-gradient mb-2">Consulta Oracular</h1>
        <p className="text-cristal/50 text-sm">
          {perfil?.nome ? `Olá, ${perfil.nome}. ` : ''}Escolha sua tiragem
        </p>
      </div>

      <div className="grid gap-3 max-w-lg mx-auto">
        {MODALIDADES.map(m => {
          const bloqueado = m.somentePro && !isPro
          return (
            <button key={m.id} onClick={() => !bloqueado && iniciarConsulta(m.id)}
              disabled={bloqueado}
              className={`glass-dourado rounded-2xl p-5 text-left transition-all relative ${
                bloqueado
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:bg-dourado/10 hover:border-dourado/40 cursor-pointer'
              }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-serif text-dourado text-lg">{m.label}</p>
                  {m.qtd > 1 && <p className="text-cristal/40 text-xs mt-0.5">{posicoes.length === 0 ? getPosicoes(m.qtd).join(' · ') : getPosicoes(m.qtd).join(' · ')}</p>}
                </div>
                {bloqueado
                  ? <span className="text-xs bg-dourado/10 text-dourado border border-dourado/20 px-2 py-0.5 rounded-full">PRO</span>
                  : <span className="text-dourado text-xl">→</span>
                }
              </div>
            </button>
          )
        })}
      </div>

      {!isPro && (
        <p className="text-center text-cristal/30 text-xs">
          Faça upgrade para o plano Pro e desbloqueie tiragens de 5 e 7 cartas
        </p>
      )}
    </div>
  )

  // Tela de consulta
  const cartaAtual = cartaAberta !== null ? cartasSorteadas[cartaAberta] : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif text-dourado">
          {MODALIDADES.find(x => x.id === modalidade)?.label}
        </h1>
        <button onClick={reiniciar} className="text-cristal/40 hover:text-cristal text-sm transition-colors">
          ↩ Nova consulta
        </button>
      </div>

      {/* Cartas */}
      <div className={`grid gap-4 justify-items-center ${
        cartasSorteadas.length === 1 ? 'grid-cols-1' :
        cartasSorteadas.length <= 3 ? 'grid-cols-3' :
        'grid-cols-3 md:grid-cols-4'
      }`}>
        {cartasSorteadas.map((carta, i) => (
          <div key={i} className="flex flex-col items-center gap-2 w-full max-w-[140px]">
            {posicoes[i] && (
              <p className="text-cristal/50 text-xs text-center">{posicoes[i]}</p>
            )}
            <button onClick={() => !reveladas[i] && revelarCarta(i)}
              className={`w-full aspect-[2/3] rounded-2xl overflow-hidden border-2 transition-all ${
                reveladas[i]
                  ? cartaAberta === i ? 'border-dourado shadow-lg shadow-dourado/20' : 'border-white/10'
                  : 'border-dourado/30 hover:border-dourado/60 cursor-pointer'
              }`}
              style={reveladas[i] ? {} : { background: 'linear-gradient(135deg, #2d1b69, #0d0618)' }}>
              {reveladas[i] ? (
                <img src={carta.imagem} alt={carta.nome}
                  className="w-full h-full object-cover animate-revelar"
                  onClick={() => setCartaAberta(i)} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-dourado/40 text-3xl animate-brilhar">✦</span>
                </div>
              )}
            </button>
            {reveladas[i] && (
              <p className="text-cristal/60 text-xs text-center leading-tight">{carta.nome.replace('Andara ', '')}</p>
            )}
          </div>
        ))}
      </div>

      {/* Mensagem da carta aberta */}
      {cartaAtual && (
        <div className="glass-dourado rounded-2xl p-6 space-y-4 animate-revelar">
          <div className="flex items-start gap-4">
            <img src={cartaAtual.imagem} alt={cartaAtual.nome}
              className="w-20 h-28 object-cover rounded-xl flex-shrink-0 border border-dourado/20" />
            <div>
              <h2 className="font-serif text-dourado text-xl">{cartaAtual.nome}</h2>
              <p className="text-cristal/50 text-xs mt-1 italic">{cartaAtual.palavrasChave}</p>
              {posicoes[cartaAberta!] && (
                <span className="inline-block mt-2 text-xs bg-mistico-medio/50 text-cristal/70 px-2 py-0.5 rounded-full">
                  {posicoes[cartaAberta!]}
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-white/5 pt-4">
            <p className="text-xs text-dourado/70 uppercase tracking-wider mb-2">Mensagem</p>
            <p className="text-cristal/80 text-sm leading-relaxed">{cartaAtual.mensagem}</p>
          </div>

          <div className="border-t border-white/5 pt-4">
            <p className="text-xs text-dourado/70 uppercase tracking-wider mb-2">Ação Prática</p>
            <p className="text-cristal/70 text-sm leading-relaxed italic">{cartaAtual.acaoPratica}</p>
          </div>

          {cartasSorteadas.length > 1 && reveladas.some(r => !r) && (
            <p className="text-center text-cristal/30 text-xs pt-2">
              Clique nas cartas ainda não reveladas para ver sua mensagem
            </p>
          )}
        </div>
      )}

      {/* Todas reveladas */}
      {reveladas.length > 0 && reveladas.every(r => r) && cartasSorteadas.length > 1 && (
        <div className="text-center py-4">
          <p className="text-cristal/40 text-sm mb-3">Todas as cartas foram reveladas</p>
          <button onClick={reiniciar}
            className="bg-dourado/10 hover:bg-dourado/20 border border-dourado/20 text-dourado px-6 py-2 rounded-xl text-sm transition-all">
            Nova consulta
          </button>
        </div>
      )}
    </div>
  )
}
