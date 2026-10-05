import { experiencias } from '../data/experiencias'
import './Experiencias.css'

function Experiencias() {
    return (
    <section id="experiencias" className="secao secao--alt">
        <div className="container">
            <h2 className="secao-titulo">Experiências</h2>
            <p className="secao-intro">Minha trajetória até aqui, com o que fiz e o que aprendi.</p>

            <ol className="exp-lista">
            {experiencias.map((e) => (
            <li key={e.id} className="exp-item">
                <p className="exp-periodo">{e.periodo}</p>
                <div>
                    <h3>{e.cargo}</h3>
                    <p className="exp-local">{e.local}</p>
                    <ul>
                        {e.atividades.map((a) => <li key={a}>{a}</li>)}
                    </ul>
                    <p className="exp-aprendizado"><strong>Aprendizado:</strong> {e.aprendizados}</p>
                </div>
            </li>
            ))}
        </ol>
        </div>
    </section>
    )
}

export default Experiencias
