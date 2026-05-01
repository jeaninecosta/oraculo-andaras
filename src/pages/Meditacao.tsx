import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

type Elem = 'Água' | 'Fogo' | 'Terra' | 'Ar' | 'Éter'
type FaseResp = 'inalar' | 'segurar' | 'exalar'

const CFG: Record<Elem, { emoji: string; cor: string; base: number; beat: number; onda: string; intencao: string }> = {
  Água:  { emoji: '💧', cor: '#4FC3F7', base: 432, beat: 4,  onda: 'Theta · 4 Hz',  intencao: 'Permita-se sentir. Abra-se para a cura emocional e a renovação das suas águas internas.' },
  Fogo:  { emoji: '🔥', cor: '#FF7043', base: 396, beat: 10, onda: 'Alpha · 10 Hz', intencao: 'Acenda sua chama interior. Conecte-se com sua coragem, paixão e poder de transformação.' },
  Terra: { emoji: '🌿', cor: '#66BB6A', base: 174, beat: 2,  onda: 'Delta · 2 Hz',  intencao: 'Enraize-se. Sinta o chão sob seus pés e a solidez da Terra te sustentando.' },
  Ar:    { emoji: '💨', cor: '#B39DDB', base: 528, beat: 8,  onda: 'Alpha · 8 Hz',  intencao: 'Expanda sua mente. Deixe o Ar trazer clareza, leveza e novas perspectivas.' },
  Éter:  { emoji: '✨', cor: '#CE93D8', base: 963, beat: 6,  onda: 'Theta · 6 Hz',  intencao: 'Eleve sua consciência. Conecte-se com as dimensões sutis e a sabedoria do cosmos.' },
}

function criarAudio(elemento: Elem): () => void {
  const ctx = new AudioContext()
  const cfg = CFG[elemento]
  const master = ctx.createGain()
  master.gain.value = 0
  master.connect(ctx.destination)
  master.gain.setTargetAtTime(0.85, ctx.currentTime, 1.5)

  const toStop: (OscillatorNode | AudioBufferSourceNode)[] = []

  // ── Binaural ─────────────────────────────────────────────────
  const binGain = ctx.createGain()
  binGain.gain.value = 0.16
  binGain.connect(master)

  const oscL = ctx.createOscillator()
  oscL.frequency.value = cfg.base
  oscL.type = 'sine'
  const panL = ctx.createStereoPanner()
  panL.pan.value = -1
  oscL.connect(panL).connect(binGain)
  oscL.start()
  toStop.push(oscL)

  const oscR = ctx.createOscillator()
  oscR.frequency.value = cfg.base + cfg.beat
  oscR.type = 'sine'
  const panR = ctx.createStereoPanner()
  panR.pan.value = 1
  oscR.connect(panR).connect(binGain)
  oscR.start()
  toStop.push(oscR)

  // ── Buffers de ruído ─────────────────────────────────────────
  const bufSize = ctx.sampleRate * 4
  const wBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate)
  const bBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate)
  const wData = wBuf.getChannelData(0)
  const bData = bBuf.getChannelData(0)
  let last = 0
  for (let i = 0; i < bufSize; i++) {
    wData[i] = Math.random() * 2 - 1
    const w = Math.random() * 2 - 1
    bData[i] = (last + 0.02 * w) / 1.02
    last = bData[i]
    bData[i] *= 3.5
  }

  function noise(buf: AudioBuffer): AudioBufferSourceNode {
    const s = ctx.createBufferSource()
    s.buffer = buf; s.loop = true
    return s
  }

  function lfo(freq: number, depth: number, target: AudioParam): OscillatorNode {
    const o = ctx.createOscillator()
    o.frequency.value = freq
    const g = ctx.createGain()
    g.gain.value = depth
    o.connect(g).connect(target)
    o.start()
    toStop.push(o)
    return o
  }

  // ── Ambient por elemento ──────────────────────────────────────
  if (elemento === 'Água') {
    const ag = ctx.createGain(); ag.gain.value = 0.38; ag.connect(master)
    const n1 = noise(wBuf)
    const bp1 = ctx.createBiquadFilter(); bp1.type = 'bandpass'; bp1.frequency.value = 1400; bp1.Q.value = 0.8
    n1.connect(bp1).connect(ag); n1.start(); toStop.push(n1)
    const n2 = noise(wBuf)
    const bp2 = ctx.createBiquadFilter(); bp2.type = 'bandpass'; bp2.frequency.value = 3500; bp2.Q.value = 0.6
    const g2 = ctx.createGain(); g2.gain.value = 0.55
    n2.connect(bp2).connect(g2).connect(ag); n2.start(); toStop.push(n2)
    const n3 = noise(bBuf)
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 180
    const g3 = ctx.createGain(); g3.gain.value = 0.3
    n3.connect(lp).connect(g3).connect(ag); n3.start(); toStop.push(n3)
    lfo(0.22, 0.07, ag.gain)

  } else if (elemento === 'Fogo') {
    const ag = ctx.createGain(); ag.gain.value = 0.45; ag.connect(master)
    const n1 = noise(bBuf)
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500
    n1.connect(lp).connect(ag); n1.start(); toStop.push(n1)
    lfo(0.4, 240, lp.frequency)
    lfo(5.5, 0.055, ag.gain)
    const n2 = noise(wBuf)
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 2
    const gc = ctx.createGain(); gc.gain.value = 0.07
    n2.connect(bp).connect(gc).connect(ag); n2.start(); toStop.push(n2)

  } else if (elemento === 'Terra') {
    const ag = ctx.createGain(); ag.gain.value = 0.55; ag.connect(master)
    const n = noise(bBuf)
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 110
    n.connect(lp).connect(ag); n.start(); toStop.push(n)
    const o = ctx.createOscillator(); o.frequency.value = 174; o.type = 'sine'
    const og = ctx.createGain(); og.gain.value = 0.055
    o.connect(og).connect(ag); o.start(); toStop.push(o)
    lfo(0.08, 0.09, ag.gain)

  } else if (elemento === 'Ar') {
    const ag = ctx.createGain(); ag.gain.value = 0.3; ag.connect(master)
    const n1 = noise(wBuf)
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2200
    n1.connect(hp).connect(ag); n1.start(); toStop.push(n1)
    lfo(0.18, 0.11, ag.gain)
    const n2 = noise(wBuf)
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 850; bp.Q.value = 3
    const gw = ctx.createGain(); gw.gain.value = 0.11
    n2.connect(bp).connect(gw).connect(ag); n2.start(); toStop.push(n2)
    lfo(0.13, 0.07, gw.gain)

  } else { // Éter
    const ag = ctx.createGain(); ag.gain.value = 0.5; ag.connect(master)
    ;[cfg.base / 2, cfg.base, cfg.base * 1.5, 528].forEach((f, i) => {
      const o = ctx.createOscillator(); o.frequency.value = f; o.type = 'sine'
      const og = ctx.createGain(); og.gain.value = [0.11, 0.08, 0.045, 0.055][i]
      o.connect(og).connect(ag); o.start(); toStop.push(o)
      lfo(0.05 + i * 0.018, og.gain.value * 0.45, og.gain)
    })
    const n = noise(wBuf)
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 6500
    const gs = ctx.createGain(); gs.gain.value = 0.038
    n.connect(hp).connect(gs).connect(ag); n.start(); toStop.push(n)
  }

  return () => {
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.8)
    setTimeout(() => {
      toStop.forEach(n => { try { n.stop() } catch { /* já parado */ } })
      ctx.close()
    }, 2000)
  }
}

function TelaUpgrade() {
  return (
    <div className="space-y-6 max-w-md mx-auto text-center py-10">
      <div className="glass-dourado rounded-3xl p-10 space-y-4">
        <div className="text-5xl">🎵</div>
        <h2 className="font-serif text-dourado text-2xl">Meditação Binaural</h2>
        <p className="text-white text-sm leading-relaxed">
          Frequências binaurais e sons ambient gerados em tempo real para cada elemento Andara. Induz estados meditativos profundos.
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

export default function Meditacao() {
  const { isPro } = useAuth()
  const [elem, setElem] = useState<Elem>('Água')
  const [durMin, setDurMin] = useState(10)
  const [tocando, setTocando] = useState(false)
  const [tempo, setTempo] = useState(0)
  const [faseResp, setFaseResp] = useState<FaseResp>('inalar')
  const pararAudioRef = useRef<(() => void) | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const respRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function limparTimers() {
    if (timerRef.current) clearInterval(timerRef.current)
    if (respRef.current) clearTimeout(respRef.current)
  }

  function cicloRespiracao() {
    setFaseResp('inalar')
    respRef.current = setTimeout(() => {
      setFaseResp('segurar')
      respRef.current = setTimeout(() => {
        setFaseResp('exalar')
        respRef.current = setTimeout(cicloRespiracao, 6000)
      }, 4000)
    }, 4000)
  }

  function iniciar() {
    pararAudioRef.current?.()
    pararAudioRef.current = criarAudio(elem)
    const total = durMin * 60
    setTempo(total)
    setTocando(true)
    cicloRespiracao()
    timerRef.current = setInterval(() => {
      setTempo(prev => {
        if (prev <= 1) { encerrar(); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  function encerrar() {
    pararAudioRef.current?.()
    pararAudioRef.current = null
    limparTimers()
    setTocando(false)
    setTempo(0)
  }

  useEffect(() => () => { pararAudioRef.current?.(); limparTimers() }, [])

  if (!isPro) return <TelaUpgrade />

  const cfg = CFG[elem]
  const total = durMin * 60
  const progresso = tempo > 0 ? ((total - tempo) / total) * 100 : 0
  const mm = String(Math.floor(tempo / 60)).padStart(2, '0')
  const ss = String(tempo % 60).padStart(2, '0')

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-serif text-gradient mb-2">Meditação Binaural</h1>
        <p className="text-white text-sm">Frequências geradas em tempo real para cada elemento Andara</p>
      </div>

      {/* Aviso fones */}
      <div className="flex items-center gap-3 glass rounded-xl px-4 py-3">
        <span className="text-2xl">🎧</span>
        <p className="text-white text-xs leading-relaxed">
          Use <strong>fones de ouvido</strong> para o efeito binaural completo — o cérebro precisa receber uma frequência diferente em cada ouvido.
        </p>
      </div>

      {/* Seletor de elemento */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <p className="text-xs text-dourado/90 uppercase tracking-widest">Elemento</p>
        <div className="grid grid-cols-5 gap-2">
          {(Object.keys(CFG) as Elem[]).map(e => (
            <button
              key={e}
              onClick={() => { if (!tocando) setElem(e) }}
              disabled={tocando}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all text-xs ${
                elem === e
                  ? 'border-dourado/40 bg-dourado/10 text-dourado'
                  : 'border-white/10 text-white hover:border-white/20 disabled:opacity-50'
              }`}
            >
              <span className="text-xl">{CFG[e].emoji}</span>
              <span>{e}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Duração + frequência */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-dourado/90 uppercase tracking-widest">Duração</p>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white">{cfg.onda}</span>
        </div>
        <div className="flex gap-2">
          {[5, 10, 20].map(d => (
            <button
              key={d}
              onClick={() => { if (!tocando) setDurMin(d) }}
              disabled={tocando}
              className={`flex-1 py-2 rounded-xl border text-sm transition-all ${
                durMin === d
                  ? 'border-dourado/40 bg-dourado/10 text-dourado'
                  : 'border-white/10 text-white hover:border-white/20 disabled:opacity-50'
              }`}
            >
              {d} min
            </button>
          ))}
        </div>
      </div>

      {/* Player principal */}
      <div
        className="glass-dourado rounded-3xl p-8 text-center space-y-6"
        style={{ borderColor: cfg.cor + '55' }}
      >
        {/* Ondas animadas */}
        {tocando && (
          <div className="flex items-end justify-center gap-1.5 h-14">
            {Array.from({ length: 14 }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full"
                style={{
                  backgroundColor: cfg.cor,
                  height: '100%',
                  transformOrigin: 'bottom',
                  animation: `ondaBinaural ${0.55 + (i % 5) * 0.12}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.06}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Timer */}
        {tocando && (
          <p className="font-serif text-5xl" style={{ color: cfg.cor }}>{mm}:{ss}</p>
        )}

        {/* Barra de progresso */}
        {tocando && (
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${progresso}%`, backgroundColor: cfg.cor }}
            />
          </div>
        )}

        {/* Guia de respiração */}
        {tocando && (
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-20 h-20 rounded-full border-2 flex items-center justify-center"
              style={{
                borderColor: cfg.cor,
                backgroundColor: cfg.cor + '20',
                transform: faseResp === 'exalar' ? 'scale(0.75)' : 'scale(1.25)',
                transition: faseResp === 'inalar'
                  ? 'transform 4s ease-in-out'
                  : faseResp === 'exalar'
                  ? 'transform 6s ease-in-out'
                  : 'transform 0.1s',
              }}
            >
              <span className="text-2xl">{cfg.emoji}</span>
            </div>
            <p className="text-white text-sm">
              {faseResp === 'inalar' ? 'Inspire...' : faseResp === 'segurar' ? 'Segure...' : 'Expire lentamente...'}
            </p>
          </div>
        )}

        {/* Intenção (só quando parado) */}
        {!tocando && (
          <div className="space-y-3">
            <span className="text-3xl">{cfg.emoji}</span>
            <p className="text-white text-sm leading-relaxed">{cfg.intencao}</p>
          </div>
        )}

        {/* Botão */}
        <button
          onClick={tocando ? encerrar : iniciar}
          className="w-full py-3 rounded-2xl border font-medium transition-all text-sm"
          style={{ borderColor: cfg.cor + '60', backgroundColor: cfg.cor + '18', color: cfg.cor }}
        >
          {tocando ? '⏹ Encerrar meditação' : `${cfg.emoji} Iniciar meditação`}
        </button>
      </div>

      {/* Como funciona */}
      <div className="glass rounded-2xl p-5 space-y-3">
        <p className="text-xs text-dourado/90 uppercase tracking-widest">Como funciona</p>
        <p className="text-white text-xs leading-relaxed">
          O áudio binaural envia <strong style={{ color: cfg.cor }}>{cfg.base} Hz</strong> para o ouvido esquerdo e{' '}
          <strong style={{ color: cfg.cor }}>{cfg.base + cfg.beat} Hz</strong> para o direito. Seu cérebro percebe a diferença de{' '}
          <strong style={{ color: cfg.cor }}>{cfg.beat} Hz</strong> ({cfg.onda}) e sincroniza com essa frequência naturalmente.
        </p>
        <p className="text-white/80 text-xs leading-relaxed">
          Misturado ao som ambient do elemento para tornar a experiência mais imersiva. Sente-se confortavelmente, feche os olhos e siga o guia de respiração.
        </p>
      </div>
    </div>
  )
}
