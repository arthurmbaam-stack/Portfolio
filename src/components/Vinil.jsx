import { useRef, useState, useEffect } from 'react'
import './Vinil.css'

function Vinil({ iniciais = 'AM', girando = true }) {
    const discoRef = useRef(null)
    const [rotacao, setRotacao] = useState(0)
    const [arrastando, setArrastando] = useState(false)
    const anguloAnterior = useRef(0)

    const calcularAngulo = (evento, elemento) => {
        const rect = elemento.getBoundingClientRect()
        const centroX = rect.left + rect.width / 2
        const centroY = rect.top + rect.height / 2
        const x = evento.clientX - centroX
        const y = evento.clientY - centroY
        return Math.atan2(y, x) * (180 / Math.PI)
    }

    const handleMouseDown = (e) => {
        setArrastando(true)
        anguloAnterior.current = calcularAngulo(e, discoRef.current)
    }

    const handleMouseMove = (e) => {
        if (!arrastando) return
        
        const anguloAtual = calcularAngulo(e, discoRef.current)
        let delta = anguloAtual - anguloAnterior.current
        
        // Corrigir salto de 360° para -360°
        if (delta > 180) delta -= 360
        if (delta < -180) delta += 360
        
        setRotacao(prev => prev + delta)
        anguloAnterior.current = anguloAtual
    }

    const handleMouseUp = () => {
        setArrastando(false)
    }

    useEffect(() => {
        if (arrastando) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
            
            return () => {
                window.removeEventListener('mousemove', handleMouseMove)
                window.removeEventListener('mouseup', handleMouseUp)
            }
        }
    }, [arrastando])

    return (
        <div 
            ref={discoRef}
            className={`disco ${girando ? 'disco--girando' : ''} ${arrastando ? 'disco--arrastando' : ''}`}
            style={{ transform: `rotate(${rotacao}deg)` }}
            onMouseDown={handleMouseDown}
            aria-hidden="true"
        >
            <div className="disco-etiqueta">
                <span>{iniciais}</span>
                <div className="disco-furo" />
            </div>
        </div>
    )
}

export default Vinil