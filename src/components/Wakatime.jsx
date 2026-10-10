import { useEffect, useState } from 'react'
import {
    fetchWakaTimeStats,
    formatDuration,
    formatDate,
    formatPercent,
} from '../utils/Wakatime'
import {
    FaJsSquare,
    FaJava,
    FaPython,
    FaCss3Alt,
    FaHtml5,
    FaCode,
} from 'react-icons/fa'

const ICONES_LINGUAGENS = {
    JavaScript: FaJsSquare,
    Java: FaJava,
    Python: FaPython,
    CSS: FaCss3Alt,
    HTML: FaHtml5,
}
function Grafico({ titulo, itens }) {
    if (!itens?.length) return null

    return (
        <section className="waka-grafico papel">
            <h3>{titulo}</h3>

            <ul className="waka-barras">
                {itens.slice(0, 6).map((item) => (
                    <li key={item.name}>
                        <div className="waka-barra-topo">
                            <strong>{item.name}</strong>
                            <span>{formatPercent(item.percent)}</span>
                        </div>

                        <div className="waka-barra-trilho" aria-hidden="true">
                            <span
                                style={{
                                    width: `${Math.min(
                                        100,
                                        Math.max(0, item.percent),
                                    )}%`,
                                }}
                            />
                        </div>

                        <small>{formatDuration(item.seconds)}</small>
                    </li>
                ))}
            </ul>
        </section>
    )
}
function LinguagensWaka({ itens }) {
    if (!itens?.length) return null

    return (
        <section className="waka-linguagens">
            <h3 className="subtitulo">Linguagens na minha rotina</h3>

            <p className="gh-nota">
                Distribuição do tempo registrado no compartilhamento
                de linguagens do WakaTime.
            </p>

            <ul className="waka-aneis">
                {itens.map((item) => {
                    const Icone = ICONES_LINGUAGENS[item.name] ?? FaCode
                    const nome = item.name === 'Other'
                        ? 'Outras'
                        : item.name

                    return (
                        <li key={item.name} className="waka-anel-card papel">
                            <div className="waka-anel">
                                <svg
                                    viewBox="0 0 80 80"
                                    aria-hidden="true"
                                >
                                    <circle
                                        className="waka-anel-trilho"
                                        cx="40"
                                        cy="40"
                                        r="34"
                                    />

                                    <circle
                                        className="waka-anel-progresso"
                                        cx="40"
                                        cy="40"
                                        r="34"
                                        pathLength="100"
                                        strokeDasharray={`${item.percent} 100`}
                                    />
                                </svg>

                                <Icone
                                    className="waka-anel-icone"
                                    aria-hidden="true"
                                />
                            </div>

                            <h4>{nome}</h4>
                            <span>{formatPercent(item.percent)}</span>
                        </li>
                    )
                })}
            </ul>
        </section>
    )
}

function WakaTime() {
    const [dados, setDados] = useState(null)
    const [erro, setErro] = useState(false)
    const [tentativa, setTentativa] = useState(0)

    useEffect(() => {
        let ativo = true

        fetchWakaTimeStats()
            .then((resultado) => {
                if (ativo) setDados(resultado)
            })
            .catch(() => {
                if (ativo) setErro(true)
            })

        return () => {
            ativo = false
        }
    }, [tentativa])

    function tentarNovamente() {
        setErro(false)
        setDados(null)
        setTentativa((valor) => valor + 1)
    }

    if (erro) {
        return (
            <div className="gh-estado papel" role="alert">
                <p>Não foi possível carregar as estatísticas do WakaTime.</p>

                <button
                    type="button"
                    className="botao botao--secundario"
                    onClick={tentarNovamente}
                >
                    Tentar novamente
                </button>
            </div>
        )
    }

    if (!dados) {
        return <p role="status">Carregando dados do WakaTime…</p>
    }

    return (
        <section className="waka" aria-label="Estatísticas do WakaTime">
            <p className="gh-resumo">
                Meu tempo de programação registrado pelo WakaTime.
            </p>

            <div className="waka-grade">
                <div className="waka-card papel">
                    <span className="waka-faixa">01 · Tempo registrado</span>
                    <h3>Horas de programação</h3>
                    <strong>{formatDuration(dados.totalSeconds)}</strong>
                    <p>Tempo de atividade registrado no editor.</p>
                </div>

                <div className="waka-card papel">
                    <span className="waka-faixa">02 · Rotina</span>
                    <h3>Média diária</h3>
                    <strong>{formatDuration(dados.dailyAverage)}</strong>
                    <p>Média calculada pelo WakaTime.</p>
                </div>

                {dados.bestDay && (
                    <div className="waka-card papel">
                        <span className="waka-faixa">03 · Maior atividade</span>
                        <h3>Dia com mais tempo</h3>
                        <strong>
                            {formatDuration(dados.bestDay.seconds)}
                        </strong>
                        <p>{formatDate(dados.bestDay.date)}</p>
                    </div>
                )}

                {dados.totalDays != null && (
                    <div className="waka-card papel">
                        <span className="waka-faixa">04 · Histórico</span>
                        <h3>Período acompanhado</h3>
                        <strong>{dados.totalDays} dias</strong>
                        <p>Inclui dias sem atividade.</p>
                    </div>
                )}
            </div>

            {dados.since && dados.until && (
                <p className="gh-nota">
                    Período: {formatDate(dados.since)} a{' '}
                    {formatDate(dados.until)}.
                </p>
            )}

            <LinguagensWaka itens={dados.languages} />

            <Grafico
                titulo="Editores utilizados"
                itens={dados.editors}
            />
        </section>
    )
}

export default WakaTime