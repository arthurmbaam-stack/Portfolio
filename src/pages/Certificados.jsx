import { certificados } from '../data/certificados'
import './Certificados.css'

function Certificados() {
    return (
        <article className="pagina container">
            <header className="pagina-topo">
                <p className="pagina-faixa">Faixa 03</p>
                <h1 className="pagina-titulo" tabIndex={-1}>
                    Certificados
                </h1>
                <p className="pagina-intro">
                    Cursos e experiências que complementam minha formação.
                </p>
            </header>

            <ul className="cert-grade">
                {certificados.map((c) => (
                    <li key={c.id} className="cert-card papel">
                        <a
                            href={c.arquivo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cert-previa"
                            aria-label={`Abrir certificado: ${c.nome}`}
                        >
                            <img
                                src={c.previa}
                                alt={`Prévia do certificado: ${c.nome}`}
                                loading="lazy"
                            />
                        </a>

                        <h2>{c.nome}</h2>
                        <p>{c.instituicao}</p>
                        <p className="cert-data">{c.data}</p>

                        <div className="cert-acoes">
                            <a
                                href={c.arquivo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="botao botao--primario"
                            >
                                Abrir PDF
                                <span className="visualmente-oculto">
                                    : {c.nome}
                                </span>
                            </a>
                        </div>
                    </li>
                ))}
            </ul>
        </article>
    )
}

export default Certificados