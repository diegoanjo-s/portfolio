import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import ChuvaDourada from '../components/ChuvaDourada.tsx'

// Imagem de fundo (gerada com IA) e onde ficam as pílulas dentro dela, em % da largura/altura
const IMAGEM = '/intro.jpg'

const PILULAS = {
  vermelha: {
    x: 26.3, y: 79.5,
    cor: '255, 40, 60',
    frase: 'A realidade é só o começo.',
    rotulo: 'Pílula vermelha: entrar nos meus projetos',
  },
  azul: {
    x: 73.8, y: 80.3,
    cor: '40, 130, 255',
    frase: 'Volte para a ilusão.',
    rotulo: 'Pílula azul: voltar para o Google',
  },
} as const

type Lado = keyof typeof PILULAS
const DURACAO_SAIDA = 1500 // ms da animação de clique

// Efeito de máquina de escrever
function useDigitar(frase: string, atraso: number) {
  const [texto, setTexto] = useState('')
  useEffect(() => {
    let i = 0
    let id = 0
    const inicio = window.setTimeout(() => {
      id = window.setInterval(() => {
        i++
        setTexto(frase.slice(0, i))
        if (i >= frase.length) window.clearInterval(id)
      }, 55)
    }, atraso)
    return () => { window.clearTimeout(inicio); window.clearInterval(id) }
  }, [frase, atraso])
  return texto
}

export default function Intro() {
  const navigate = useNavigate()
  const [foco, setFoco] = useState<Lado | null>(null)
  const [escolhida, setEscolhida] = useState<Lado | null>(null)

  const textos: Record<Lado, string> = {
    vermelha: useDigitar(PILULAS.vermelha.frase, 600),
    azul: useDigitar(PILULAS.azul.frase, 2400),
  }

  function irPara(lado: Lado) {
    if (lado === 'vermelha') navigate('/projetos')
    else window.location.href = 'https://www.google.com'
  }

  function escolher(lado: Lado) {
    if (escolhida) return
    setEscolhida(lado)
  }

  // Muda de página quando o mergulho termina (com uma rede de segurança, caso a animação não rode)
  useEffect(() => {
    if (!escolhida) return
    const id = window.setTimeout(() => irPara(escolhida), DURACAO_SAIDA + 1500)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [escolhida])

  const ativo = escolhida ?? foco
  const alvo = PILULAS[ativo ?? 'vermelha']
  const estiloCena = { '--alvo-x': `${alvo.x}%`, '--alvo-y': `${alvo.y}%` } as CSSProperties

  return (
    <div className={`intro-matrix ${ativo ? `ativo-${ativo}` : ''} ${escolhida ? 'saindo' : ''}`}>
      {/* em tela "em pé" (celular) a imagem não cabe inteira: esta cópia borrada preenche o fundo */}
      <img src={IMAGEM} alt="" className="fundo-borrado" aria-hidden="true" />
      <ChuvaDourada tema="matrix" intensidade={0.55} transparente destaque={ativo ? PILULAS[ativo].cor : null} rapida={!!escolhida} />

      <div
        className="cena"
        style={estiloCena}
        onAnimationEnd={(e) => { if (escolhida && e.animationName === 'mergulho') irPara(escolhida) }}
      >
        <img src={IMAGEM} alt="Figura encapuzada oferecendo uma pílula vermelha e uma azul" className="cena-imagem" />

        {/* chuva binária por cima da imagem: os números "descem" sobre ela */}
        <ChuvaDourada
          tema="matrix" intensidade={0.4} className="cena-chuva" transparente
          destaque={ativo ? PILULAS[ativo].cor : null} rapida={!!escolhida}
        />

        {/* gradientes coloridos que aparecem no hover */}
        {(Object.keys(PILULAS) as Lado[]).flatMap((lado) =>
          (['cor', 'luz'] as const).map((camada) => (
            <div
              key={lado + camada}
              className={`tinta ${camada} ${lado}`}
              style={{ '--x': `${PILULAS[lado].x}%`, '--y': `${PILULAS[lado].y}%`, '--cor': PILULAS[lado].cor } as CSSProperties}
            />
          )),
        )}

        {(Object.keys(PILULAS) as Lado[]).map((lado) => {
          const p = PILULAS[lado]
          return (
            <div key={lado} className={`pilula-area ${lado}`} style={{ left: `${p.x}%`, top: `${p.y}%`, '--cor': p.cor } as CSSProperties}>
              <p className="frase" aria-hidden="true">
                {textos[lado]}
                {textos[lado].length < p.frase.length && <span className="cursor">&nbsp;</span>}
              </p>
              <button
                className="ponto"
                onMouseEnter={() => setFoco(lado)}
                onMouseLeave={() => setFoco(null)}
                onFocus={() => setFoco(lado)}
                onBlur={() => setFoco(null)}
                onClick={() => escolher(lado)}
                aria-label={p.rotulo}
              >
                <span className="anel" />
              </button>
            </div>
          )
        })}
      </div>

      <header className="intro-titulo">
        <h1 className="ouro">DIEGO ANJOS</h1>
      </header>

      {escolhida && <div className="flash" style={{ '--cor': PILULAS[escolhida].cor } as CSSProperties} />}
    </div>
  )
}
