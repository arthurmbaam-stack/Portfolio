import { useRef, useState } from 'react'
import { musicas } from '../data/musicas'
import { publico } from '../utils/publico'
import { embedSpotify } from '../utils/spotify'
import './Musicas.css'

function formatarTempo(segundos) {
    if (!Number.isFinite(segundos)) return '0:00'
    const total = Math.floor(segundos)
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

function Musicas() {
    const [indice, setIndice] = useState(0)
    const [tocando, setTocando] = useState(false)
    const [querTocar, setQuerTocar] = useState(false)
    const [tempo, setTempo] = useState(0)
    const [duracao, setDuracao] = useState(0)
    const [volume, setVolume] = useState(0.8)
    const audioRef = useRef(null)

    const atual = musicas[indice]
    const embed = atual && !atual.arquivo ? embedSpotify(atual.link) : null
    const modo = atual?.arquivo ? 'local' : embed ? 'spotify' : 'nenhum'

    function escolher(novo, tocar = true) {
    setIndice(novo)
    setQuerTocar(tocar)
    setTocando(false)
    setTempo(0)
    setDuracao(0)
    }

    function anterior() {
    escolher((indice - 1 + musicas.length) % musicas.length, tocando || querTocar)
    }

    function proxima() {
    escolher((indice + 1) % musicas.length, tocando || querTocar)
    }

    function alternar() {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
        setQuerTocar(true)
        audio.play().catch(() => setTocando(false))
    } else {
        setQuerTocar(false)
        audio.pause()
    }
    }

    function aoTerminar() {
    if (indice < musicas.length - 1) escolher(indice + 1, true)
    else {
        setTocando(false)
        setQuerTocar(false)
    }
    }

    function buscar(evento) {
    const valor = Number(evento.target.value)
    setTempo(valor)
    if (audioRef.current) audioRef.current.currentTime = valor
    }

    function mudarVolume(evento) {
    const valor = Number(evento.target.value)
    setVolume(valor)
    if (audioRef.current) audioRef.current.volume = valor
    }

    return (
    <article className="pagina container">
        <header className="pagina-topo">
        <p className="pagina-faixa">Faixa 04</p>
        <h1 className="pagina-titulo" tabIndex={-1}>Músicas</h1>
        <p className="pagina-intro">
            Uma pequena seleção da minha coleção, com comentários.
        </p>
        </header>

        {atual && (
        <section className="player papel" aria-label="Reprodutor de músicas">
            <div
            className={`player-disco ${tocando ? 'player-disco--tocando' : ''}`}
            aria-hidden="true"
            >
            <span className="player-rotulo">{String(indice + 1).padStart(2, '0')}</span>
            </div>

            <div className="player-painel">
            <p className="player-faixa">
                Faixa {indice + 1} de {musicas.length}
            </p>
            <h2 className="player-titulo">{atual.titulo}</h2>
            <p className="player-artista">{atual.artista}</p>

            {modo === 'local' && (
                <audio
                key={atual.id}
                ref={(el) => {
                    audioRef.current = el
                    if (el) el.volume = volume
                }}
                src={publico(atual.arquivo)}
                autoPlay={querTocar}
                preload="metadata"
                onPlay={() => setTocando(true)}
                onPause={() => setTocando(false)}
                onTimeUpdate={(e) => setTempo(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuracao(e.currentTarget.duration)}
                onEnded={aoTerminar}
                />
            )}

            <div className="player-controles">
                <button
                type="button"
                className="player-botao"
                onClick={anterior}
                aria-label="Música anterior"
                disabled={musicas.length < 2}
                >
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h2v14H6zM20 5v14L9.5 12z" /></svg>
                </button>

                {modo === 'local' && (
                <button
                    type="button"
                    className="player-botao player-botao--principal"
                    onClick={alternar}
                    aria-label={tocando ? 'Pausar' : 'Tocar'}
                >
                    {tocando ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>
                    ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                    )}
                </button>
                )}

                <button
                type="button"
                className="player-botao"
                onClick={proxima}
                aria-label="Próxima música"
                disabled={musicas.length < 2}
                >
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 5h2v14h-2zM4 5l10.5 7L4 19z" /></svg>
                </button>
            </div>

            {modo === 'local' && (
                <div className="player-barras">
                <div className="player-progresso">
                    <span className="player-tempo">{formatarTempo(tempo)}</span>
                    <input
                    type="range"
                    min="0"
                    max={duracao || 0}
                    step="0.1"
                    value={Math.min(tempo, duracao || 0)}
                    onChange={buscar}
                    aria-label="Progresso da música"
                    aria-valuetext={`${formatarTempo(tempo)} de ${formatarTempo(duracao)}`}
                    disabled={!duracao}
                    />
                    <span className="player-tempo">{formatarTempo(duracao)}</span>
                </div>
                <label className="player-volume">
                    <span>Volume</span>
                    <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={mudarVolume}
                    />
                </label>
                </div>
            )}

            {modo === 'spotify' && (
                <iframe
                key={atual.id}
                className="player-spotify"
                src={embed}
                title={`Player do Spotify: ${atual.titulo}`}
                height="152"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                />
            )}

            {modo === 'nenhum' && (
                <p className="player-aviso">
                Esta faixa não tem player no site.{' '}
                <a href={atual.link} target="_blank" rel="noreferrer">Ouvir em outro lugar</a>
                </p>
            )}
            </div>
        </section>
        )}

        <h2 className="subtitulo musicas-subtitulo">Lista de faixas</h2>
        <ol className="musicas-lista">
        {musicas.map((m, i) => (
            <li key={m.id} className={`musica ${i === indice ? 'musica--atual' : ''}`}>
            <button
                type="button"
                className="musica-disco"
                onClick={() => escolher(i, Boolean(m.arquivo))}
                aria-label={`Selecionar ${m.titulo}, de ${m.artista}`}
                aria-pressed={i === indice}
            >
                <span>{String(i + 1).padStart(2, '0')}</span>
            </button>
            <div>
                <h3>{m.titulo}</h3>
                <p className="musica-artista">{m.artista}</p>
                <p className="musica-comentario">{m.comentario}</p>
                <a href={m.link} target="_blank" rel="noreferrer">
                Ouvir<span className="visualmente-oculto"> {m.titulo} (abre em nova aba)</span>
                </a>
            </div>
            </li>
        ))}
        </ol>
    </article>
    )
}

export default Musicas
