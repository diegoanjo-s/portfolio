import { useEffect, useRef } from 'react'

// Fundo animado: colunas de caracteres caindo, desenhadas num <canvas>.
// tema "ouro"   -> símbolos dourados (menu e DevBank)
// tema "matrix" -> só 0 e 1 em verde, com a "cabeça" da coluna brilhando (tela de entrada)

type Tema = 'ouro' | 'matrix'

const TEMAS = {
  ouro: { caracteres: '01{}<>/=;$€₿DEVBANKJAVA∑λ#@', fundo: '10, 8, 6', cor: '212, 175, 55', cabeca: '255, 241, 184', rastro: 0.09 },
  matrix: { caracteres: '01', fundo: '0, 0, 0', cor: '0, 255, 90', cabeca: '214, 255, 224', rastro: 0.07 },
}

type Props = {
  tema?: Tema
  intensidade?: number        // 0 a 1: quantas colunas caem ao mesmo tempo
  className?: string
  transparente?: boolean      // true = não pinta fundo (para ficar por cima de uma imagem)
  destaque?: string | null    // cor "r, g, b" que substitui a do tema (ex.: vermelho no hover)
  rapida?: boolean            // true = cai mais rápido (no clique)
}

export default function ChuvaDourada({
  tema = 'ouro', intensidade = 1, className = 'chuva', transparente = false, destaque = null, rapida = false,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Guardados em ref para a animação ler o valor novo sem reiniciar a chuva
  const destaqueRef = useRef(destaque)
  const rapidaRef = useRef(rapida)
  useEffect(() => { destaqueRef.current = destaque }, [destaque])
  useEffect(() => { rapidaRef.current = rapida }, [rapida])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const t = TEMAS[tema]
    const tamanho = tema === 'matrix' ? 16 : 16
    let colunas: number[] = []
    let quadro = 0

    function ajustar() {
      canvas!.width = Math.max(1, canvas!.offsetWidth)
      canvas!.height = Math.max(1, canvas!.offsetHeight)
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

      const cor = destaqueRef.current ?? t.cor
      const cabeca = destaqueRef.current ? '255, 255, 255' : t.cabeca
      ctx!.font = `${tamanho}px "JetBrains Mono", monospace`

      colunas.forEach((y, i) => {
        if (Math.random() > intensidade) return
        const x = i * tamanho
        const py = y * tamanho
        const letra = () => t.caracteres[Math.floor(Math.random() * t.caracteres.length)]

        // a letra de baixo (a "cabeça") brilha mais, como no efeito clássico
        ctx!.fillStyle = `rgb(${cabeca})`
        ctx!.fillText(letra(), x, py)

        // a letra de cima volta para a cor normal, assim só a ponta fica clara
        ctx!.fillStyle = `rgba(${cor}, ${0.5 + Math.random() * 0.4})`
        ctx!.fillText(letra(), x, py - tamanho)

        if (py > canvas!.height && Math.random() > 0.975) colunas[i] = 0
        else colunas[i] = y + 1
      })
    }

    ajustar()
    window.addEventListener('resize', ajustar)

    // Roda a ~20 quadros por segundo; no modo rápido, a cada quadro
    let id = 0
    function loop() {
      quadro++
      if (rapidaRef.current || quadro % 3 === 0) desenhar()
      id = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('resize', ajustar)
    }
  }, [tema, intensidade, transparente])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
