import { useEffect, useRef, useState } from 'react'
import { certificados } from '../data/certificados'
import { publico } from '../utils/publico'
import './Certificados.css'

const ehImagem = (arquivo) => /\.(png|jpe?g|webp|gif|svg)$/i.test(arquivo)

function Certificados() {
    const [aberto, setAberto] = useState(null)
    const dialogo = useRef(null)

    // Abre o diálogo depois que o conteúdo foi desenhado, para o foco ir ao botão "Fechar"
    useEffect(() => {
    const caixa = dialogo.current
    if (aberto && caixa && !caixa.open) caixa.showModal()
    }, [aberto])

    function fechar() {
    dialogo.current?.close()
    }

    // Clique fora da caixa (no fundo escuro) também fecha
    function aoClicarNoFundo(evento) {
    if (evento.target === dialogo.current) fechar()
    }

    const caminho = aberto ? publico(aberto.arquivo) : ''

    return (
    <article className="pagina container">
        <header className="pagina-topo">
        <p className="pagina-faixa">Faixa 03</p>
        <h1 className="pagina-titulo" tabIndex={-1}>Certificados</h1>
        <p className="pagina-intro">Cursos e formações que complementam meus estudos.</p>
        </header>

        <ul className="cert-grade">
        {certificados.map((c) => (
            <li key={c.id} className="cert-card papel">
            <h2>{c.nome}</h2>
            <p>{c.instituicao}</p>
            <p className="cert-data">{c.data}</p>
            <div className="cert-acoes">
                <button
                type="button"
                className="botao botao--primario"
                onClick={() => setAberto(c)}
                >
                Visualizar<span className="visualmente-oculto"> {c.nome}</span>
                </button>
                <a
                href={publico(c.arquivo)}
                target="_blank"
                rel="noreferrer"
                className="botao botao--secundario"
                >
                Abrir em nova aba<span className="visualmente-oculto">: {c.nome}</span>
                </a>
            </div>
            </li>
        ))}
        </ul>

        <dialog
        ref={dialogo}
        className="cert-dialogo"
        aria-labelledby="cert-dialogo-titulo"
        onClose={() => setAberto(null)}
        onClick={aoClicarNoFundo}
        >
        {aberto && (
            <div className="cert-dialogo-caixa">
            <div className="cert-dialogo-topo">
                <div>
                <h2 id="cert-dialogo-titulo">{aberto.nome}</h2>
                <p>{aberto.instituicao} · {aberto.data}</p>
                </div>
                <button type="button" className="botao botao--secundario" onClick={fechar}>
                Fechar
                </button>
            </div>

            <div className="cert-dialogo-corpo">
                {ehImagem(aberto.arquivo) ? (
                <img src={caminho} alt={`Certificado: ${aberto.nome}`} />
                ) : (
                <iframe src={caminho} title={`Certificado: ${aberto.nome}`} />
                )}
            </div>

            <p className="cert-dialogo-dica">
                Se o arquivo não aparecer,{' '}
                <a href={caminho} target="_blank" rel="noreferrer">abra em uma nova aba</a>.
            </p>
            </div>
        )}
        </dialog>
    </article>
    )
}

export default Certificados
