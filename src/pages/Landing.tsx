import { Link } from 'react-router-dom'
import FundoEtereo from '../components/FundoEtereo'

export default function Landing() {
  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#080414' }}>
      <FundoEtereo />

      <div className="relative z-10">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <span className="font-serif text-dourado text-2xl">✦ Oráculo Andara</span>
        <Link to="/login" className="text-white hover:text-white text-sm transition-colors">
          Entrar →
        </Link>
      </header>

      {/* Hero */}
      <section className="text-center px-6 py-20 max-w-3xl mx-auto">
        <p className="text-dourado/90 text-sm tracking-[0.3em] uppercase mb-4">Uma poderosa ferramenta de orientação</p>
        <h1 className="text-5xl md:text-6xl font-serif text-gradient leading-tight mb-6">
          Oráculo Andara
        </h1>
        <p className="text-white text-lg leading-relaxed mb-10 max-w-xl mx-auto">
          Conecte-se com a sabedoria das pedras Andara e encontre orientação, clareza e cura
          através das 84 cartas de frequência.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="#planos"
            className="bg-dourado hover:bg-dourado-claro text-mistico-fundo font-semibold px-8 py-4 rounded-2xl transition-all text-sm">
            Começar agora
          </a>
          <a href="#como-funciona"
            className="glass hover:bg-white/10 text-white px-8 py-4 rounded-2xl transition-all text-sm">
            Como funciona
          </a>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-serif text-center text-dourado mb-12">Como funciona</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: '01', titulo: 'Escolha sua tiragem', desc: 'Selecione 1 carta para uma mensagem direta ou 3 cartas para passado, presente e futuro.' },
            { n: '02', titulo: 'Revele as cartas', desc: 'Clique para revelar cada carta e receba a mensagem da Andara para você neste momento.' },
            { n: '03', titulo: 'Aja com intenção', desc: 'Cada carta traz uma ação prática para integrar a energia da Andara no seu dia.' },
          ].map(p => (
            <div key={p.n} className="glass rounded-2xl p-6 text-center">
              <span className="text-dourado/30 font-serif text-4xl">{p.n}</span>
              <h3 className="font-serif text-dourado mt-3 mb-2">{p.titulo}</h3>
              <p className="text-white text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-serif text-center text-dourado mb-4">Escolha seu plano</h2>
        <p className="text-center text-white text-sm mb-12">Acesso completo com pagamento mensal ou anual</p>
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">

          {/* Plano Básico */}
          <div className="glass rounded-2xl p-8 flex flex-col">
            <h3 className="font-serif text-white text-xl mb-1">Básico</h3>
            <p className="text-white text-sm mb-6">Para uso pessoal</p>
            <div className="text-4xl font-serif text-white mb-1">R$ --</div>
            <p className="text-white text-xs mb-6">/mês</p>
            <ul className="space-y-2 mb-8 flex-1">
              {['Tiragem de 1 carta', 'Tiragem de 3 cartas (PPF)', 'Mensagens e ações práticas', 'Acesso pelo app'].map(f => (
                <li key={f} className="flex items-center gap-2 text-white text-sm">
                  <span className="text-dourado">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link to="/login?plano=basico"
              className="block text-center border border-dourado/30 hover:border-dourado text-dourado py-3 rounded-xl text-sm transition-all">
              Assinar Básico
            </Link>
          </div>

          {/* Plano Pro */}
          <div className="glass-dourado rounded-2xl p-8 flex flex-col relative overflow-hidden">
            <div className="absolute top-4 right-4 text-xs bg-dourado text-mistico-fundo font-bold px-2 py-0.5 rounded-full">PRO</div>
            <h3 className="font-serif text-dourado text-xl mb-1">Profissional</h3>
            <p className="text-white text-sm mb-6">Para terapeutas e consultores</p>
            <div className="text-4xl font-serif text-dourado mb-1">R$ --</div>
            <p className="text-white text-xs mb-6">/mês</p>
            <ul className="space-y-2 mb-8 flex-1">
              {[
                'Tudo do plano Básico',
                'Tiragem de 5 e 7 cartas',
                'Gestão de clientes',
                'Relatórios editáveis',
                'Exportar em PDF',
              ].map(f => (
                <li key={f} className="flex items-center gap-2 text-white text-sm">
                  <span className="text-dourado">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link to="/login?plano=pro"
              className="block text-center bg-dourado hover:bg-dourado-claro text-mistico-fundo font-semibold py-3 rounded-xl text-sm transition-all">
              Assinar Pro
            </Link>
          </div>
        </div>
        <p className="text-center text-white text-xs mt-6">
          Assine anual e economize 2 meses · Cancele quando quiser
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8 text-center">
        <p className="font-serif text-dourado text-lg mb-1">✦ Oráculo Andara</p>
        <p className="text-white text-xs">© 2025 Clarisse Schultz · Todos os direitos reservados</p>
      </footer>
      </div>
    </div>
  )
}
