import { interesses } from '../data/interesses'
import './Interesses.css'

function Interesses() {
    return (
        <section id="interesses" className="secao secao--alt">
        <div className="container">
            <h2 className="secao-titulo">Áreas de interesse</h2>
            <p className="secao-intro">O que quero explorar e por que isso me atrai.</p>

            <div className="interesses-grade">
            {interesses.map((i) => (
                <article key={i.id} className="interesse">
                <h3>{i.titulo}</h3>
                <p>{i.descricao}</p>
                </article>
            ))}
            </div>
        </div>
        </section>
    )
    }

export default Interesses
