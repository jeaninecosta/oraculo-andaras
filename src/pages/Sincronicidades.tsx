import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import cartas from '../data/cartas.json'

interface Carta {
  id: string
  nome: string
  elemento: string
  cor: string
  imagem: string
}

interface Relatorio {
  id: string
  tiragem: number[]
  created_at: string
}

const ELEMENTO_DESC: Record<string, string> = {
  Água: 'um momento de profunda cura emocional, intuição e renovação. As águas internas estão em movimento, pedindo atenção às emoções e à purificação.',
  Fogo: 'um ciclo de ação, paixão e transformação. A energia do fogo te convida à coragem, ao movimento e à expressão do seu poder pessoal.',
  Terra: 'um período de aterramento, estabilidade e reconexão com o essencial. A Terra te convida a cuidar do corpo, das raízes e da praticidade.',
  Ar: 'um tempo de expansão mental, clareza e novas perspectivas. O Ar traz leveza, comunicação e a abertura para novos horizontes.',
  Éter: 'um momento de conexão espiritual profunda, transcendência e sabedoria elevada. O Éter te convida à contemplação, à magia e ao contato com dimensões sutis.',
}

const ORACULO_VIVO: Record<string, string> = {
  Água: 'Suas emoções são seus mensageiros mais fiéis. Esta semana, permita-se sentir sem julgamentos. A cura que você busca está na sua capacidade de fluir, não de controlar.',
  Fogo: 'Você está sendo chamado para agir. O universo vê sua coragem e a apoia. Não deixe o medo apagar sua chama — este é o momento de brilhar e avançar com determinação.',
  Terra: 'Suas raízes precisam de atenção. Cuide do seu corpo, organize seu espaço, honre o presente. A abundância que você busca começa na solidez que você constrói agora.',
  Ar: 'Seus pensamentos estão criando sua realidade. Observe o que está ocupando sua mente e escolha conscientemente elevar sua frequência mental. Uma nova perspectiva muda tudo.',
  Éter: 'Você está em um momento de despertar espiritual. Confie nos sinais, nas sincronicidades e nas mensagens que chegam. O véu entre os mundos está fino — sua intuição está afiadíssima.',
}

function TelaUpgrade() {
  return (
    <div className="space-y-6 max-w-md mx-auto text-center py-10">
      <div className="glass-dourado rounded-3xl p-10 space-y-4">
        <div className="text-5xl">✦</div>
        <h2 className="font-serif text-dourado text-2xl">Sincronicidades</h2>
        <p className="text-white text-sm leading-relaxed">
          Analise os padrões das suas consultas e descubra quais elementos predominam na sua jornada. Receba mensagens personalizadas baseadas nas suas sincronicidades.
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

export default function Sincronicidades() {
  const { isPro, user } = useAuth()
  const [relatorios, setRelatorios] = useState<Relatorio[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !isPro) { setLoading(false); return }
    supabase
      .from('relatorios')
      .select('id, tiragem, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        setRelatorios((data ?? []) as Relatorio[])
        setLoading(false)
      })
  }, [user, isPro])

  if (!isPro) return <TelaUpgrade />

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-dourado border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Analisar elementos
  const allCartasIndexes = relatorios.flatMap(r => r.tiragem ?? [])
  const elementoContagem: Record<string, number> = {}
  const cartaContagem: Record<number, number> = {}

  allCartasIndexes.forEach(idx => {
    if (idx >= 0 && idx < (cartas as Carta[]).length) {
      const carta = (cartas as Carta[])[idx]
      elementoContagem[carta.elemento] = (elementoContagem[carta.elemento] ?? 0) + 1
      cartaContagem[idx] = (cartaContagem[idx] ?? 0) + 1
    }
  })

  const elementoOrdenado = Object.entries(elementoContagem).sort((a, b) => b[1] - a[1])
  const elementoPredominante = elementoOrdenado[0]?.[0] ?? null

  const cartasMaisComuns = Object.entries(cartaContagem)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([idx, qtd]) => ({
      carta: (cartas as Carta[])[Number(idx)],
      qtd,
    }))

  const semanaRelatorios = relatorios.filter(r => {
    const d = new Date(r.created_at)
    const now = new Date()
    return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000
  })

  if (relatorios.length === 0) {
    return (
      <div className="space-y-6 max-w-lg mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-serif text-gradient mb-2">Sincronicidades</h1>
          <p className="text-white text-sm">Padrões da sua jornada oracular</p>
        </div>
        <div className="glass rounded-2xl p-8 text-center space-y-3">
          <p className="text-dourado/90 text-lg">✦</p>
          <p className="text-white text-sm">
            Você ainda não tem consultas salvas. Faça algumas consultas com clientes para começar a ver seus padrões.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-serif text-gradient mb-2">Sincronicidades</h1>
        <p className="text-white text-sm">Padrões da sua jornada oracular</p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4 text-center">
          <p className="text-3xl font-serif text-dourado">{relatorios.length}</p>
          <p className="text-white/95 text-xs mt-1">Consultas totais</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <p className="text-3xl font-serif text-dourado">{semanaRelatorios.length}</p>
          <p className="text-white/95 text-xs mt-1">Esta semana</p>
        </div>
      </div>

      {/* Elemento predominante */}
      {elementoPredominante && (
        <div className="glass-dourado rounded-2xl p-6 space-y-3">
          <p className="text-xs text-dourado/90 uppercase tracking-widest">Elemento predominante</p>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
              style={{
                background: `${getElementoCor(elementoPredominante)}22`,
                border: `1px solid ${getElementoCor(elementoPredominante)}44`,
              }}
            >
              {getElementoEmoji(elementoPredominante)}
            </div>
            <div>
              <h2 className="font-serif text-dourado text-xl">{elementoPredominante}</h2>
              <p className="text-white/95 text-xs">{elementoContagem[elementoPredominante]} cartas recebidas</p>
            </div>
          </div>
          <p className="text-white text-sm leading-relaxed border-t border-white/5 pt-3">
            Você recebeu {elementoContagem[elementoPredominante]} cartas de {elementoPredominante}. Isso sugere{' '}
            {ELEMENTO_DESC[elementoPredominante]}
          </p>
        </div>
      )}

      {/* Distribuição de elementos */}
      {elementoOrdenado.length > 1 && (
        <div className="glass rounded-2xl p-5 space-y-3">
          <p className="text-xs text-dourado/90 uppercase tracking-widest mb-3">Distribuição dos elementos</p>
          {elementoOrdenado.map(([el, qtd]) => {
            const pct = Math.round((qtd / allCartasIndexes.length) * 100)
            return (
              <div key={el} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white flex items-center gap-1.5">
                    {getElementoEmoji(el)} {el}
                  </span>
                  <span className="text-white/90">{qtd} cartas ({pct}%)</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: getElementoCor(el),
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Cartas mais frequentes */}
      {cartasMaisComuns.length > 0 && (
        <div className="glass rounded-2xl p-5 space-y-3">
          <p className="text-xs text-dourado/90 uppercase tracking-widest mb-3">Andaras mais presentes</p>
          <div className="space-y-3">
            {cartasMaisComuns.map(({ carta, qtd }, i) => (
              <div key={i} className="flex items-center gap-3">
                <img
                  src={carta.imagem}
                  alt={carta.nome}
                  className="w-10 h-14 object-cover rounded-lg flex-shrink-0 border border-white/10"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white/90 text-sm truncate">{carta.nome}</p>
                  <p className="text-white/90 text-xs">{carta.elemento}</p>
                </div>
                <span className="text-dourado/90 text-sm font-serif">{qtd}×</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Oráculo Vivo */}
      {elementoPredominante && ORACULO_VIVO[elementoPredominante] && (
        <div className="glass-dourado rounded-2xl p-6 space-y-3 border border-dourado/20">
          <p className="text-xs text-dourado/90 uppercase tracking-widest flex items-center gap-2">
            <span>✦</span> Oráculo Vivo
          </p>
          <p className="font-serif text-dourado text-base leading-relaxed">
            "{ORACULO_VIVO[elementoPredominante]}"
          </p>
        </div>
      )}
    </div>
  )
}

function getElementoCor(elemento: string): string {
  const cores: Record<string, string> = {
    Água: '#4FC3F7',
    Fogo: '#FF7043',
    Terra: '#66BB6A',
    Ar: '#B39DDB',
    Éter: '#AB47BC',
  }
  return cores[elemento] ?? '#d4af37'
}

function getElementoEmoji(elemento: string): string {
  const emojis: Record<string, string> = {
    Água: '💧',
    Fogo: '🔥',
    Terra: '🌍',
    Ar: '🌬️',
    Éter: '✦',
  }
  return emojis[elemento] ?? '✦'
}
