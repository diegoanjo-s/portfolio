import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from './api.ts'
import { Estrutura, MensagemErro } from './Estrutura.tsx'

export default function Cadastro() {
  const navigate = useNavigate()
  const [dados, setDados] = useState({ nome: '', cpf: '', email: '', senha: '' })
  const [erro, setErro] = useState<unknown>(null)
  const [enviando, setEnviando] = useState(false)

  const mudar = (campo: keyof typeof dados) => (e: { target: { value: string } }) =>
    setDados({ ...dados, [campo]: e.target.value })

  async function cadastrar(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      // A API espera o CPF só com números
      await api.cadastrar({ ...dados, cpf: dados.cpf.replace(/\D/g, '') })
      navigate('/projetos/devbank/login', { state: { cadastrado: true } })
    } catch (err) {
      setErro(err)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Estrutura>
      <div className="caixa formulario-central">
        <h2>Criar cadastro</h2>
        <p className="apoio">Banco fictício: use um CPF válido de teste (gere um em geradordecpf.org).</p>

        <form onSubmit={cadastrar}>
          <label>
            Nome
            <input value={dados.nome} onChange={mudar('nome')} required maxLength={100} autoComplete="name" />
          </label>
          <label>
            CPF
            <input value={dados.cpf} onChange={mudar('cpf')} required inputMode="numeric" placeholder="000.000.000-00" />
          </label>
          <label>
            E-mail
            <input type="email" value={dados.email} onChange={mudar('email')} required autoComplete="email" />
          </label>
          <label>
            Senha (mínimo 8 caracteres)
            <input type="password" value={dados.senha} onChange={mudar('senha')} required minLength={8} maxLength={72} autoComplete="new-password" />
          </label>
          <MensagemErro erro={erro} />
          <button className="botao" disabled={enviando}>{enviando ? 'Cadastrando...' : 'Cadastrar'}</button>
        </form>

        <p className="trocar">
          Já tem conta? <Link to="/projetos/devbank/login">Entrar</Link>
        </p>
      </div>
    </Estrutura>
  )
}
