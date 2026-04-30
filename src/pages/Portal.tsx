import { useState } from 'react'
import { getFraseParaTema } from '../data/frases-portal'

export default function Portal() {
  const [pergunta, setPergunta] = useState('')
  const [frase, setFrase] = useState<string | null>(null)
  const [animando, setAnimando] = useState(false)
  const [tocado, setTocado] = useState(false)

  function revelarMensagem() {
    setAnimando(true)
    setFrase(null)
    setTimeout(() => {
      setFrase(getFraseParaTema(pergunta))
      setTocado(true)
      setAnimando(false)
    }, 600)
  }

  function novaMensagem() {
    setAnimando(true)
    setTimeout(() => {
      setFrase(getFraseParaTema(pergunta))
      setAnimando(false)
    }, 400)
  }

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-serif text-gradient mb-2">Portal de Mensagens</h1>
        <p className="text-white text-sm">
          Faça uma pergunta em seu coração e toque o cristal para receber uma mensagem
        </p>
      </div>

      {/* Campo de pergunta */}
      <div className="glass rounded-2xl p-5">
        <label className="block text-xs text-dourado/90 uppercase tracking-wider mb-2">
          Sua pergunta (opcional)
        </label>
        <textarea
          value={pergunta}
          onChange={e => setPergunta(e.target.value)}
          placeholder="O que você deseja saber hoje?"
          rows={3}
          className="w-full bg-transparent text-white/90 placeholder-cristal/50 text-sm resize-none outline-none leading-relaxed"
        />
      </div>

      {/* Cristal */}
      <div className="flex flex-col items-center gap-6">
        <button
          onClick={tocado ? novaMensagem : revelarMensagem}
          disabled={animando}
          className="relative group focus:outline-none"
          aria-label="Tocar o cristal"
        >
          {/* Glow de fundo */}
          <div
            className="absolute inset-0 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #d4af37 0%, #9c27b0 60%, transparent 100%)', transform: 'scale(1.2)' }}
          />
          {/* Cristal — forma de diamante */}
          <div
            className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-active:scale-95"
            style={{
              width: 100,
              height: 120,
              clipPath: 'polygon(50% 0%, 100% 35%, 75% 100%, 25% 100%, 0% 35%)',
              background: 'linear-gradient(160deg, #f0e6ff 0%, #b39ddb 25%, #7b1fa2 60%, #2d1b69 100%)',
              boxShadow: '0 0 30px #9c27b055, 0 0 60px #d4af3730',
            }}
          >
            <span
              className="text-3xl select-none"
              style={{
                filter: 'drop-shadow(0 0 8px #d4af37)',
                animation: animando ? 'none' : 'brilhar 3s ease-in-out infinite',
              }}
            >
              ✦
            </span>
          </div>
        </button>

        <p className="text-white/90 text-xs text-center">
          {animando
            ? 'O cristal está vibrando...'
            : tocado
            ? 'Toque novamente para uma nova mensagem'
            : 'Toque o cristal para receber sua mensagem'}
        </p>
      </div>

      {/* Mensagem revelada */}
      {frase && !animando && (
        <div
          className="glass-dourado rounded-2xl p-8 text-center space-y-4"
          style={{ animation: 'revelar 0.6s ease-out forwards' }}
        >
          {pergunta.trim() && (
            <p className="text-white/90 text-xs italic border-b border-white/5 pb-4">
              "{pergunta}"
            </p>
          )}

          <div className="space-y-2">
            <span className="text-dourado/85 text-2xl block">✦</span>
            <p className="font-serif text-dourado text-xl md:text-2xl leading-relaxed">
              {frase}
            </p>
            <span className="text-dourado/85 text-2xl block">✦</span>
          </div>

          <p className="text-white text-xs pt-2">
            Respire fundo. Deixe esta mensagem ressoar em você.
          </p>
        </div>
      )}

      {animando && (
        <div className="glass rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-dourado/60 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-dourado/60 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-dourado/60 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
    </div>
  )
}
