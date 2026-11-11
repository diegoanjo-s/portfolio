import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// ============================================================
//  PORTA DE ENTRADA do SQL Arcade
//  O vídeo original é cinza claro; o filtro do CSS o deixa
//  dourado sobre preto. Enquanto ele toca, o banco carrega por trás.
//  Duas versões do mesmo vídeo: o navegador baixa só UMA delas
//  (WebM é menor; o MP4 fica de reserva para quem não tem WebM).
// ============================================================

type Props = {
  pronto: boolean      // o banco já terminou de carregar?
  aoEntrar: () => void
}

export default function Entrada({ pronto, aoEntrar }: Props) {
  const [saindo, setSaindo] = useState(false)

  function entrar() {
    if (!saindo) setSaindo(true)
  }

  // Enter ou espaço também apertam START
  useEffect(() => {
    function tecla(e: KeyboardEvent) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); entrar() }
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  })

  // trava a rolagem da página de trás enquanto a entrada está na tela
  useEffect(() => {
    const antes = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = antes }
  }, [])

  // rede de segurança: se a animação de saída não rodar, entra assim mesmo
  useEffect(() => {
    if (!saindo) return
    const id = window.setTimeout(aoEntrar, 1200)
    return () => window.clearTimeout(id)
  }, [saindo, aoEntrar])

  return (
    <div
      className={`arc-entrada ${saindo ? 'saindo' : ''}`}
      onAnimationEnd={(e) => { if (e.animationName === 'arc-entrada-sai') aoEntrar() }}
    >
      <video className="arc-entrada-video" autoPlay muted loop playsInline preload="auto" aria-hidden="true">
        <source src="/sql-arcade/entrada.webm" type="video/webm" />
        <source src="/sql-arcade/entrada.mp4" type="video/mp4" />
      </video>

      <Link to="/projetos" className="arc-entrada-voltar">← Projetos</Link>

      <div className="arc-entrada-painel">
        <h1 className="arc-pixel arc-logo-texto">SQL ARCADE</h1>
        <button className="arc-pixel arc-start" onClick={entrar}>
          {pronto ? 'PRESS START' : 'INSERT COIN'}
        </button>
        <p className="arc-entrada-status">
          {pronto ? 'Banco pronto · aperte Enter' : 'Ligando o PostgreSQL no seu navegador...'}
        </p>
      </div>
    </div>
  )
}
