import { useEffect, useRef } from 'react'

// Fundo animado: colunas de caracteres caindo, desenhadas num <canvas>.
// tema "ouro"   -> símbolos dourados (menu e DevBank)
// tema "matrix" -> só 0 e 1 em verde, com a "cabeça" da coluna brilhando (tela de entrada)

type Tema = 'ouro' | 'matrix'

const TEMAS = {
  ouro: {
    caracteres: '01{}<>/=;$€₿DEVBANKJAVA∑λ#@',
    fundo: '10, 8, 6',
    cabeca: '#fff1b8',
    corpo: (a: number) => `rgba(212, 175, 55, ${a})`,
    rastro: 0.09,
  },
  matrix: {
    caracteres: '01',
    fundo: '0, 0, 0',
    cabeca: '#d6ffe0',
    corpo: (a: number) => `rgba(0, 255, 90, ${a})`,
    rastro: 0.07,
  },
}

type Props = {
  tema?: Tema
  intensidade?: number   // 0 a 1: quantas colunas caem ao mesmo tempo
  className?: string
  transparente?: boolean // true = não pinta fundo (para ficar por cima de uma imagem)
}

export default function ChuvaDourada({ tema = 'ouro', intensidade = 1, className = 'chuva', transparente = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const t = TEMAS[tema]
    const tamanho = tema === 'matrix' ? 15 : 16
    let colunas: number[] = []
    let quadro = 0
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function ajustar() {
      const caixa = canvas!.getBoundingClientRect()
      canvas!.width = Math.max(1, Math.round(caixa.width))
      canvas!.height = Math.max(1, Math.round(caixa.height))
      const total = Math.ceil(canvas!.width / tamanho)
      colunas = Array.from({ length: total }, () => Math.random() * -canvas!.height / tamanho)
      if (!transparente) {
        ctx!.fillStyle = `rgb(${t.fundo})`
        ctx!.fillRect(0, 0, canvas!.width, canvas!.height)
      }
    }

    function desenhar() {
      // Rastro: apaga um pouco do quadro anterior, as letras antigas vão sumindo
      if (transparente) {
        ctx!.globalCompositeOperation = 'destination-out'
        ctx!.fillStyle = `rgba(0, 0, 0, ${t.rastro * 1.6})`
        ctx!.fillRect(0, 0, canvas!.width, canvas!.height)
        ctx!.globalCompositeOperation = 'source-over'
      } else {
        ctx!.fillStyle = `rgba(${t.fundo}, ${t.rastro})`
        ctx!.fillRect(0, 0, canvas!.width, canvas!.height)
      }
      ctx!.font = `${tamanho}px "JetBrains Mono", monospace`

      colunas.forEach((y, i) => {
        if (Math.random() > intensidade) return
        const letra = t.caracteres[Math.floor(Math.random() * t.caracteres.length)]
        const x = i * tamanho
        const py = y * tamanho

        // a letra de baixo (a "cabeça") brilha mais, como no efeito clássico
        ctx!.fillStyle = t.cabeca
        ctx!.shadowColor = t.cabeca
        ctx!.shadowBlur = tema === 'matrix' ? 8 : 0
        ctx!.fillText(letra, x, py)
        ctx!.shadowBlur = 0

        // repinta a letra de cima com a cor normal, assim só a ponta fica clara
        ctx!.fillStyle = t.corpo(0.45 + Math.random() * 0.4)
        ctx!.fillText(t.caracteres[Math.floor(Math.random() * t.caracteres.length)], x, py - tamanho)

        if (py > canvas!.height && Math.random() > 0.975) colunas[i] = 0
        else colunas[i] = y + 1
      })
    }

    ajustar()
    window.addEventListener('resize', ajustar)

    let id = 0
    function loop() {
      quadro++
      if (quadro % 3 === 0) desenhar()
      id = requestAnimationFrame(loop)
    }

    if (reduzido) {
      for (let i = 0; i < 40; i++) desenhar()
    } else {
      loop()
    }

    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('resize', ajustar)
    }
  }, [tema, intensidade, transparente])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
