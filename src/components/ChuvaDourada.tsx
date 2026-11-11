import { useEffect, useRef } from 'react'

// Fundo animado: colunas de caracteres dourados caindo, desenhadas num <canvas>
const CARACTERES = '01{}<>/=;$€₿DEVBANKJAVA∑λ#@'

export default function ChuvaDourada({ intensidade = 1 }: { intensidade?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const tamanho = 16
    let colunas: number[] = []
    let quadro = 0
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function ajustar() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
      const total = Math.ceil(canvas!.width / tamanho)
      colunas = Array.from({ length: total }, () => Math.random() * -canvas!.height / tamanho)
      ctx!.fillStyle = '#0a0806'
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height)
    }

    function desenhar() {
      // Rastro: pinta um preto translúcido por cima, as letras antigas vão sumindo
      ctx!.fillStyle = 'rgba(10, 8, 6, 0.09)'
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height)
      ctx!.font = `${tamanho}px "JetBrains Mono", monospace`

      colunas.forEach((y, i) => {
        if (Math.random() > intensidade) return
        const letra = CARACTERES[Math.floor(Math.random() * CARACTERES.length)]
        const brilhante = Math.random() > 0.96
        ctx!.fillStyle = brilhante ? '#fff1b8' : `rgba(212, 175, 55, ${0.35 + Math.random() * 0.4})`
        ctx!.fillText(letra, i * tamanho, y * tamanho)

        if (y * tamanho > canvas!.height && Math.random() > 0.975) colunas[i] = 0
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
  }, [intensidade])

  return <canvas ref={canvasRef} className="chuva" aria-hidden="true" />
}
