import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import AppShell from './pages/AppShell'
import Consulta from './pages/Consulta'
import Clientes from './pages/Clientes'
import Relatorios from './pages/Relatorios'
import Sobre from './pages/Sobre'
import Ofertas from './pages/Ofertas'
import CartaDia from './pages/CartaDia'
import Portal from './pages/Portal'
import ConselhoDasAndaras from './pages/ConselhoDasAndaras'
import Sincronicidades from './pages/Sincronicidades'
import RitmoLunar from './pages/RitmoLunar'
import MinhasAndaras from './pages/MinhasAndaras'
import FundoEtereo from './components/FundoEtereo'

function RotaProtegida({ children }: { children: React.ReactNode }) {
  const { user, loading, perfil } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-mistico-fundo flex items-center justify-center" style={{ backgroundColor: '#080414' }}>
      <FundoEtereo />
      <div className="relative z-10 w-8 h-8 border-2 border-dourado border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (perfil && !perfil.ativo) return <Navigate to="/aguardando" replace />
  return <>{children}</>
}

function RotaPro({ children }: { children: React.ReactNode }) {
  const { isPro } = useAuth()
  if (!isPro) return <Navigate to="/app/consulta" replace />
  return <>{children}</>
}

function AguardandoPagamento() {
  const { signOut } = useAuth()
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#080414' }}>
      <FundoEtereo />
      <div className="relative z-10 glass rounded-2xl p-8 max-w-md text-center">
        <div className="text-4xl mb-4">✨</div>
        <h2 className="text-2xl font-serif text-dourado mb-3">Aguardando ativação</h2>
        <p className="text-white mb-6">
          Seu pagamento está sendo processado. Você receberá um e-mail assim que seu acesso for liberado.
        </p>
        <button onClick={signOut} className="text-dourado/90 hover:text-dourado text-sm underline">
          Sair
        </button>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/aguardando" element={<AguardandoPagamento />} />
          <Route path="/app" element={<RotaProtegida><AppShell /></RotaProtegida>}>
            <Route index element={<Navigate to="/app/consulta" replace />} />
            <Route path="consulta" element={<Consulta />} />
            <Route path="carta-do-dia" element={<CartaDia />} />
            <Route path="portal" element={<Portal />} />
            <Route path="conselho" element={<ConselhoDasAndaras />} />
            <Route path="sincronicidades" element={<Sincronicidades />} />
            <Route path="ritmo-lunar" element={<RitmoLunar />} />
            <Route path="minhas-andaras" element={<MinhasAndaras />} />
            <Route path="clientes" element={<RotaPro><Clientes /></RotaPro>} />
            <Route path="relatorios" element={<RotaPro><Relatorios /></RotaPro>} />
            <Route path="sobre" element={<Sobre />} />
            <Route path="ofertas" element={<Ofertas />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
