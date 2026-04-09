const ESTRELAS = [
  { x: 5,  y: 12, d: 0.0, s: 1   }, { x: 14, y: 38, d: 1.2, s: 1.5 },
  { x: 27, y: 7,  d: 0.7, s: 1   }, { x: 42, y: 22, d: 2.1, s: 2   },
  { x: 55, y: 48, d: 0.3, s: 1   }, { x: 67, y: 10, d: 1.8, s: 1.5 },
  { x: 79, y: 35, d: 0.9, s: 1   }, { x: 90, y: 23, d: 1.5, s: 2   },
  { x: 94, y: 58, d: 0.4, s: 1   }, { x: 35, y: 68, d: 2.3, s: 1.5 },
  { x: 48, y: 80, d: 1.1, s: 1   }, { x: 63, y: 72, d: 0.6, s: 2   },
  { x: 76, y: 85, d: 1.9, s: 1   }, { x: 18, y: 88, d: 0.2, s: 1.5 },
  { x: 8,  y: 62, d: 2.7, s: 1   }, { x: 83, y: 67, d: 1.4, s: 1   },
  { x: 50, y: 14, d: 0.8, s: 1.5 }, { x: 38, y: 93, d: 2.0, s: 1   },
  { x: 71, y: 52, d: 1.6, s: 2   }, { x: 23, y: 52, d: 0.5, s: 1   },
  { x: 60, y: 30, d: 3.0, s: 1   }, { x: 88, y: 42, d: 2.5, s: 1.5 },
  { x: 32, y: 20, d: 1.3, s: 1   }, { x: 12, y: 75, d: 0.9, s: 2   },
]

export default function FundoEtereo() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
      <div className="fundo-nebula" />
      <div className="fundo-borda-topo" />
      <div className="fundo-borda-base" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
      <div className="orb orb-5" />
      <div className="orb orb-6" />
      <div className="orb orb-7" />
      {ESTRELAS.map((e, i) => (
        <div key={i} className="absolute rounded-full bg-white animate-cintillar"
          style={{
            left: `${e.x}%`, top: `${e.y}%`,
            width: `${e.s}px`, height: `${e.s}px`,
            animationDelay: `${e.d}s`,
            animationDuration: `${2.5 + e.d}s`,
          }} />
      ))}
    </div>
  )
}
