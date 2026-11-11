// ============================================================
//  Motor do SQL Arcade: cria o banco no navegador, executa SQL
//  e confere as respostas das missões.
// ============================================================
import { PGlite } from '@electric-sql/pglite'
import { SEED_SQL } from './seed.ts'
import type { Missao } from './missoes.ts'

export type Resultado = {
  colunas: string[]
  linhas: unknown[][]
  tempoMs: number
  mensagem: string | null // ex.: "3 linha(s) alteradas" para comandos sem resultado
}

export async function criarBanco(): Promise<PGlite> {
  const db = await PGlite.create()
  await db.exec(SEED_SQL)
  return db
}

// Executa um ou mais comandos e devolve o resultado do último que retornou linhas
export async function executar(db: PGlite, sql: string): Promise<Resultado> {
  const inicio = performance.now()
  const resultados = await db.exec(sql, { rowMode: 'array' })
  const tempoMs = performance.now() - inicio

  const comLinhas = [...resultados].reverse().find((r) => r.fields.length > 0)
  if (comLinhas) {
    return {
      colunas: comLinhas.fields.map((f) => f.name),
      linhas: comLinhas.rows as unknown[][],
      tempoMs,
      mensagem: null,
    }
  }
  const ultimo = resultados[resultados.length - 1]
  const afetadas = ultimo?.affectedRows ?? 0
  return { colunas: [], linhas: [], tempoMs, mensagem: `Comando executado. ${afetadas} linha(s) afetada(s).` }
}

// Deixa valores comparáveis: números com 2 casas, datas sem horário, texto como texto
function normalizar(valor: unknown): string {
  if (valor === null || valor === undefined) return 'null'
  if (valor instanceof Date) {
    const iso = valor.toISOString()
    return iso.endsWith('T00:00:00.000Z') ? iso.slice(0, 10) : iso
  }
  if (typeof valor === 'number' || typeof valor === 'bigint') return Number(valor).toFixed(2)
  if (typeof valor === 'string' && /^-?\d+(\.\d+)?$/.test(valor)) return Number(valor).toFixed(2)
  return String(valor).trim()
}

const chaveLinha = (linha: unknown[]) => linha.map(normalizar).join('␟')

export type Conferencia = { certo: boolean; motivo: string }

export async function conferir(db: PGlite, missao: Missao, doUsuario: Resultado): Promise<Conferencia> {
  if (missao.tipo === 'indice') {
    const plano = await db.query<{ 'QUERY PLAN': string }>(
      'EXPLAIN SELECT * FROM historico_partidas WHERE jogador_id = 4242',
    )
    const texto = plano.rows.map((r) => r['QUERY PLAN']).join('\n')
    return /Index|Bitmap/.test(texto)
      ? { certo: true, motivo: 'O banco agora usa o índice em vez de ler a tabela inteira!' }
      : { certo: false, motivo: 'A consulta ainda faz Seq Scan. Crie um índice na coluna usada no WHERE.' }
  }

  if (doUsuario.colunas.length === 0) {
    return { certo: false, motivo: 'Sua consulta não retornou nenhuma tabela. Ela precisa ser um SELECT.' }
  }

  const esperado = await executar(db, missao.solucao)

  if (doUsuario.colunas.length !== esperado.colunas.length) {
    return {
      certo: false,
      motivo: `Esperava ${esperado.colunas.length} coluna(s), mas sua consulta trouxe ${doUsuario.colunas.length}.`,
    }
  }
  if (doUsuario.linhas.length !== esperado.linhas.length) {
    return {
      certo: false,
      motivo: `Esperava ${esperado.linhas.length} linha(s), mas sua consulta trouxe ${doUsuario.linhas.length}.`,
    }
  }

  const a = doUsuario.linhas.map(chaveLinha)
  const b = esperado.linhas.map(chaveLinha)

  if (missao.ordenado) {
    const mesmasLinhas = [...a].sort().join('\n') === [...b].sort().join('\n')
    if (a.join('\n') === b.join('\n')) return { certo: true, motivo: 'Resultado e ordem corretos!' }
    return mesmasLinhas
      ? { certo: false, motivo: 'As linhas estão certas, mas a ordem não. Confira o ORDER BY.' }
      : { certo: false, motivo: 'Os valores não batem com o esperado. Confira os filtros e as contas.' }
  }

  return [...a].sort().join('\n') === [...b].sort().join('\n')
    ? { certo: true, motivo: 'Resultado correto!' }
    : { certo: false, motivo: 'Os valores não batem com o esperado. Confira os filtros e as contas.' }
}
