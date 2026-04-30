import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import FundoEtereo from '../components/FundoEtereo'

export default function AppShell() {
  const { perfil, signOut, isPro } = useAuth()
  const navigate = useNavigate()
  const [menuAberto, setMenuAberto] = useState(false)

  async function handleSair() {
    await signOut()
    navigate('/')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
      isActive
        ? 'bg-dourado/10 text-dourado border border-dourado/20'
        : 'text-white hover:text-white hover:bg-white/5'
    }`

  return (
    <div className="min-h-screen bg-mistico-fundo flex flex-col"
      style={{ backgroundColor: '#080414' }}>

      <FundoEtereo />

      {/* Header */}
      <header className="glass border-b border-white/5 px-4 py-3 flex items-center justify-between sticky top-0 z-40 relative">
        <span className="font-serif text-dourado text-xl">✦ Oráculo Andara</span>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-1 flex-wrap">
          <NavLink to="/app/consulta" className={linkClass}>🔮 Consulta</NavLink>
          <NavLink to="/app/carta-do-dia" className={linkClass}>🃏 Carta do Dia</NavLink>
          <NavLink to="/app/portal" className={linkClass}>✦ Portal</NavLink>
          {isPro && <>
            <NavLink to="/app/conselho" className={linkClass}>💎 Conselho</NavLink>
            <NavLink to="/app/ritmo-lunar" className={linkClass}>🌕 Lunar</NavLink>
            <NavLink to="/app/sincronicidades" className={linkClass}>🔗 Sincroni.</NavLink>
            <NavLink to="/app/minhas-andaras" className={linkClass}>✨ Minhas</NavLink>
            <NavLink to="/app/clientes" className={linkClass}>👤 Clientes</NavLink>
            <NavLink to="/app/relatorios" className={linkClass}>📋 Relatórios</NavLink>
          </>}
          <NavLink to="/app/sobre" className={linkClass}>🌸 Sobre</NavLink>
          <NavLink to="/app/ofertas" className={linkClass}>✨ Ofertas</NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden md:block text-xs text-white">{perfil?.nome}</span>
          {isPro && <span className="hidden md:block text-xs bg-dourado/10 text-dourado border border-dourado/20 px-2 py-0.5 rounded-full">PRO</span>}
          <button onClick={handleSair} className="text-xs text-white/90 hover:text-white transition-colors hidden md:block">Sair</button>

          {/* Menu mobile */}
          <button onClick={() => setMenuAberto(v => !v)} className="md:hidden text-white hover:text-white p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuAberto ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </header>

      {/* Menu mobile dropdown */}
      {menuAberto && (
        <div className="md:hidden glass border-b border-white/5 px-4 py-3 flex flex-col gap-1 z-30">
          <NavLink to="/app/consulta" className={linkClass} onClick={() => setMenuAberto(false)}>🔮 Consulta</NavLink>
          <NavLink to="/app/carta-do-dia" className={linkClass} onClick={() => setMenuAberto(false)}>🃏 Carta do Dia</NavLink>
          <NavLink to="/app/portal" className={linkClass} onClick={() => setMenuAberto(false)}>✦ Portal de Mensagens</NavLink>
          {isPro && <>
            <NavLink to="/app/conselho" className={linkClass} onClick={() => setMenuAberto(false)}>💎 Conselho das Andaras</NavLink>
            <NavLink to="/app/ritmo-lunar" className={linkClass} onClick={() => setMenuAberto(false)}>🌕 Ritmo Lunar</NavLink>
            <NavLink to="/app/sincronicidades" className={linkClass} onClick={() => setMenuAberto(false)}>🔗 Sincronicidades</NavLink>
            <NavLink to="/app/minhas-andaras" className={linkClass} onClick={() => setMenuAberto(false)}>✨ Minhas Andaras</NavLink>
            <NavLink to="/app/clientes" className={linkClass} onClick={() => setMenuAberto(false)}>👤 Clientes</NavLink>
            <NavLink to="/app/relatorios" className={linkClass} onClick={() => setMenuAberto(false)}>📋 Relatórios</NavLink>
          </>}
          <NavLink to="/app/sobre" className={linkClass} onClick={() => setMenuAberto(false)}>🌸 Sobre</NavLink>
          <NavLink to="/app/ofertas" className={linkClass} onClick={() => setMenuAberto(false)}>✨ Ofertas</NavLink>
          <button onClick={handleSair} className="text-left text-sm text-white/90 hover:text-white px-3 py-2">Sair</button>
        </div>
      )}

      {/* Conteúdo */}
      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full relative z-10">
        <Outlet />
      </main>
    </div>
  )
}
