import { projetos } from '../data/projetos'
import './Projetos.css'

// Linha do tempo: do projeto mais antigo ao mais recente.
// A ordenação é estável, então projetos do mesmo ano mantêm a ordem do arquivo de dados.
const ordenados = [...projetos].sort((a, b) => Number(a.ano) - Number(b.ano))

function Projetos() {
    return (
    <article className="pagina container">
        <header className="pagina-topo">
        <p className="pagina-faixa">Faixa 02</p>
        <h1 className="pagina-titulo" tabIndex={-1}>Projetos</h1>
        <p className="pagina-intro">
            Lista de projetos desenvolvidos ao longo da minha trajetória.
        </p>
        </header>

        <ol className="projetos-lista">
        {ordenados.map((p, i) => (
            <li key={p.id} className="projeto">
            <div className="projeto-marco">
                <span className="projeto-ano">{p.ano}</span>
            </div>

            <div className="projeto-corpo">
                <div
                className="projeto-capa papel"
                style={{ '--cor-capa': p.cor }}
                role="img"
                aria-label={`Capa do projeto ${p.titulo}`}
                >
                {p.imagem ? (
                    <img className="projeto-img" src={p.imagem} alt="" />
                ) : (
                    <span className="projeto-inicial">{p.titulo.charAt(0)}</span>
                )}
                <span className="projeto-faixa">{String(i + 1).padStart(2, '0')}</span>
                </div>

                <div className="projeto-info">
                <h2>{p.titulo}</h2>
                <p className="projeto-meta">{p.tipo}</p>
                <p>{p.descricao}</p>

                {p.contribuicao && (
                    <div className="projeto-contribuicao">
                    <strong>Minha contribuição</strong>
                    <p>{p.contribuicao}</p>
                    </div>
                )}

                <ul className="projeto-tags" aria-label="Tecnologias">
                    {p.tecnologias.map((t) => (
                    <li key={t}><span className="tag">{t}</span></li>
                    ))}
                </ul>

                {(p.repositorio || p.demo) && (
                    <ul className="projeto-links">
                    {p.repositorio && (
                        <li>
                        <a href={p.repositorio} target="_blank" rel="noreferrer">
                            Ver no GitHub<span className="visualmente-oculto"> ({p.titulo}, abre em nova aba)</span>
                        </a>
                        </li>
                    )}
                    {p.demo && (
                        <li>
                        <a href={p.demo} target="_blank" rel="noreferrer">
                            Ver demonstração<span className="visualmente-oculto"> ({p.titulo}, abre em nova aba)</span>
                        </a>
                        </li>
                    )}
                    </ul>
                )}
                </div>
            </div>
            </li>
        ))}
        </ol>
    </article>
    )
}

export default Projetos
