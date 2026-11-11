import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  api, ehEntrada, estaLogado, formatarDataHora, formatarMoeda, idDoClienteLogado, NOMES_TIPO, sair,
} from './api.ts'
import type { Cliente, Conta, Extrato } from './api.ts'
import { Estrutura, MensagemErro } from './Estrutura.tsx'

type Operacao = 'deposito' | 'saque' | 'transferencia'

export default function Painel() {
  const navigate = useNavigate()
  const logado = estaLogado()

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [contas, setContas] = useState<Conta[] | null>(null)
  const [erro, setErro] = useState<unknown>(null)

  const conta = contas?.find((c) => c.status === 'ATIVA') ?? contas?.[0] ?? null

  const carregar = useCallback(async () => {
    try {
      const [c, cs] = await Promise.all([api.buscarCliente(idDoClienteLogado()), api.minhasContas()])
      setCliente(c)
      setContas(cs)
    } catch (err) {
      setErro(err)
    }
  }, [])

  useEffect(() => {
    if (logado) carregar()
  }, [logado, carregar])

  if (!logado) return <Navigate to="/projetos/devbank/login" replace />

  function deslogar() {
    sair()
    navigate('/projetos/devbank/login')
  }

  const botaoSair = (
    <a href="#" onClick={(e) => { e.preventDefault(); deslogar() }}>Sair</a>
  )

  if (!contas || !cliente) {
    return (
      <Estrutura acoes={botaoSair}>
        {erro ? <MensagemErro erro={erro} /> : <p className="carregando">Carregando o cofre...</p>}
      </Estrutura>
    )
  }

  return (
    <Estrutura acoes={botaoSair}>
      <div className="saudacao">
        <h2>Olá, <strong>{cliente.nome.split(' ')[0]}</strong></h2>
        <span style={{ color: 'var(--texto-suave)', fontSize: '0.85rem' }}>{cliente.email} · CPF {cliente.cpf}</span>
      </div>

      {conta?.status === 'ATIVA' ? (
        <ContaAtiva conta={conta} aoMudar={carregar} />
      ) : (
        <SemContaAtiva clienteId={cliente.id} contaEncerrada={conta} aoAbrir={carregar} />
      )}
    </Estrutura>
  )
}

// ------------------------------------------------------------
function SemContaAtiva({ clienteId, contaEncerrada, aoAbrir }: { clienteId: number; contaEncerrada: Conta | null; aoAbrir: () => void }) {
  const [erro, setErro] = useState<unknown>(null)
  const [enviando, setEnviando] = useState(false)

  async function abrir() {
    setEnviando(true)
    setErro(null)
    try {
      await api.abrirConta(clienteId)
      aoAbrir()
    } catch (err) {
      setErro(err)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="cartao-conta" style={{ textAlign: 'center' }}>
      <p className="rotulo-pequeno">{contaEncerrada ? `Conta ${contaEncerrada.numero} encerrada` : 'Você ainda não tem conta'}</p>
      <p className="saldo ouro">Abra sua conta</p>
      <p style={{ color: 'var(--texto-suave)', marginTop: 0 }}>Toda conta nova já começa com um saldo de boas-vindas para você testar.</p>
      <MensagemErro erro={erro} />
      <button className="botao" onClick={abrir} disabled={enviando} style={{ marginTop: '1rem' }}>
        {enviando ? 'Abrindo...' : 'Abrir conta'}
      </button>
    </div>
  )
}

// ------------------------------------------------------------
function ContaAtiva({ conta, aoMudar }: { conta: Conta; aoMudar: () => void }) {
  const [versao, setVersao] = useState(0) // muda a cada operação, para recarregar o extrato
  const [erroEncerrar, setErroEncerrar] = useState<unknown>(null)

  function depoisDaOperacao() {
    aoMudar()
    setVersao((v) => v + 1)
  }

  async function encerrar() {
    if (!confirm('Encerrar a conta? Ela precisa estar com saldo zero.')) return
    setErroEncerrar(null)
    try {
      await api.encerrarConta(conta.id)
      aoMudar()
    } catch (err) {
      setErroEncerrar(err)
    }
  }

  return (
    <>
      <div className="cartao-conta">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="rotulo-pequeno">Saldo disponível</span>
          <span className={`status ${conta.status}`}>{conta.status}</span>
        </div>
        <p className="saldo ouro">{formatarMoeda(conta.saldo)}</p>
        <div className="dados">
          <div><span>Conta</span>{conta.numero}</div>
          <div><span>ID para receber transferências</span>{conta.id}</div>
          <div><span>Aberta em</span>{formatarDataHora(conta.dataAbertura)}</div>
        </div>
      </div>

      <Operacoes conta={conta} aoConcluir={depoisDaOperacao} />
      <ExtratoConta contaId={conta.id} versao={versao} />

      <section className="secao">
        <MensagemErro erro={erroEncerrar} />
        <button className="botao perigo" onClick={encerrar} style={{ marginTop: '0.8rem' }}>Encerrar conta</button>
      </section>
    </>
  )
}

// ------------------------------------------------------------
function Operacoes({ conta, aoConcluir }: { conta: Conta; aoConcluir: () => void }) {
  const [aba, setAba] = useState<Operacao>('deposito')
  const [valor, setValor] = useState('')
  const [destino, setDestino] = useState('')
  const [erro, setErro] = useState<unknown>(null)
  const [sucesso, setSucesso] = useState('')
  const [enviando, setEnviando] = useState(false)

  function trocarAba(nova: Operacao) {
    setAba(nova)
    setErro(null)
    setSucesso('')
  }

  async function executar(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    setSucesso('')
    setEnviando(true)
    const v = Number(valor.replace(',', '.'))
    try {
      if (aba === 'deposito') await api.depositar(conta.id, v)
      if (aba === 'saque') await api.sacar(conta.id, v)
      if (aba === 'transferencia') await api.transferir(conta.id, Number(destino), v)

      const nomes = { deposito: 'depósito', saque: 'saque', transferencia: 'transferência' }
      setSucesso(`Operação concluída: ${nomes[aba]} de ${formatarMoeda(v)}.`)
      setValor('')
      setDestino('')
      aoConcluir()
    } catch (err) {
      setErro(err)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="secao caixa">
      <h3 style={{ fontFamily: 'Cinzel, serif', color: 'var(--ouro-claro)', margin: '0 0 1rem' }}>Operações</h3>
      <div className="abas" role="tablist">
        <button className={`aba ${aba === 'deposito' ? 'ativa' : ''}`} onClick={() => trocarAba('deposito')}>Depósito</button>
        <button className={`aba ${aba === 'saque' ? 'ativa' : ''}`} onClick={() => trocarAba('saque')}>Saque</button>
        <button className={`aba ${aba === 'transferencia' ? 'ativa' : ''}`} onClick={() => trocarAba('transferencia')}>Transferência</button>
      </div>

      <form onSubmit={executar}>
        <div className="linha-form">
          {aba === 'transferencia' && (
            <label>
              ID da conta de destino
              <input value={destino} onChange={(e) => setDestino(e.target.value)} required inputMode="numeric" placeholder="ex.: 2" />
            </label>
          )}
          <label>
            Valor (R$)
            <input value={valor} onChange={(e) => setValor(e.target.value)} required inputMode="decimal" placeholder="0,00" />
          </label>
          <button className="botao" disabled={enviando}>{enviando ? 'Enviando...' : 'Confirmar'}</button>
        </div>
        <MensagemErro erro={erro} />
        {sucesso && <div className="alerta sucesso">{sucesso}</div>}
      </form>
    </section>
  )
}

// ------------------------------------------------------------
function ExtratoConta({ contaId, versao }: { contaId: number; versao: number }) {
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const [filtro, setFiltro] = useState<{ inicio?: string; fim?: string }>({})
  const [pagina, setPagina] = useState(0)
  const [extrato, setExtrato] = useState<Extrato | null>(null)
  const [erro, setErro] = useState<unknown>(null)

  useEffect(() => {
    setErro(null)
    api.extrato(contaId, { ...filtro, pagina }).then(setExtrato).catch(setErro)
  }, [contaId, filtro, pagina, versao])

  function filtrar(e: FormEvent) {
    e.preventDefault()
    setPagina(0)
    setFiltro({ inicio: inicio || undefined, fim: fim || undefined })
  }

  return (
    <section className="secao caixa">
      <h3 style={{ fontFamily: 'Cinzel, serif', color: 'var(--ouro-claro)', margin: '0 0 1rem' }}>Extrato</h3>

      <form className="extrato-filtros" onSubmit={filtrar}>
        <label>De<input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} /></label>
        <label>Até<input type="date" value={fim} onChange={(e) => setFim(e.target.value)} /></label>
        <button className="botao secundario">Filtrar</button>
      </form>
      <p style={{ color: 'var(--texto-suave)', fontSize: '0.8rem', marginTop: 0 }}>Sem datas, mostra os últimos 30 dias.</p>

      <MensagemErro erro={erro} />

      {extrato && extrato.transacoes.length === 0 && <p className="vazio">Nenhuma movimentação no período.</p>}

      {extrato && extrato.transacoes.length > 0 && (
        <>
          <ul className="lista-transacoes">
            {extrato.transacoes.map((t) => (
              <li key={t.id}>
                <div>
                  <div className="tipo">{NOMES_TIPO[t.tipo]}</div>
                  <div className="data">{formatarDataHora(t.dataHora)}</div>
                </div>
                <span className={`valor ${ehEntrada(t.tipo) ? 'entrada' : 'saida'}`}>
                  {ehEntrada(t.tipo) ? '+' : '−'} {formatarMoeda(t.valor)}
                </span>
              </li>
            ))}
          </ul>
          <div className="paginacao">
            <button className="botao secundario" disabled={pagina === 0} onClick={() => setPagina(pagina - 1)}>← Anterior</button>
            <span>Página {extrato.pagina + 1} de {Math.max(extrato.totalPaginas, 1)} · {extrato.totalTransacoes} movimentações</span>
            <button className="botao secundario" disabled={pagina + 1 >= extrato.totalPaginas} onClick={() => setPagina(pagina + 1)}>Próxima →</button>
          </div>
        </>
      )}
    </section>
  )
}
