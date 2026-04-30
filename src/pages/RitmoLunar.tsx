import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface FaseLunar {
  fase: string
  emoji: string
  descricao: string
  tipoTiragem: string
}

function getFaseLunar(data: Date): FaseLunar {
  const known = new Date(2000, 0, 6, 18, 14)
  const synodic = 29.53058867
  const diff = (data.getTime() - known.getTime()) / (1000 * 60 * 60 * 24)
  const age = ((diff % synodic) + synodic) % synodic
  if (age < 1.85) return { fase: 'Lua Nova', emoji: '🌑', descricao: 'Momento de plantar intenções e começar ciclos.', tipoTiragem: 'intenção' }
  if (age < 7.38) return { fase: 'Lua Crescente', emoji: '🌒', descricao: 'Energia de ação, crescimento e construção.', tipoTiragem: 'ação' }
  if (age < 9.22) return { fase: 'Quarto Crescente', emoji: '🌓', descricao: 'Superação de obstáculos e força de vontade.', tipoTiragem: 'força' }
  if (age < 14.77) return { fase: 'Lua Gibosa Crescente', emoji: '🌔', descricao: 'Refinamento e aperfeiçoamento do que foi plantado.', tipoTiragem: 'refinamento' }
  if (age < 16.61) return { fase: 'Lua Cheia', emoji: '🌕', descricao: 'Plenitude, expansão e manifestação. Energia máxima.', tipoTiragem: 'expansão' }
  if (age < 22.15) return { fase: 'Lua Gibosa Minguante', emoji: '🌖', descricao: 'Gratidão e compartilhamento das conquistas.', tipoTiragem: 'gratidão' }
  if (age < 23.99) return { fase: 'Quarto Minguante', emoji: '🌗', descricao: 'Liberação e perdão. Deixar ir o que não serve.', tipoTiragem: 'liberação' }
  return { fase: 'Lua Minguante', emoji: '🌘', descricao: 'Descanso, introspecção e preparação para novo ciclo.', tipoTiragem: 'descanso' }
}

const AREA_POR_TIRAGEM: Record<string, string> = {
  'intenção': 'proposito',
  'ação': 'proposito',
  'força': 'decisoes',
  'refinamento': 'cura',
  'expansão': 'amor',
  'gratidão': 'espiritualidade',
  'liberação': 'cura',
  'descanso': 'espiritualidade',
}

const DICAS_POR_FASE: Record<string, string[]> = {
  'Lua Nova': [
    'Escreva suas intenções em um papel.',
    'Medite sobre seus objetivos do próximo ciclo.',
    'Plante sementes físicas ou metafóricas.',
  ],
  'Lua Crescente': [
    'Dê os primeiros passos concretos.',
    'Busque aprendizado e novas conexões.',
    'Mantenha o foco e o entusiasmo.',
  ],
  'Quarto Crescente': [
    'Supere obstáculos com determinação.',
    'Ajuste seus planos conforme necessário.',
    'Peça ajuda sem hesitação.',
  ],
  'Lua Gibosa Crescente': [
    'Refine e aprimore o que está fazendo.',
    'Seja paciente com seu processo.',
    'Cultive gratidão pelo crescimento.',
  ],
  'Lua Cheia': [
    'Manifeste e celebre suas conquistas.',
    'Pratique rituais de gratidão.',
    'Compartilhe sua abundância.',
  ],
  'Lua Gibosa Minguante': [
    'Compartilhe suas conquistas e sabedoria.',
    'Reflita sobre o que aprendeu.',
    'Agradeça profundamente.',
  ],
  'Quarto Minguante': [
    'Libere o que já não serve mais.',
    'Pratique o perdão — a si e aos outros.',
    'Simplifique sua vida.',
  ],
  'Lua Minguante': [
    'Descanse e recupere suas energias.',
    'Reflita em silêncio e solidão.',
    'Prepare o terreno para o próximo ciclo.',
  ],
}

function TelaUpgrade() {
  return (
    <div className="space-y-6 max-w-md mx-auto text-center py-10">
      <div className="glass-dourado rounded-3xl p-10 space-y-4">
        <div className="text-5xl">🌕</div>
        <h2 className="font-serif text-dourado text-2xl">Ritmo Lunar</h2>
        <p className="text-white text-sm leading-relaxed">
          Descubra a fase lunar atual e sincronize suas consultas com a energia da Lua. Receba sugestões de tiragem alinhadas ao ciclo lunar.
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

export default function RitmoLunar() {
  const { isPro } = useAuth()
  const navigate = useNavigate()
  const fase = getFaseLunar(new Date())
  const dicas = DICAS_POR_FASE[fase.fase] ?? []

  if (!isPro) return <TelaUpgrade />

  function fazerTiragemLunar() {
    const area = AREA_POR_TIRAGEM[fase.tipoTiragem] ?? null
    navigate('/app/consulta', { state: { areaPreSelecionada: area } })
  }

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-serif text-gradient mb-2">Ritmo Lunar</h1>
        <p className="text-white text-sm">Sincronize suas consultas com os ciclos da Lua</p>
      </div>

      {/* Fase atual */}
      <div className="glass-dourado rounded-3xl p-8 text-center space-y-4">
        <div
          className="text-8xl mb-2"
          style={{ filter: 'drop-shadow(0 0 20px #d4af3744)' }}
        >
          {fase.emoji}
        </div>
        <div>
          <p className="text-xs text-dourado/90 uppercase tracking-widest mb-1">Fase atual</p>
          <h2 className="font-serif text-dourado text-2xl">{fase.fase}</h2>
        </div>
        <p className="text-white text-sm leading-relaxed">{fase.descricao}</p>
        <div className="border-t border-white/5 pt-4">
          <p className="text-xs text-white/90 uppercase tracking-wider mb-1">Tipo de energia recomendada</p>
          <span className="inline-block bg-dourado/10 text-dourado border border-dourado/20 px-3 py-1 rounded-full text-sm capitalize">
            {fase.tipoTiragem}
          </span>
        </div>
      </div>

      {/* Dicas da fase */}
      <div className="glass rounded-2xl p-6 space-y-3">
        <p className="text-xs text-dourado/90 uppercase tracking-widest mb-4">Práticas para este momento</p>
        {dicas.map((dica, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="text-dourado/85 mt-0.5">✦</span>
            <p className="text-white text-sm">{dica}</p>
          </div>
        ))}
      </div>

      {/* Botão de tiragem */}
      <button
        onClick={fazerTiragemLunar}
        className="w-full bg-dourado/10 hover:bg-dourado/20 border border-dourado/30 text-dourado font-serif text-lg py-4 rounded-2xl transition-all"
      >
        {fase.emoji} Fazer Tiragem Lunar
      </button>

      {/* Calendário de fases */}
      <div className="glass rounded-2xl p-5 space-y-3">
        <p className="text-xs text-dourado/90 uppercase tracking-widest text-center mb-3">Ciclo das fases</p>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { emoji: '🌑', nome: 'Lua Nova' },
            { emoji: '🌒', nome: 'Crescente' },
            { emoji: '🌕', nome: 'Lua Cheia' },
            { emoji: '🌘', nome: 'Minguante' },
          ].map(f => (
            <div
              key={f.nome}
              className={`p-2 rounded-xl transition-all ${
                fase.fase === f.nome || (f.nome === 'Crescente' && fase.fase.includes('Crescente')) || (f.nome === 'Minguante' && fase.fase.includes('Minguante'))
                  ? 'bg-dourado/10 border border-dourado/20'
                  : 'opacity-40'
              }`}
            >
              <div className="text-2xl mb-1">{f.emoji}</div>
              <p className="text-white text-xs leading-tight">{f.nome}</p>
            </div>
          ))}
        </div>
        <p className="text-white text-xs text-center pt-2">
          Ciclo lunar: aproximadamente 29,5 dias
        </p>
      </div>
    </div>
  )
}
