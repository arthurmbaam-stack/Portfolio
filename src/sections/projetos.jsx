import { projetos } from '../data/projetos'
import './Projetos.css'

function Projetos() {
    return (
        <section id="projetos" className="secao">
        <div className="container">
            <h2 className="secao-titulo">Projetos</h2>
            <p className="secao-intro">Cada projeto, uma nova faixa. Do mais antigo ao mais recente.</p>

            <ol className="projetos-lista">
            {projetos.map((p, i) => (
                <li key={p.id} className="projeto">
                <div
                    className="projeto-capa papel"
                    style={{ '--cor-capa': p.cor }}
                    role="img"
                    aria-label={`Capa do projeto ${p.titulo}`}
                >
                    {p.imagem ? (
                    <img src={p.imagem} alt="" />
                    ) : (
                    <span className="projeto-inicial">{p.titulo.charAt(0)}</span>
                    )}
                    <span className="projeto-faixa">{String(i + 1).padStart(2, '0')}</span>
                </div>

                <div className="projeto-info">
                    <h3>{p.titulo}</h3>
                    <p className="projeto-meta">{p.ano} · {p.tipo}</p>
                    <p>{p.descricao}</p>

                    {p.contribuicao && (
                    <div className="projeto-contribuicao">
                        <strong>Minha contribuição</strong>
                        <p>{p.contribuicao}</p>
                    </div>
                    )}

                    <div className="projeto-tags">
                    {p.tecnologias.map((t) => <span key={t} className="tag">{t}</span>)}
                    </div>

                    <div className="projeto-links">
                    {p.repositorio && <a href={p.repositorio} target="_blank" rel="noreferrer">Código</a>}
                    {p.demo && <a href={p.demo} target="_blank" rel="noreferrer">Ver online</a>}
                    </div>
                </div>
                </li>
            ))}
            </ol>
        </div>
        </section>
    )
}

export default Projetos
