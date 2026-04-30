export default function Sobre() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-serif text-gradient mb-2">Sobre a Criadora</h1>
        <p className="text-white text-sm">Conheça a mente e o coração por trás do Oráculo Andara</p>
      </div>

      {/* Foto + bio */}
      <div className="glass-dourado rounded-2xl p-8 text-center space-y-4">
        <div className="w-40 h-40 rounded-full mx-auto border-2 border-dourado/50" style={{
          backgroundImage: 'url(/clarisse.png)',
          backgroundSize: '80%',
          backgroundPosition: 'center 5%',
          backgroundRepeat: 'no-repeat',
        }} />
        <h2 className="font-serif text-dourado text-2xl">Clarisse Schultz</h2>
        <p className="text-white text-sm leading-relaxed">
          Criadora do Oráculo Andara e estudiosa das pedras monoatômicas de Andara há anos.
          Com o coração transbordando de gratidão e reconhecimento da magnitude destes coloridos
          e tagarelas seres de luz, nasceu o Oráculo Andara.
        </p>
      </div>

      {/* Sobre as Andaras */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="font-serif text-dourado text-xl">O que são as Andaras?</h3>
        <p className="text-white text-sm leading-relaxed">
          Os monoatômicos de Andara são uma ferramenta de cura de alta vibração que melhora a alma
          e funciona em todos os níveis: físico, mental, emocional e espiritual. O processo cria uma
          experiência de cura única, individual e diferente para cada pessoa, ajudando-a a liberar
          energias indesejadas enquanto se move em direção ao seu próximo desafio e de volta à
          consciência divina original.
        </p>
        <p className="text-white text-sm leading-relaxed">
          A pessoa que usa um Andara é capaz de elevar sua própria vibração para corresponder,
          receber e mediar as frequências mais altas. Meditar com Andara, usar elixires de gemas
          feitos com eles, carregá-los e trabalhar com eles de outras maneiras nos ajudará a
          sintonizar com eles e aumentar nossa capacidade de usá-los como ferramentas para a cura
          e a ciência de explorar nossa consciência.
        </p>
      </div>

      {/* Sobre o oráculo */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="font-serif text-dourado text-xl">O Oráculo Andara</h3>
        <p className="text-white text-sm leading-relaxed">
          O objetivo deste Oráculo é, principalmente, proporcionar o autoconhecimento e,
          consequentemente, cura em todos os níveis. 84 cartas que representam as diferentes
          frequências e qualidades das pedras Andara, organizadas em cinco elementos:
        </p>
        <div className="grid grid-cols-1 gap-2 mt-4">
          {[
            { emoji: '💨', nome: 'Ar', sub: 'Expansão & Consciência' },
            { emoji: '🔥', nome: 'Fogo', sub: 'Criação & Movimento' },
            { emoji: '💧', nome: 'Água', sub: 'Cura & Renovação' },
            { emoji: '🌿', nome: 'Terra', sub: 'Verdade & Proteção' },
            { emoji: '✨', nome: 'Éter', sub: 'Sabedoria & Amor' },
          ].map(el => (
            <div key={el.nome} className="flex items-center gap-3 bg-mistico-escuro/50 rounded-xl px-4 py-2.5">
              <span className="text-xl">{el.emoji}</span>
              <div>
                <span className="text-white text-sm font-medium">Elemento {el.nome}</span>
                <span className="text-white/90 text-xs ml-2">— {el.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
