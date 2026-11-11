// ============================================================
//  Comunicação com a API do DevBank (Java + Spring Boot)
// ============================================================

const API_URL = import.meta.env.VITE_DEVBANK_API_URL ?? 'http://localhost:8080'
const CHAVE_TOKEN = 'devbank.token'

// ---------- Tipos (espelham os DTOs do Java) ----------
export type Cliente = { id: number; nome: string; cpf: string; email: string; dataCadastro: string }

export type Conta = {
  id: number
  numero: string
  saldo: number
  status: 'ATIVA' | 'ENCERRADA'
  clienteId: number
  clienteNome: string
  dataAbertura: string
}

export type Transacao = {
  id: number
  tipo: 'DEPOSITO' | 'SAQUE' | 'TRANSFERENCIA_ENVIADA' | 'TRANSFERENCIA_RECEBIDA'
  valor: number
  dataHora: string
}

export type Extrato = {
  numeroConta: string
  saldoAtual: number
  transacoes: Transacao[]
  pagina: number
  totalPaginas: number
  totalTransacoes: number
}

export class ErroApi extends Error {
  status: number
  erros: string[]

  constructor(status: number, mensagem: string, erros: string[] = []) {
    super(mensagem)
    this.status = status
    this.erros = erros
  }
}

// ---------- Token ----------
export function salvarToken(token: string) {
  try { localStorage.setItem(CHAVE_TOKEN, token) } catch { /* navegador sem storage */ }
}

export function sair() {
  try { localStorage.removeItem(CHAVE_TOKEN) } catch { /* ignora */ }
}

function lerToken(): string | null {
  try { return localStorage.getItem(CHAVE_TOKEN) } catch { return null }
}

// O JWT tem 3 partes: cabeçalho.dados.assinatura. Os "dados" trazem o id do cliente (sub) e a validade (exp)
function dadosDoToken(): { sub: string; exp: number } | null {
  const token = lerToken()
  if (!token) return null
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

export function estaLogado(): boolean {
  const dados = dadosDoToken()
  return !!dados && dados.exp * 1000 > Date.now()
}

export function idDoClienteLogado(): number {
  return Number(dadosDoToken()?.sub)
}

// ---------- Requisição genérica ----------
async function requisitar<T>(caminho: string, opcoes: { metodo?: string; corpo?: unknown } = {}): Promise<T> {
  const token = lerToken()
  let resposta: Response
  try {
    resposta = await fetch(API_URL + caminho, {
      method: opcoes.metodo ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: opcoes.corpo ? JSON.stringify(opcoes.corpo) : undefined,
    })
  } catch {
    throw new ErroApi(0, 'Não consegui falar com a API. Ela está ligada? (No servidor grátis, o primeiro acesso pode levar até 1 minuto.)')
  }

  if (resposta.status === 401 && token) sair()

  const texto = await resposta.text()
  const json = texto ? JSON.parse(texto) : null

  if (!resposta.ok) {
    throw new ErroApi(resposta.status, json?.mensagem ?? 'Algo deu errado', json?.erros ?? [])
  }
  return json as T
}

// ---------- Endpoints ----------
export const api = {
  login: (email: string, senha: string) =>
    requisitar<{ token: string }>('/auth/login', { metodo: 'POST', corpo: { email, senha } }),

  cadastrar: (dados: { nome: string; cpf: string; email: string; senha: string }) =>
    requisitar<Cliente>('/clientes', { metodo: 'POST', corpo: dados }),

  buscarCliente: (id: number) => requisitar<Cliente>(`/clientes/${id}`),

  minhasContas: () => requisitar<Conta[]>('/contas'),

  abrirConta: (clienteId: number) => requisitar<Conta>('/contas', { metodo: 'POST', corpo: { clienteId } }),

  encerrarConta: (id: number) => requisitar<Conta>(`/contas/${id}/encerrar`, { metodo: 'PATCH' }),

  depositar: (id: number, valor: number) =>
    requisitar<Transacao>(`/contas/${id}/deposito`, { metodo: 'POST', corpo: { valor } }),

  sacar: (id: number, valor: number) =>
    requisitar<Transacao>(`/contas/${id}/saque`, { metodo: 'POST', corpo: { valor } }),

  transferir: (contaOrigemId: number, contaDestinoId: number, valor: number) =>
    requisitar<unknown>('/transferencias', { metodo: 'POST', corpo: { contaOrigemId, contaDestinoId, valor } }),

  extrato: (id: number, filtros: { inicio?: string; fim?: string; pagina: number }) => {
    const params = new URLSearchParams({ pagina: String(filtros.pagina), tamanho: '8' })
    if (filtros.inicio) params.set('inicio', filtros.inicio)
    if (filtros.fim) params.set('fim', filtros.fim)
    return requisitar<Extrato>(`/contas/${id}/extrato?${params}`)
  },
}

// ---------- Formatação ----------
const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
export const formatarMoeda = (valor: number) => moeda.format(valor)

export const formatarDataHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export const NOMES_TIPO: Record<Transacao['tipo'], string> = {
  DEPOSITO: 'Depósito',
  SAQUE: 'Saque',
  TRANSFERENCIA_ENVIADA: 'Transferência enviada',
  TRANSFERENCIA_RECEBIDA: 'Transferência recebida',
}

export const ehEntrada = (tipo: Transacao['tipo']) => tipo === 'DEPOSITO' || tipo === 'TRANSFERENCIA_RECEBIDA'
