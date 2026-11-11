import { Link } from 'react-router-dom'
import ChuvaDourada from '../components/ChuvaDourada.tsx'
import { projetos } from '../projetos.ts'
import type { Projeto } from '../projetos.ts'

function ConteudoCard({ projeto }: { projeto: Projeto }) {
  return (
    <>
      <span className={`selo ${projeto.status}`}>{projeto.status === 'online' ? 'Online' : 'Em breve'}</span>
      <h2>{projeto.nome}</h2>
      <p>{projeto.descricao}</p>
      <div className="tags">
        {projeto.tecnologias.map((t) => <span key={t}>{t}</span>)}
      </div>
      {projeto.rota && (
        <div className="rodape-card">
          <span className="entrar">Entrar no projeto →</span>
        </div>
      )}
    </>
  )
}

export default function Projetos() {
  return (
    <>
      <ChuvaDourada intensidade={0.35} />
      <div className="pagina camada">
        <header className="topo">
          <Link to="/" className="marca ouro">DIEGO ANJOS</Link>
          <nav>
            <a href="https://github.com/diegoanjo-s" target="_blank" rel="noreferrer">GitHub</a>
          </nav>
        </header>

        <section className="cabecalho">
          <h1 className="ouro">Projetos</h1>
          <p>
            Cada card é um projeto que construí enquanto aprendo desenvolvimento.
            Clique para entrar e usar de verdade.
          </p>
        </section>

        <section className="grade">
          {projetos.map((projeto) =>
            projeto.rota ? (
              <Link key={projeto.nome} to={projeto.rota} className="card">
                <ConteudoCard projeto={projeto} />
              </Link>
            ) : (
              <div key={projeto.nome} className={`card ${projeto.status}`}>
                <ConteudoCard projeto={projeto} />
              </div>
            ),
          )}
        </section>
      </div>
    </>
  )
}
