import { certificados } from '../data/certificados'
import './Certificados.css'

function Certificados() {
    return (
    <section id="certificados" className="secao">
        <div className="container">
        <h2 className="secao-titulo">Certificados</h2>
        <p className="secao-intro">Cursos e formações que complementam meus estudos.</p>

        <ul className="cert-grade">
            {certificados.map((c) => (
            <li key={c.id} className="cert-card papel">
                <h3>{c.nome}</h3>
                <p>{c.instituicao}</p>
                <p className="cert-data">{c.data}</p>
                <a href={c.arquivo} target="_blank" rel="noreferrer" className="botao botao--secundario">
                Ver certificado
                </a>
            </li>
            ))}
        </ul>
        </div>
    </section>
    )
}

export default Certificados
