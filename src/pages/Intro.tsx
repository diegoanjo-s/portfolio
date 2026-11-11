import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ChuvaDourada from '../components/ChuvaDourada.tsx'

// Quando a imagem de fundo ficar pronta, coloque-a em public/intro.jpg
// e troque null por '/intro.jpg'
const IMAGEM_DE_FUNDO: string | null = null

const FRASE = 'Escolha. Uma leva aos meus projetos. A outra, de volta ao mundo de sempre.'

export default function Intro() {
  const navigate = useNavigate()
  const [texto, setTexto] = useState('')
  const [saindo, setSaindo] = useState(false)

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

  function escolherVermelha() {
    setSaindo(true)
    setTimeout(() => navigate('/projetos'), 900)
  }

  function escolherAzul() {
    window.location.href = 'https://www.google.com'
  }

  return (
    <>
      {!IMAGEM_DE_FUNDO && <ChuvaDourada />}
      {saindo && <div className="flash" />}

      <main
        className={`intro camada ${saindo ? 'saindo' : ''} ${IMAGEM_DE_FUNDO ? 'com-imagem' : ''}`}
        style={IMAGEM_DE_FUNDO ? { backgroundImage: `url(${IMAGEM_DE_FUNDO})` } : undefined}
      >
        <div>
          <h1 className="ouro">DIEGO ANJOS</h1>
          <p className="subtitulo">
            {texto}
            <span className="cursor">&nbsp;</span>
          </p>
        </div>

        <div className="pilulas">
          <button className="escolha vermelha" onClick={escolherVermelha} aria-label="Pílula vermelha: entrar nos projetos">
            <div className="pilula" />
            <span className="rotulo">Pílula vermelha</span>
            <span className="dica">Entrar e ver até onde vai o código</span>
          </button>

          <button className="escolha azul" onClick={escolherAzul} aria-label="Pílula azul: voltar para o Google">
            <div className="pilula" />
            <span className="rotulo">Pílula azul</span>
            <span className="dica">Voltar para o Google e esquecer tudo</span>
          </button>
        </div>
      </main>
    </>
  )
}
