import { perfil } from '../data/perfil'
import { experiencias } from '../data/experiencias'
import { interesses } from '../data/interesses'
import { publico } from '../utils/publico'
import './Sobre.css'

function Sobre() {
    return (
    <article className="pagina container">
        <header className="pagina-topo">
        <p className="pagina-faixa">Faixa 01</p>
        <h1 className="pagina-titulo" tabIndex={-1}>Sobre mim</h1>
        </header>

        <div className="sobre-grade">
        <aside className="sobre-lateral">
            <figure className="sobre-foto papel">
            <img
                src={perfil.foto}
                alt={perfil.fotoAlt}
                width="1254"
                height="1254"
                decoding="async"
            />
            <figcaption>
                <strong>{perfil.nome}</strong>
                <span>{perfil.cargo}</span>
            </figcaption>
            </figure>

            <a href={publico(perfil.curriculo)} download className="botao botao--primario">
            Baixar currículo
            </a>
        </aside>

        <div className="sobre-conteudo">
            <section aria-labelledby="sobre-trajetoria">
            <h2 id="sobre-trajetoria" className="subtitulo">Trajetória</h2>
            <div className="sobre-texto">
                {perfil.sobre.map((p) => <p key={p}>{p}</p>)}
            </div>
            </section>

            <section aria-labelledby="sobre-formacao">
            <h2 id="sobre-formacao" className="subtitulo">Formação</h2>
            <ul className="sobre-formacao">
                {perfil.formacao.map((f) => (
                <li key={f.curso} className="papel">
                    <strong>{f.curso}</strong>
                    <p>{f.instituicao}</p>
                    <p className="sobre-periodo">{f.periodo}</p>
                </li>
                ))}
            </ul>
            </section>

            <section aria-labelledby="sobre-experiencias">
            <h2 id="sobre-experiencias" className="subtitulo">Experiências</h2>
            <p className="sobre-nota">Minha trajetória até aqui, com o que fiz e o que aprendi.</p>
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
            </section>

            <section aria-labelledby="sobre-interesses">
            <h2 id="sobre-interesses" className="subtitulo">Áreas de interesse</h2>
            <p className="sobre-nota">O que quero explorar e por que isso me atrai.</p>
            <div className="interesses-grade">
                {interesses.map((i) => (
                <article key={i.id} className="interesse">
                    <h3>{i.titulo}</h3>
                    <p>{i.descricao}</p>
                </article>
                ))}
            </div>
            </section>

            <section aria-labelledby="sobre-objetivos">
            <h2 id="sobre-objetivos" className="subtitulo">Objetivos profissionais</h2>
            <div className="sobre-texto">
                <p>{perfil.objetivos}</p>
            </div>
            </section>
        </div>
        </div>
    </article>
    )
}

export default Sobre
