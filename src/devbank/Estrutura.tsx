import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import ChuvaDourada from '../components/ChuvaDourada.tsx'
import { ErroApi } from './api.ts'

// Moldura comum de todas as telas do DevBank: fundo, logo e navegação
export function Estrutura({ children, acoes }: { children: ReactNode; acoes?: ReactNode }) {
  return (
    <>
      <ChuvaDourada intensidade={0.2} />
      <div className="pagina devbank camada">
        <header className="topo">
          <Link to="/projetos/devbank" className="logo-devbank ouro">DEV BANK</Link>
          <nav>
            <Link to="/projetos">← Projetos</Link>
            {acoes}
          </nav>
        </header>
        {children}
      </div>
    </>
  )
}

export function MensagemErro({ erro }: { erro: unknown }) {
  if (!erro) return null
  const e = erro instanceof ErroApi ? erro : new ErroApi(0, 'Erro inesperado')
  return (
    <div className="alerta" role="alert">
      {e.message}
      {e.erros.length > 0 && (
        <ul>{e.erros.map((m) => <li key={m}>{m}</li>)}</ul>
      )}
    </div>
  )
}
