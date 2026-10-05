import { useEffect, useState } from 'react'
import './IntroVinil.css'

function IntroVinil({ onFinish }) {
    const [saindo, setSaindo] = useState(false)

    useEffect(() => {
    const iniciarSaida = setTimeout(() => {
        setSaindo(true)
    }, 3200)

    const finalizar = setTimeout(() => {
        onFinish()
    }, 4000)

    return () => {
        clearTimeout(iniciarSaida)
        clearTimeout(finalizar)
    }
    }, [onFinish])

    return (
    <div
        className={`intro-vinil ${saindo ? 'intro-vinil--saindo' : ''}`}
        role="status"
        aria-label="Abrindo o portfólio de Arthur Moraes"
    >
        <div className="intro-conteudo">
        <div className="vinil" aria-hidden="true">
            <div className="vinil-etiqueta">
            <span>AM</span>
            <div className="vinil-furo" />
            </div>
        </div>

        <p className="intro-nome">Arthur Moraes</p>
        <p className="intro-legenda">Cada projeto, uma nova faixa.</p>
        </div>
    </div>
    )
}

export default IntroVinil