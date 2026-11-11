import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import ChuvaDourada from '../components/ChuvaDourada.tsx'

// Imagem de fundo (gerada com IA) e onde ficam as pílulas dentro dela, em % da largura/altura
const IMAGEM = '/intro.jpg'
const PILULA_VERMELHA = { x: 26.3, y: 79.5 }
const PILULA_AZUL = { x: 73.8, y: 80.3 }

const FRASE = 'Escolha. Uma leva aos meus projetos. A outra, de volta ao mundo de sempre.'

type Escolha = 'vermelha' | 'azul' | null

export default function Intro() {
  const navigate = useNavigate()
  const [texto, setTexto] = useState('')
  const [foco, setFoco] = useState<Escolha>(null)
  const [escolhida, setEscolhida] = useState<Escolha>(null)

  // Efeito de máquina de escrever na frase
  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      i++
      setTexto(FRASE.slice(0, i))
      if (i >= FRASE.length) clearInterval(id)
    }, 45)
    return () => clearInterval(id)
  }, [])

  function escolher(qual: 'vermelha' | 'azul') {
    if (escolhida) return
    setEscolhida(qual)
    setTimeout(() => {
      if (qual === 'vermelha') navigate('/projetos')
      else window.location.href = 'https://www.google.com'
    }, 1100)
  }

  // O zoom (no hover e no clique) mira na pílula escolhida
  const alvo = (escolhida ?? foco) === 'azul' ? PILULA_AZUL : PILULA_VERMELHA
  const estiloCena: CSSProperties = { transformOrigin: `${alvo.x}% ${alvo.y}%` }

  return (
    <div className={`intro-matrix foco-${foco ?? 'nenhum'} ${escolhida ? `escolheu-${escolhida}` : ''}`}>
      {/* chuva binária no fundo da tela inteira */}
      <ChuvaDourada tema="matrix" intensidade={0.55} />

      <header className="intro-titulo camada">
        <h1 className="ouro">DIEGO ANJOS</h1>
        <p className="subtitulo">
          {texto}
          <span className="cursor">&nbsp;</span>
        </p>
      </header>

      <div className="cena camada" style={estiloCena}>
        <img src={IMAGEM} alt="Figura encapuzada oferecendo uma pílula vermelha e uma azul" className="cena-imagem" />

        {/* chuva binária por cima da imagem, para os números "descerem" sobre ela */}
        <ChuvaDourada tema="matrix" intensidade={0.35} className="cena-chuva" transparente />

        <button
          className="ponto vermelha"
          style={{ left: `${PILULA_VERMELHA.x}%`, top: `${PILULA_VERMELHA.y}%` }}
          onMouseEnter={() => setFoco('vermelha')}
          onMouseLeave={() => setFoco(null)}
          onFocus={() => setFoco('vermelha')}
          onBlur={() => setFoco(null)}
          onClick={() => escolher('vermelha')}
          aria-label="Pílula vermelha: entrar nos meus projetos"
        >
          <span className="anel" />
          <span className="legenda">Entrar</span>
        </button>

        <button
          className="ponto azul"
          style={{ left: `${PILULA_AZUL.x}%`, top: `${PILULA_AZUL.y}%` }}
          onMouseEnter={() => setFoco('azul')}
          onMouseLeave={() => setFoco(null)}
          onFocus={() => setFoco('azul')}
          onBlur={() => setFoco(null)}
          onClick={() => escolher('azul')}
          aria-label="Pílula azul: voltar para o Google"
        >
          <span className="anel" />
          <span className="legenda">Voltar ao Google</span>
        </button>
      </div>

      {escolhida && <div className={`flash ${escolhida}`} />}
    </div>
  )
}
