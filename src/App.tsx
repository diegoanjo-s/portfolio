import { Navigate, Route, Routes } from 'react-router-dom'
import Intro from './pages/Intro.tsx'
import Projetos from './pages/Projetos.tsx'
import Login from './devbank/Login.tsx'
import Cadastro from './devbank/Cadastro.tsx'
import Painel from './devbank/Painel.tsx'
import { estaLogado } from './devbank/api.ts'

function DevBankInicio() {
  return <Navigate to={estaLogado() ? '/projetos/devbank/painel' : '/projetos/devbank/login'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Intro />} />
      <Route path="/projetos" element={<Projetos />} />
      <Route path="/projetos/devbank" element={<DevBankInicio />} />
      <Route path="/projetos/devbank/login" element={<Login />} />
      <Route path="/projetos/devbank/cadastro" element={<Cadastro />} />
      <Route path="/projetos/devbank/painel" element={<Painel />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
