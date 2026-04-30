import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import cartas from '../data/cartas.json'
import type { ClientePro } from '../lib/supabase'

type Modalidade = 'uma' | 'tres' | 'cinco' | 'sete'

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

const AREAS = [
  { id: 'amor', label: 'Amor', emoji: '❤️' },
  { id: 'proposito', label: 'Propósito', emoji: '✨' },
  { id: 'espiritualidade', label: 'Espiritualidade', emoji: '🔮' },
  { id: 'decisoes', label: 'Decisões', emoji: '⚖️' },
  { id: 'cura', label: 'Cura Emocional', emoji: '🌿' },
  { id: 'prosperidade', label: 'Prosperidade', emoji: '🌟' },
]

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

function gerarTextoCartas(cartas: Carta[], posicoes: string[]): string {
  return cartas.map((carta, i) => {
    const posicao = posicoes[i] ? `${posicoes[i].toUpperCase()}\n` : ''
    return `${posicao}${carta.nome}\nPalavras-chave: ${carta.palavrasChave}\n\nMensagem:\n${carta.mensagem}\n\nAção Prática:\n${carta.acaoPratica}`
  }).join('\n\n---CARTA---\n\n')
}

async function gerarSinteseIA(
  cartas: Carta[],
  posicoes: string[],
  clienteNome: string,
  intencao?: string,
  area?: string,
): Promise<string> {
  try {
    const res = await fetch('/api/gerar-sintese', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartas, posicoes, cliente_nome: clienteNome, intencao, area }),
    })
    const data = await res.json()
    return data.sintese ?? ''
  } catch {
    return ''
  }
}

export default function Consulta() {
  const { isPro, perfil, user } = useAuth()
  const location = useLocation()
  const navState = location.state as { cliente?: ClientePro; areaPreSelecionada?: string } | null
  const clienteViaNav = navState?.cliente ?? null
  const areaViaNav = navState?.areaPreSelecionada ?? null

  const [modalidade, setModalidade] = useState<Modalidade | null>(null)
  const [cartasSorteadas, setCartasSorteadas] = useState<Carta[]>([])
  const [reveladas, setReveladas] = useState<boolean[]>([])
  const [cartaAberta, setCartaAberta] = useState<number | null>(null)
  const [relatorioSalvo, setRelatorioSalvo] = useState(false)
  const [intencao, setIntencao] = useState('')
  const [areaSelecionada, setAreaSelecionada] = useState<string | null>(areaViaNav)

  const posicoes = modalidade ? getPosicoes(MODALIDADES.find(x => x.id === modalidade)!.qtd) : []

  // Salva relatório automaticamente quando todas as cartas são reveladas
  useEffect(() => {
    if (
      reveladas.length > 0 &&
      reveladas.every(r => r) &&
      user &&
      !relatorioSalvo
    ) {
      setRelatorioSalvo(true)
      const nomeCliente = clienteViaNav?.nome ?? 'Consulta Pessoal'
      const textoCartas = gerarTextoCartas(cartasSorteadas, posicoes)
      const indicesReais = cartasSorteadas.map(c => (cartas as Carta[]).findIndex(x => x.id === c.id))
      gerarSinteseIA(cartasSorteadas, posicoes, nomeCliente, intencao || undefined, areaSelecionada || undefined).then(sintese => {
        const textoFinal = sintese
          ? `${sintese}\n\n---DIVISOR---\n\nCARTAS DA TIRAGEM\n\n${textoCartas}`
          : `CARTAS DA TIRAGEM\n\n${textoCartas}`
        supabase.from('relatorios').insert({
          user_id: user.id,
          cliente_id: clienteViaNav?.id ?? null,
          cliente_nome: nomeCliente,
          tiragem: indicesReais,
          texto_editado: textoFinal,
        }).then(({ error }) => {
          if (error) console.error('Erro ao salvar relatório:', JSON.stringify(error))
        })
      })
    }
  }, [reveladas])

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
    setRelatorioSalvo(false)
    setIntencao('')
    setAreaSelecionada(null)
  }

  // Tela de seleção de modalidade
  if (!modalidade) return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-serif text-gradient mb-2">Consulta Oracular</h1>
        <p className="text-white text-sm">
          {clienteViaNav
            ? `Consulta para ${clienteViaNav.nome}`
            : perfil?.nome ? `Olá, ${perfil.nome}. Escolha sua tiragem` : 'Escolha sua tiragem'}
        </p>
      </div>

      {/* Campo de intenção */}
      <div className="glass rounded-2xl p-5 max-w-lg mx-auto">
        <label className="block text-xs text-dourado/90 uppercase tracking-wider mb-2">
          Sua intenção para esta consulta (opcional)
        </label>
        <textarea
          value={intencao}
          onChange={e => setIntencao(e.target.value)}
          placeholder="Ex: Busco clareza sobre meu propósito de vida..."
          rows={2}
          className="w-full bg-transparent text-white/90 placeholder-cristal/50 text-sm resize-none outline-none leading-relaxed"
        />
      </div>

      {/* Seleção de área */}
      <div className="max-w-lg mx-auto space-y-2">
        <p className="text-sm text-white/90 uppercase tracking-wider text-center font-semibold">Área da consulta (opcional)</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {AREAS.map(a => (
            <button
              key={a.id}
              onClick={() => setAreaSelecionada(prev => prev === a.id ? null : a.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all border ${
                areaSelecionada === a.id
                  ? 'bg-dourado/15 text-dourado border-dourado/30'
                  : 'bg-white/5 text-white/90 border-white/15 hover:border-white/30'
              }`}
            >
              <span>{a.emoji}</span>
              <span>{a.label}</span>
            </button>
          ))}
        </div>
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
                  <p className="font-sans font-semibold text-dourado text-base">{m.label}</p>
                  {m.qtd > 1 && <p className="text-white text-sm mt-0.5">{getPosicoes(m.qtd).join(' · ')}</p>}
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
        <p className="text-center text-white text-xs">
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
        <button onClick={reiniciar} className="text-white/90 hover:text-white text-sm transition-colors">
          ↩ Nova consulta
        </button>
      </div>

      {/* Cartas */}
      <div className={`grid gap-4 justify-items-center ${
        cartasSorteadas.length === 1 ? 'grid-cols-1' :
        cartasSorteadas.length <= 3 ? 'grid-cols-3' :
        cartasSorteadas.length === 5 ? 'grid-cols-3 md:grid-cols-5' :
        'grid-cols-4 md:grid-cols-7'
      }`}>
        {cartasSorteadas.map((carta, i) => (
          <div key={i} className="flex flex-col items-center gap-2 w-full max-w-[140px]">
            {posicoes[i] && (
              <p className="text-white/95 text-xs text-center">{posicoes[i]}</p>
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
                  <span className="text-dourado/85 text-3xl animate-brilhar">✦</span>
                </div>
              )}
            </button>
            {reveladas[i] && (
              <p className="text-white text-xs text-center leading-tight">{carta.nome.replace('Andara ', '')}</p>
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
              <p className="text-white/95 text-xs mt-1 italic">{cartaAtual.palavrasChave}</p>
              {posicoes[cartaAberta!] && (
                <span className="inline-block mt-2 text-xs bg-mistico-medio/50 text-white px-2 py-0.5 rounded-full">
                  {posicoes[cartaAberta!]}
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

          {cartasSorteadas.length > 1 && reveladas.some(r => !r) && (
            <p className="text-center text-white text-xs pt-2">
              Clique nas cartas ainda não reveladas para ver sua mensagem
            </p>
          )}
        </div>
      )}

      {/* Todas reveladas */}
      {reveladas.length > 0 && reveladas.every(r => r) && cartasSorteadas.length > 1 && (
        <div className="text-center py-4 space-y-3">
          {relatorioSalvo && clienteViaNav && (
            <p className="text-dourado/90 text-xs">
              ✦ Relatório salvo para {clienteViaNav.nome}
            </p>
          )}
          <p className="text-white/90 text-sm">Todas as cartas foram reveladas</p>
          <button onClick={reiniciar}
            className="bg-dourado/10 hover:bg-dourado/20 border border-dourado/20 text-dourado px-6 py-2 rounded-xl text-sm transition-all">
            Nova consulta
          </button>
        </div>
      )}
    </div>
  )
}
