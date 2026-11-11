import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import CodeMirror from '@uiw/react-codemirror'
import { sql, PostgreSQL } from '@codemirror/lang-sql'
import { EditorView, keymap } from '@codemirror/view'
import { Prec } from '@codemirror/state'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
import type { PGlite } from '@electric-sql/pglite'
import { criarBanco, executar, conferir } from './banco.ts'
import type { Resultado } from './banco.ts'
import { FASES, MISSOES } from './missoes.ts'
import type { Missao } from './missoes.ts'
import { TABELAS } from './seed.ts'
import './sql-arcade.css'

const CHAVE_PROGRESSO = 'sqlarcade.concluidas'
const LIMITE_LINHAS = 300

function lerProgresso(): string[] {
  try { return JSON.parse(localStorage.getItem(CHAVE_PROGRESSO) ?? '[]') } catch { return [] }
}
function salvarProgresso(ids: string[]) {
  try { localStorage.setItem(CHAVE_PROGRESSO, JSON.stringify(ids)) } catch { /* sem storage */ }
}

const TEXTO_INICIAL = '-- Escreva sua consulta aqui e aperte Ctrl+Enter\nSELECT * FROM jogos LIMIT 10;'

const temaEditor = EditorView.theme({
  '&': { backgroundColor: '#0b0a08', color: '#f3ead6', fontSize: '15px' },
  '.cm-content': { fontFamily: '"JetBrains Mono", monospace', caretColor: '#f5d77a' },
  '.cm-gutters': { backgroundColor: '#0b0a08', color: '#6e6450', border: 'none' },
  '.cm-activeLine': { backgroundColor: 'rgba(212, 175, 55, 0.06)' },
  '.cm-activeLineGutter': { backgroundColor: 'rgba(212, 175, 55, 0.1)', color: '#f5d77a' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': { backgroundColor: 'rgba(212, 175, 55, 0.25) !important' },
  '&.cm-focused': { outline: 'none' },
}, { dark: true })

// Cores do SQL no editor, combinando com o preto e dourado
const coresSql = syntaxHighlighting(HighlightStyle.define([
  { tag: t.keyword, color: '#f5d77a', fontWeight: '600' },
  { tag: [t.string, t.special(t.string)], color: '#9be29b' },
  { tag: t.number, color: '#ffb36b' },
  { tag: [t.comment, t.lineComment, t.blockComment], color: '#7d735f', fontStyle: 'italic' },
  { tag: [t.operator, t.punctuation], color: '#d4af37' },
  { tag: [t.typeName, t.standard(t.name)], color: '#8fd3ff' },
  { tag: [t.name, t.propertyName], color: '#f3ead6' },
  { tag: t.bool, color: '#ffb36b' },
]))

function formatarValor(v: unknown): string {
  if (v === null || v === undefined) return 'NULL'
  if (v instanceof Date) {
    const iso = v.toISOString()
    return iso.endsWith('T00:00:00.000Z') ? iso.slice(0, 10) : iso.replace('T', ' ').slice(0, 19)
  }
  return String(v)
}

type Feedback = { tipo: 'certo' | 'erro' | 'info'; texto: string } | null

export default function SqlArcade() {
  const [db, setDb] = useState<PGlite | null>(null)
  const [falhaAoCarregar, setFalhaAoCarregar] = useState<string | null>(null)
  const [modo, setModo] = useState<'missoes' | 'livre'>('missoes')
  const [missaoId, setMissaoId] = useState(MISSOES[0].id)
  const [rascunhos, setRascunhos] = useState<Record<string, string>>({})
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [concluidas, setConcluidas] = useState<string[]>(lerProgresso)
  const [mostrarDica, setMostrarDica] = useState(false)
  const [rodando, setRodando] = useState(false)
  const [abertas, setAbertas] = useState<string[]>(['jogos'])

  const missao = MISSOES.find((m) => m.id === missaoId) as Missao
  const chaveRascunho = modo === 'livre' ? '__livre__' : missaoId
  const codigo = rascunhos[chaveRascunho] ?? TEXTO_INICIAL

  // Carrega o banco uma vez
  useEffect(() => {
    let ativo = true
    criarBanco()
      .then((novo) => { if (ativo) setDb(novo) })
      .catch((e: Error) => { if (ativo) setFalhaAoCarregar(e.message) })
    return () => { ativo = false }
  }, [])

  const limparSaida = () => { setResultado(null); setFeedback(null); setMostrarDica(false) }

  function escolherMissao(id: string) {
    setModo('missoes')
    setMissaoId(id)
    limparSaida()
  }

  const rodar = useCallback(async (verificar: boolean) => {
    if (!db || rodando) return
    setRodando(true)
    setFeedback(null)
    try {
      const r = await executar(db, codigo)
      setResultado(r)
      if (verificar && modo === 'missoes') {
        const c = await conferir(db, missao, r)
        if (c.certo) {
          const novas = concluidas.includes(missao.id) ? concluidas : [...concluidas, missao.id]
          setConcluidas(novas)
          salvarProgresso(novas)
          setFeedback({ tipo: 'certo', texto: `+1 XP · ${c.motivo}` })
        } else {
          setFeedback({ tipo: 'erro', texto: c.motivo })
        }
      } else if (r.mensagem) {
        setFeedback({ tipo: 'info', texto: r.mensagem })
      }
    } catch (e) {
      setResultado(null)
      setFeedback({ tipo: 'erro', texto: `Erro do PostgreSQL: ${(e as Error).message}` })
    } finally {
      setRodando(false)
    }
  }, [db, rodando, codigo, modo, missao, concluidas])

  // Ctrl+Enter executa; o ref mantém a função mais recente dentro do editor
  const rodarRef = useRef(rodar)
  useEffect(() => { rodarRef.current = rodar }, [rodar])

  const extensoes = useMemo(() => [
    sql({ dialect: PostgreSQL, upperCaseKeywords: true, schema: Object.fromEntries(TABELAS.map((tab) => [tab.nome, tab.colunas])) }),
    coresSql,
    Prec.highest(keymap.of([{ key: 'Mod-Enter', run: () => { rodarRef.current(false); return true } }])),
  ], [])

  async function resetarBanco() {
    if (!confirm('Recriar o banco do zero? Tudo o que você alterou (INSERT, DELETE, índices...) será desfeito.')) return
    setDb(null)
    limparSaida()
    const antigo = db
    const novo = await criarBanco()
    setDb(novo)
    antigo?.close().catch(() => {})
    setFeedback({ tipo: 'info', texto: 'Banco recriado com os dados originais.' })
  }

  function verSolucao() {
    if (!confirm('Ver a solução? Tente mais um pouco antes, vale a pena!')) return
    setRascunhos({ ...rascunhos, [missao.id]: missao.solucao })
  }

  function zerarProgresso() {
    if (!confirm('Zerar todo o seu progresso (XP)?')) return
    setConcluidas([])
    salvarProgresso([])
  }

  const indice = MISSOES.indexOf(missao)
  const proxima = MISSOES[indice + 1]
  const xp = concluidas.length
  const total = MISSOES.length

  if (falhaAoCarregar) {
    return (
      <div className="arc arc-carregando">
        <p className="arc-pixel">GAME OVER</p>
        <p>Não consegui iniciar o banco no seu navegador: {falhaAoCarregar}</p>
        <Link to="/projetos" className="arc-botao">← Voltar aos projetos</Link>
      </div>
    )
  }

  return (
    <div className="arc">
      <header className="arc-topo">
        <Link to="/projetos" className="arc-voltar">← Projetos</Link>
        <div className="arc-logo">
          <span className="arc-pixel arc-logo-texto">SQL ARCADE</span>
          <span className="arc-sub">Loja de games Pixel Vault · PostgreSQL de verdade no seu navegador</span>
        </div>
        <div className="arc-xp" title={`${xp} de ${total} missões completas`}>
          <span className="arc-pixel">XP {xp}/{total}</span>
          <div className="arc-xp-barra">
            {MISSOES.map((m) => <span key={m.id} className={concluidas.includes(m.id) ? 'cheio' : ''} />)}
          </div>
        </div>
      </header>

      <div className="arc-corpo">
        <aside className="arc-lateral">
          <div className="arc-abas">
            <button className={modo === 'missoes' ? 'ativa' : ''} onClick={() => { setModo('missoes'); limparSaida() }}>Missões</button>
            <button className={modo === 'livre' ? 'ativa' : ''} onClick={() => { setModo('livre'); limparSaida() }}>Modo livre</button>
          </div>

          <nav className="arc-missoes" aria-label="Missões">
            {FASES.map((f) => (
              <div key={f.numero} className="arc-fase">
                <p className="arc-pixel arc-fase-nome">FASE {f.numero}</p>
                <p className="arc-fase-desc">{f.nome} · {f.descricao}</p>
                {MISSOES.filter((m) => m.fase === f.numero).map((m) => (
                  <button
                    key={m.id}
                    className={`arc-item ${m.id === missaoId && modo === 'missoes' ? 'atual' : ''} ${concluidas.includes(m.id) ? 'feita' : ''}`}
                    onClick={() => escolherMissao(m.id)}
                  >
                    <span className="arc-check">{concluidas.includes(m.id) ? '★' : '☆'}</span>
                    {m.titulo}
                  </button>
                ))}
              </div>
            ))}
            {xp > 0 && <button className="arc-link" onClick={zerarProgresso}>zerar progresso</button>}
          </nav>

          <div className="arc-schema">
            <p className="arc-pixel arc-fase-nome">TABELAS</p>
            {TABELAS.map((t) => {
              const aberta = abertas.includes(t.nome)
              return (
                <div key={t.nome}>
                  <button
                    className="arc-tabela"
                    onClick={() => setAbertas(aberta ? abertas.filter((n) => n !== t.nome) : [...abertas, t.nome])}
                  >
                    {aberta ? '▾' : '▸'} {t.nome}
                  </button>
                  {aberta && (
                    <ul className="arc-colunas">
                      {t.colunas.map((c) => <li key={c}>{c}</li>)}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        </aside>

        <main className="arc-principal">
          {modo === 'missoes' ? (
            <section className="arc-cartao">
              <p className="arc-pixel arc-rotulo">FASE {missao.fase} · MISSÃO {indice + 1}</p>
              <h1>{missao.titulo} {concluidas.includes(missao.id) && <span className="arc-estrela">★</span>}</h1>
              <p className="arc-enunciado">{missao.enunciado}</p>
              <div className="arc-acoes-missao">
                <button className="arc-botao secundario" onClick={() => setMostrarDica(!mostrarDica)}>💡 {mostrarDica ? 'Esconder dica' : 'Dica'}</button>
                <button className="arc-botao secundario" onClick={verSolucao}>👀 Ver solução</button>
              </div>
              {mostrarDica && <p className="arc-dica">{missao.dica}</p>}
            </section>
          ) : (
            <section className="arc-cartao">
              <p className="arc-pixel arc-rotulo">MODO LIVRE</p>
              <h1>Explore à vontade</h1>
              <p className="arc-enunciado">
                Escreva qualquer SQL: SELECT, JOIN, INSERT, UPDATE, CREATE INDEX... O banco é só seu e roda no seu navegador.
                Se bagunçar, é só resetar.
              </p>
            </section>
          )}

          <div className="arc-editor">
            <CodeMirror
              value={codigo}
              height="190px"
              theme={temaEditor}
              extensions={extensoes}
              onChange={(valor) => setRascunhos((r) => ({ ...r, [chaveRascunho]: valor }))}
              basicSetup={{ foldGutter: false, autocompletion: true }}
            />
          </div>

          <div className="arc-barra">
            <button className="arc-botao" onClick={() => rodar(false)} disabled={!db || rodando}>▶ Executar <kbd>Ctrl+Enter</kbd></button>
            {modo === 'missoes' && (
              <button className="arc-botao arc-dourado" onClick={() => rodar(true)} disabled={!db || rodando}>✔ Verificar resposta</button>
            )}
            <button className="arc-botao secundario" onClick={resetarBanco} disabled={!db || rodando}>↺ Resetar banco</button>
          </div>

          {feedback && (
            <div className={`arc-feedback ${feedback.tipo}`} role="status">
              {feedback.tipo === 'certo' && <span className="arc-pixel">MISSÃO COMPLETA!</span>}
              <span>{feedback.texto}</span>
              {feedback.tipo === 'certo' && proxima && (
                <button className="arc-botao arc-dourado pequeno" onClick={() => escolherMissao(proxima.id)}>Próxima missão →</button>
              )}
              {feedback.tipo === 'certo' && !proxima && xp === total && (
                <span className="arc-pixel">🏆 VOCÊ ZEROU O SQL ARCADE!</span>
              )}
            </div>
          )}

          {!db && (
            <div className="arc-carregando-inline">
              <span className="arc-pixel">CARREGANDO CARTUCHO</span>
              <span className="arc-pontos"><i /><i /><i /></span>
              <p>Iniciando o PostgreSQL no seu navegador e criando a loja de games (150 mil partidas)...</p>
            </div>
          )}

          {resultado && resultado.colunas.length > 0 && (
            <section className="arc-resultado">
              <p className="arc-info-resultado">
                {resultado.linhas.length} linha(s) · {resultado.tempoMs.toFixed(1)} ms
                {resultado.linhas.length > LIMITE_LINHAS && ` · mostrando as primeiras ${LIMITE_LINHAS}`}
              </p>
              <div className="arc-tabela-resultado">
                <table>
                  <thead>
                    <tr>{resultado.colunas.map((c, i) => <th key={i}>{c}</th>)}</tr>
                  </thead>
                  <tbody>
                    {resultado.linhas.slice(0, LIMITE_LINHAS).map((linha, i) => (
                      <tr key={i}>{linha.map((v, j) => <td key={j} className={v === null ? 'nulo' : ''}>{formatarValor(v)}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
