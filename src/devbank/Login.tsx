import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api, salvarToken } from './api.ts'
import { Estrutura, MensagemErro } from './Estrutura.tsx'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const recemCadastrado = (location.state as { cadastrado?: boolean } | null)?.cadastrado

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<unknown>(null)
  const [enviando, setEnviando] = useState(false)

  async function entrar(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      const { token } = await api.login(email, senha)
      salvarToken(token)
      navigate('/projetos/devbank/painel')
    } catch (err) {
      setErro(err)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Estrutura>
      <div className="caixa formulario-central">
        <h2>Entrar</h2>
        <p className="apoio">Acesse sua conta no banco digital.</p>

        {recemCadastrado && <div className="alerta sucesso" style={{ marginBottom: '1rem' }}>Cadastro feito! Agora é só entrar.</div>}

        <form onSubmit={entrar}>
          <label>
            E-mail
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <label>
            Senha
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required autoComplete="current-password" />
          </label>
          <MensagemErro erro={erro} />
          <button className="botao" disabled={enviando}>{enviando ? 'Entrando...' : 'Entrar'}</button>
        </form>

        <p className="trocar">
          Ainda não tem conta? <Link to="/projetos/devbank/cadastro">Cadastre-se</Link>
        </p>
      </div>
    </Estrutura>
  )
}
