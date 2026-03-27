export default function Ofertas() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-serif text-gradient mb-2">Ofertas Especiais</h1>
        <p className="text-cristal/40 text-sm">Novidades e experiências exclusivas</p>
      </div>

      <div className="glass-dourado rounded-2xl p-12 text-center">
        <div className="text-5xl mb-4">✨</div>
        <h2 className="font-serif text-dourado text-xl mb-3">Em breve</h2>
        <p className="text-cristal/50 text-sm">
          Novas ofertas e experiências estão sendo preparadas com muito cuidado e amor.
          Fique de olho aqui para não perder nenhuma novidade!
        </p>
      </div>
    </div>
  )
}
