import { musicas } from '../data/musicas'
import './Musicas.css'

function Musicas() {
    return (
        <section id="musicas" className="secao">
        <div className="container">
            <h2 className="secao-titulo">Músicas favoritas</h2>
            <p className="secao-intro">Uma pequena seleção da minha coleção, com comentários.</p>

            <ul className="musicas-lista">
            {musicas.map((m) => (
                <li key={m.id} className="musica">
                <div className="musica-disco" aria-hidden="true" />
                <div>
                    <h3>{m.titulo}</h3>
                    <p className="musica-artista">{m.artista}</p>
                    <p>{m.comentario}</p>
                    <a href={m.link} target="_blank" rel="noreferrer">Ouvir</a>
                </div>
                </li>
            ))}
            </ul>
        </div>
        </section>
    )
}

export default Musicas
