import './Vinil.css'

// Disco reutilizável. Depois, o player vai controlar a prop "girando".
function Vinil({ iniciais = 'AM', girando = true, legenda = 'SIDE A · PORTFÓLIO' }) {
    return (
    <div className={`disco ${girando ? 'disco--girando' : ''}`} aria-hidden="true">
        <div className="disco-etiqueta">
            <span>{iniciais}</span>
            <small>{legenda}</small>
            <div className="disco-furo" />
        </div>
    </div>
    )
}

export default Vinil
