import { Component,
    useEffect,
    useMemo,
    useRef,
    useState } from 'react'
import {
    FaCodeBranch,
    FaGithub,
    FaStar } from 'react-icons/fa'
import CONFIG from '../config/GithubConfig'
import {
    SECOES,
    SECAO_PADRAO,
    DIAS_SEMANA,
    ORDEM_SEMANA,
    CORES_LINGUAGENS,
    COR_OUTRAS,
    TEXTOS,
    METODOLOGIA,
} from '../data/github'
import {
    GitHubLimiteError,
    agruparOutras,
    commitsFonte,
    contagensFonte,
    contribuicoesFonte,
    perfilFonte,
    resumirLinguagens,
} from '../utils/GithubStats'
import './Github.css'
import {
    fetchWakaTimeStats,
    formatDuration,
    formatDate,
} from '../utils/Wakatime'
import Wakatime from '../components/Wakatime'


const { USUARIO, URL_PERFIL, IDIOMA, FUSO_HORARIO, LIMITES } = CONFIG

/* =====================================================================
   Formatação (português do Brasil, fuso de São Paulo)
   ===================================================================== */

const fNumero = new Intl.NumberFormat(IDIOMA)
const fPercentual = new Intl.NumberFormat(IDIOMA, { maximumFractionDigits: 1 })
const fDiaMes = new Intl.DateTimeFormat(IDIOMA, { day: 'numeric', month: 'short', timeZone: 'UTC' })
const fData = new Intl.DateTimeFormat(IDIOMA, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const fMes = new Intl.DateTimeFormat(IDIOMA, { month: 'short', timeZone: 'UTC' })
const fHoraMinuto = new Intl.DateTimeFormat(IDIOMA, { hour: '2-digit', minute: '2-digit', timeZone: FUSO_HORARIO })

const meioDia = (chave) => new Date(`${chave}T12:00:00Z`)
const numero = (valor) => fNumero.format(Math.round(valor))
const percentual = (valor) => `${fPercentual.format(valor)}%`
const diaMes = (chave) => (chave ? fDiaMes.format(meioDia(chave)).replace('.', '') : '')
const data = (chave) => (chave ? fData.format(meioDia(chave)).replaceAll('.', '') : '')
const mes = (chave) => fMes.format(meioDia(chave)).replace('.', '')
const hora = (h) => `${h}h`
const faixaHora = (h) => `${hora(h)}–${hora((h + 1) % 24)}`
const plural = (n, singular, pluralTexto) => `${numero(n)} ${n === 1 ? singular : pluralTexto}`

/* =====================================================================
   Busca de dados e estados (carregando, erro, limite)
   ===================================================================== */

// Cada fonte é buscada uma vez por visita (cache em githubStats.js): trocar de
// aba reaproveita o que já chegou, sem nova consulta.
function useFonte(fonte) {
    const [estado, setEstado] = useState(() => {
        const dados = fonte.peek()
        return dados ? { status: 'pronto', dados } : { status: 'carregando' }
    })
    const [tentativa, setTentativa] = useState(0)

    useEffect(() => {
        if (fonte.peek()) return undefined
        let ativo = true
        fonte
            .carregar()
            .then((dados) => ativo && setEstado({ status: 'pronto', dados }))
            .catch((erro) => {
                if (!ativo) return
                const limite = erro instanceof GitHubLimiteError
                setEstado({ status: limite ? 'limite' : 'erro', erro })
            })
        return () => {
            ativo = false
        }
    }, [fonte, tentativa])

    const tentarDeNovo = () => {
        setEstado({ status: 'carregando' })
        setTentativa((n) => n + 1)
    }
    return { ...estado, tentarDeNovo }
}

const quandoLibera = (erro) => (erro?.resetEm ? fHoraMinuto.format(erro.resetEm) : null)

function Estado({ estado }) {
    const { status, erro, tentarDeNovo } = estado
    if (status === 'carregando') {
        return (
            <p className="gh-estado" role="status">
                {TEXTOS.carregando}
            </p>
        )
    }
    const liberaAs = status === 'limite' ? quandoLibera(erro) : null
    return (
        <div className={`gh-estado gh-estado--${status} papel`} role="alert">
            <p>
                {status === 'limite' ? TEXTOS.limite : TEXTOS.erro}
                {liberaAs && ` Liberação prevista: ${liberaAs} (horário de Brasília).`}
            </p>
            <button type="button" className="botao botao--secundario" onClick={tentarDeNovo}>
                {TEXTOS.tentarDeNovo}
            </button>
        </div>
    )
}

function Vazio({ children = TEXTOS.vazio }) {
    return (
        <p className="gh-vazio" role="status">
            {children}
        </p>
    )
}

// Se a API mandar algo num formato inesperado, o erro fica só na seção
class SecaoComErro extends Component {
    state = { falhou: false }
    static getDerivedStateFromError() {
        return { falhou: true }
    }
    componentDidCatch(erro) {
        console.error('GitHub:', erro)
    }
    render() {
        return this.state.falhou ? (
            <div className="gh-estado gh-estado--erro papel" role="alert">
                <p>{TEXTOS.erro}</p>
            </div>
        ) : (
            this.props.children
        )
    }
}

/* =====================================================================
   Colunas (contribuições por ano, commits por hora)
   ===================================================================== */

// O maior valor fica destacado e com o número em cima. Passar o mouse, tocar ou
// usar ← → (com o gráfico focado) mostra o valor de cada coluna na linha de leitura.
// A tabela escondida leva os mesmos valores ao leitor de tela.
function Colunas({ itens, valor, leitura, eixo, topo, legenda, classe = '' }) {
    const [ativo, setAtivo] = useState(null)
    if (itens.length === 0) return null

    const valores = itens.map(valor)
    const maximo = Math.max(...valores, 0) || 1
    const pico = valores.indexOf(Math.max(...valores))
    const mostrado = ativo ?? pico

    const aoTeclar = (evento) => {
        const passo = { ArrowRight: 1, ArrowLeft: -1 }[evento.key]
        if (!passo) return
        evento.preventDefault()
        setAtivo((atual) => Math.min(itens.length - 1, Math.max(0, (atual ?? pico) + passo)))
    }

    return (
        <figure className={`gh-colunas ${classe}`}>
            <figcaption className="gh-leitura" aria-hidden="true">
                {leitura(itens[mostrado], mostrado)}
            </figcaption>
            <div
                className="gh-colunas-area"
                role="img"
                aria-label={legenda}
                tabIndex={0}
                onKeyDown={aoTeclar}
                onBlur={() => setAtivo(null)}
                onPointerLeave={() => setAtivo(null)}
                style={{ '--n': itens.length }}
            >
                {itens.map((item, indice) => (
                    <div
                        key={indice}
                        className={['gh-coluna', indice === pico && 'gh-coluna--pico', indice === ativo && 'gh-coluna--ativa']
                            .filter(Boolean)
                            .join(' ')}
                        style={{ '--h': `${(valores[indice] / maximo) * 100}%`, '--i': indice }}
                        onPointerEnter={() => setAtivo(indice)}
                        onPointerDown={() => setAtivo(indice)}
                    >
                        {indice === pico && valores[indice] > 0 && (
                            <span className="gh-coluna-topo">{topo(item)}</span>
                        )}
                        <span className="gh-coluna-barra" />
                    </div>
                ))}
            </div>
            <div className="gh-colunas-eixo" aria-hidden="true" style={{ '--n': itens.length }}>
                {itens.map((item, indice) => (
                    <span key={indice}>{eixo(item, indice)}</span>
                ))}
            </div>
            {/* A div é que fica escondida: um <table> ignora overflow e alargaria a página */}
            <div className="visualmente-oculto">
                <table>
                    <caption>{legenda}</caption>
                    <tbody>
                        {itens.map((item, indice) => (
                            <tr key={indice}>
                                <td>{leitura(item, indice)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </figure>
    )
}

/* =====================================================================
   Resumo: perfil + indicadores
   ===================================================================== */

function Perfil({ usuario }) {
    const meta = [
        usuario.empresa,
        usuario.local,
        usuario.criadoEm && `No GitHub desde ${usuario.criadoEm.slice(0, 4)}`,
    ].filter(Boolean)

    return (
        <div className="gh-perfil papel">
            <img className="gh-avatar" src={`${usuario.avatar}${usuario.avatar.includes('?') ? '&' : '?'}s=160`} alt="" width="72" height="72" loading="lazy" />
            <div className="gh-perfil-texto">
                <p className="gh-perfil-nome">
                    {usuario.nome}{' '}
                    <a href={usuario.url} target="_blank" rel="noopener noreferrer">
                        <FaGithub aria-hidden="true" /> @{usuario.login}
                        <span className="visualmente-oculto"> (abre em nova aba)</span>
                    </a>
                </p>
                {usuario.bio && <p className="gh-perfil-bio">{usuario.bio}</p>}
                {meta.length > 0 && (
                    <p className="gh-perfil-meta">
                        {meta.map((texto) => (
                            <span key={texto}>{texto}</span>
                        ))}
                    </p>
                )}
            </div>
        </div>
    )
}

function Indicador({ rotulo, estado, valor, nota }) {
    const pronto = estado.status === 'pronto'
    return (
        <li className="gh-indicador papel">
            <span className="gh-indicador-rotulo">{rotulo}</span>
            <span className="gh-indicador-valor">
                {pronto ? valor(estado.dados) : estado.status === 'carregando' ? '…' : '—'}
            </span>
            <span className="gh-indicador-nota">
                {pronto ? nota(estado.dados) : estado.status === 'carregando' ? '\u00a0' : TEXTOS.indisponivel}
            </span>
        </li>
    )
}

function Resumo() {
    const perfil = useFonte(perfilFonte)
    const contribuicoes = useFonte(contribuicoesFonte)
    const commits = useFonte(commitsFonte)
    const contagens = useFonte(contagensFonte)
    const fontes = [
        ['perfil', perfil],
        ['contribuições', contribuicoes],
        ['commits', commits],
        ['pull requests e issues', contagens],
    ]
    const falhas = fontes.filter(([, e]) => e.status === 'erro' || e.status === 'limite')
    const limite = falhas.find(([, e]) => e.status === 'limite')?.[1]

    return (
        <>
            {perfil.status === 'pronto' && <Perfil usuario={perfil.dados.usuario} />}

            <ul className="gh-indicadores">
                <Indicador
                    rotulo="Repositórios públicos"
                    estado={perfil}
                    valor={(p) => numero(p.repos.length)}
                    nota={(p) =>
                        p.forksIgnorados
                            ? `próprios; ${plural(p.forksIgnorados, 'fork ignorado', 'forks ignorados')}`
                            : 'próprios, sem forks'
                    }
                />
                <Indicador rotulo="Estrelas" estado={perfil} valor={(p) => numero(p.estrelas)} nota={() => 'recebidas nos seus repositórios'} />
                <Indicador rotulo="Forks recebidos" estado={perfil} valor={(p) => numero(p.forks)} nota={() => 'cópias dos seus repositórios'} />
                <Indicador
                    rotulo="Seguidores"
                    estado={perfil}
                    valor={(p) => numero(p.usuario.seguidores)}
                    nota={(p) => `seguindo ${numero(p.usuario.seguindo)}`}
                />
                <Indicador
                    rotulo="Contribuições"
                    estado={contribuicoes}
                    valor={(c) => numero(c.janela.total)}
                    nota={(c) => `${data(c.janela.inicio)} a ${data(c.janela.fim)}`}
                />
                <Indicador
                    rotulo="Commits públicos"
                    estado={commits}
                    valor={(c) => numero(c.total)}
                    nota={(c) => `${data(c.inicio)} a ${data(c.fim)}`}
                />
                <Indicador rotulo="Pull requests" estado={contagens} valor={(c) => numero(c.pullRequests)} nota={() => 'públicos, desde sempre'} />
                <Indicador rotulo="Issues" estado={contagens} valor={(c) => numero(c.issues)} nota={() => 'públicas, desde sempre'} />
                <Indicador
                    rotulo="Dias com contribuição"
                    estado={contribuicoes}
                    valor={(c) => numero(c.janela.diasAtivos)}
                    nota={(c) => `${data(c.janela.inicio)} a ${data(c.hoje)}`}
                />
                <Indicador
                    rotulo="Maior sequência"
                    estado={contribuicoes}
                    valor={(c) => plural(c.maiorSequencia.tamanho, 'dia', 'dias')}
                    nota={(c) =>
                        c.maiorSequencia.tamanho
                            ? `${diaMes(c.maiorSequencia.inicio)} – ${data(c.maiorSequencia.fim)}`
                            : 'sem sequência'
                    }
                />
            </ul>

            {falhas.length > 0 && (
                <div className="gh-aviso papel" role="status">
                    <p>
                        Alguns dados não carregaram: {falhas.map(([nome]) => nome).join(', ')}.
                        {limite && quandoLibera(limite.erro) && ` O limite de consultas libera por volta de ${quandoLibera(limite.erro)}.`}
                    </p>
                    <button type="button" className="botao botao--secundario" onClick={() => falhas.forEach(([, e]) => e.tentarDeNovo())}>
                        {TEXTOS.tentarDeNovo}
                    </button>
                </div>
            )}

            <p className="gh-nota">{TEXTOS.diferencaContribuicoes}</p>
        </>
    )
}

/* =====================================================================
   Linguagens: disco com uma fatia por linguagem
   ===================================================================== */

// Disco de vinil: sulcos escuros, fatias coloridas no lugar da área gravada
// e a etiqueta no centro com o total de repositórios.
function DiscoLinguagens({ itens, total }) {
    // Onde cada fatia começa: soma dos percentuais das anteriores
    const inicios = itens.map((_, indice) => itens.slice(0, indice).reduce((soma, i) => soma + i.percentual, 0))
    return (
        <svg className="gh-disco-svg" viewBox="0 0 200 200" aria-hidden="true">
            <circle cx="100" cy="100" r="96" fill="#171717" />
            {[90, 84, 78].map((r) => (
                <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="#303030" strokeWidth="0.8" />
            ))}
            <g transform="rotate(-90 100 100)">
                {itens.map((item, indice) => {
                    const trecho = Math.max(item.percentual - 0.8, 0.3)
                    return (
                        <circle
                            key={item.nome}
                            cx="100"
                            cy="100"
                            r="62"
                            fill="none"
                            strokeWidth="26"
                            pathLength="100"
                            stroke={item.outras ? COR_OUTRAS : CORES_LINGUAGENS[indice % CORES_LINGUAGENS.length]}
                            strokeDasharray={`${trecho} ${100 - trecho}`}
                            strokeDashoffset={-inicios[indice]}
                        />
                    )
                })}
            </g>
            <circle cx="100" cy="100" r="30" fill="#a8b5a0" />
            <text x="100" y="94" textAnchor="middle" fontFamily="Georgia, serif" fontSize="22" fill="#263329">
                {total}
            </text>
            <text x="100" y="118" textAnchor="middle" fontFamily="sans-serif" fontSize="8" letterSpacing="1" fill="#263329">
                REPOS
            </text>
            <circle cx="100" cy="100" r="3" fill="#eee9df" />
        </svg>
    )
}

function LinguagensConteudo({ dados }) {
    const resumo = useMemo(() => resumirLinguagens(dados.repos), [dados])
    const itens = useMemo(() => agruparOutras(resumo.itens), [resumo])

    if (resumo.total === 0) return <Vazio>Nenhum repositório público tem linguagem detectada pelo GitHub.</Vazio>

    return (
        <>
            <p className="gh-resumo">
                Linguagem principal de <strong>{plural(resumo.total, 'repositório público', 'repositórios públicos')}</strong>
                {resumo.semLinguagem > 0 &&
                    ` (${plural(resumo.semLinguagem, 'repositório ficou', 'repositórios ficaram')} de fora por não ter linguagem detectada)`}
                . O gráfico conta repositórios, não linhas de código.
            </p>

            <div className="gh-linguagens">
                <div className="gh-disco" role="img" aria-label={`Disco com ${itens.length} fatias de linguagens, detalhadas na lista ao lado.`}>
                    <DiscoLinguagens itens={itens} total={resumo.total} />
                </div>

                <ul className="gh-legenda">
                    {itens.map((item, indice) => (
                        <li key={item.nome}>
                            <span
                                className="gh-legenda-cor"
                                style={{ background: item.outras ? COR_OUTRAS : CORES_LINGUAGENS[indice % CORES_LINGUAGENS.length] }}
                                aria-hidden="true"
                            />
                            <span className="gh-legenda-nome">{item.nome}</span>
                            <span className="gh-legenda-valor">
                                {plural(item.valor, 'repositório', 'repositórios')} · {percentual(item.percentual)}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    )
}

function Linguagens() {
    return <Wakatime />
}
/* =====================================================================
Atividade: sequências, calendário e contribuições por ano
   ===================================================================== */

function Sequencias({ dados }) {
    const { sequenciaAtual, maiorSequencia, janela, hoje } = dados
    const periodo = (sequencia) =>
        sequencia.tamanho
            ? `${diaMes(sequencia.inicio)} – ${sequencia.fim === hoje ? 'hoje' : data(sequencia.fim)}`
            : 'sem sequência'

    return (
        <div className="gh-sequencias">
            <div className="gh-sequencia papel">
                <span className="gh-sequencia-valor">{numero(janela.total)}</span>
                <span className="gh-sequencia-rotulo">Contribuição total</span>
                <span className="gh-sequencia-nota">
                    {data(janela.inicio)} a {data(janela.fim)}
                </span>
            </div>
            <div className="gh-sequencia papel">
                <span className="gh-sequencia-valor">{plural(sequenciaAtual.tamanho, 'dia', 'dias')}</span>
                <span className="gh-sequencia-rotulo">sequência atual</span>
                <span className="gh-sequencia-nota">{periodo(sequenciaAtual)}</span>
            </div>
            <div className="gh-sequencia papel">
                <span className="gh-sequencia-valor">{plural(maiorSequencia.tamanho, 'dia', 'dias')}</span>
                <span className="gh-sequencia-rotulo">maior sequência (histórico)</span>
                <span className="gh-sequencia-nota">{periodo(maiorSequencia)}</span>
            </div>
        </div>
    )
}

// Cada bolinha é um dia (como um mini disco). Passar o mouse, tocar ou usar as
// setas (com o calendário focado) mostra o dia na linha de baixo.
function Calendario({ dados }) {
    const semanas = dados.calendario.semanas
    const celulas = useMemo(() => semanas.flat(), [semanas])
    const [ativo, setAtivo] = useState(null)

    // Mês no topo da coluna em que ele começa (o rótulo some se ficar espremido)
    const meses = useMemo(() => {
        const inicios = []
        semanas.forEach((semana, indice) => {
            const dia = semana.find((c) => c.dentro) ?? semana[0]
            const chave = dia.data.slice(0, 7)
            const anterior = indice > 0 ? (semanas[indice - 1].find((c) => c.dentro) ?? semanas[indice - 1][0]).data.slice(0, 7) : null
            if (chave !== anterior) inicios.push({ indice, data: dia.data })
        })
        return inicios.filter((m, i) => !inicios[i + 1] || inicios[i + 1].indice - m.indice >= 3)
    }, [semanas])

    const dentro = celulas.filter((c) => c.dentro)
    const melhor = dentro.reduce((topo, c) => (c.quantidade > topo.quantidade ? c : topo), dentro[0])
    const descrever = (c) =>
        c.quantidade
            ? `${data(c.data)}: ${plural(c.quantidade, 'contribuição', 'contribuições')}`
            : `${data(c.data)}: nenhuma contribuição`

    const aoTeclar = (evento) => {
        const passo = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7 }[evento.key]
        if (!passo) return
        evento.preventDefault()
        setAtivo((atual) => {
            const base = atual ?? celulas.length - 1
            const proximo = base + passo
            return proximo < 0 || proximo >= celulas.length || !celulas[proximo].dentro ? base : proximo
        })
    }
    const escolher = (evento) => {
        const indice = evento.target.dataset?.indice
        if (indice !== undefined) setAtivo(Number(indice))
    }

    return (
        <figure className="gh-calendario">
            <p className="gh-resumo">
                <strong>{plural(dados.janela.total, 'contribuição', 'contribuições')}</strong> de {data(dados.janela.inicio)} a{' '}
                {data(dados.janela.fim)}. Inclui commits, pull requests, issues e revisões.
            </p>

            <div className="gh-calendario-rolagem">
                <div className="gh-calendario-quadro">
                    <div className="gh-calendario-meses" aria-hidden="true" style={{ '--semanas': semanas.length }}>
                        {meses.map((m) => (
                            <span key={m.data} style={{ gridColumn: `${m.indice + 1} / span 3` }}>
                                {mes(m.data)}
                            </span>
                        ))}
                    </div>
                    <div className="gh-calendario-dias" aria-hidden="true">
                        {[1, 3, 5].map((dia) => (
                            <span key={dia} style={{ gridRow: dia + 1 }}>
                                {DIAS_SEMANA[dia].curto}
                            </span>
                        ))}
                    </div>
                    <div
                        className="gh-calendario-grade"
                        role="img"
                        aria-label={`Calendário de contribuições de ${data(dados.janela.inicio)} a ${data(dados.janela.fim)}, com ${plural(dados.janela.total, 'contribuição', 'contribuições')}. ${melhor?.quantidade ? `Dia mais ativo: ${descrever(melhor)}.` : ''}`}
                        tabIndex={0}
                        onKeyDown={aoTeclar}
                        onPointerOver={escolher}
                        onPointerDown={escolher}
                        onPointerLeave={() => setAtivo(null)}
                        onBlur={() => setAtivo(null)}
                    >
                        {celulas.map((celula, indice) => (
                            <span
                                key={celula.data}
                                className={['gh-celula', indice === ativo && 'gh-celula--ativa', !celula.dentro && 'gh-celula--fora']
                                    .filter(Boolean)
                                    .join(' ')}
                                data-nivel={celula.nivel}
                                data-indice={celula.dentro ? indice : undefined}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="gh-calendario-rodape">
                <figcaption className="gh-leitura" aria-hidden="true">
                    {ativo !== null ? descrever(celulas[ativo]) : melhor?.quantidade > 0 && `Dia mais ativo: ${descrever(melhor)}`}
                </figcaption>
                <span className="gh-calendario-legenda" aria-hidden="true">
                    menos
                    {[0, 1, 2, 3, 4].map((nivel) => (
                        <span key={nivel} className="gh-celula" data-nivel={nivel} />
                    ))}
                    mais
                </span>
            </div>
        </figure>
    )
}

function PorAno({ anos, hoje }) {
    const anoAtual = Number(hoje.slice(0, 4))
    const leitura = (item) =>
        `${item.ano} · ${plural(item.total, 'contribuição', 'contribuições')}${item.ano === anoAtual ? ' (até hoje)' : ''}`

    return (
        <div className="gh-bloco papel">
            <h3 className="gh-bloco-titulo">Contribuições por ano</h3>
            {anos.length === 0 ? (
                <Vazio>Nenhuma contribuição encontrada no histórico do perfil.</Vazio>
            ) : (
                <Colunas
                    classe="gh-colunas--anos"
                    itens={anos}
                    valor={(item) => item.total}
                    leitura={leitura}
                    eixo={(item) => item.ano}
                    topo={(item) => numero(item.total)}
                    legenda="Contribuições por ano"
                />
            )}
        </div>
    )
}

function Atividade() {
    const contribuicoes = useFonte(contribuicoesFonte)
    if (contribuicoes.status !== 'pronto') return <Estado estado={contribuicoes} />
    const { dados } = contribuicoes
    if (dados.total === 0) return <Vazio>Ainda não há contribuições públicas registradas neste perfil.</Vazio>

    return (
        <>
            <Sequencias dados={dados} />
            <Calendario dados={dados} />
            <PorAno anos={dados.anos} hoje={dados.hoje} />
            <p className="gh-nota">
                Fonte: calendário público do perfil. {TEXTOS.diferencaContribuicoes}
            </p>
        </>
    )
}

/* =====================================================================
   Horários: commits por hora, dia da semana e período do dia
   ===================================================================== */

function HorariosConteudo({ dados }) {
    const { exato, total, analisados, horas, diasSemana, periodos, horaPico, repositorios } = dados
    if (horaPico === null) {
        return <Vazio>Nenhum commit público foi encontrado de {data(dados.inicio)} a {data(dados.fim)}.</Vazio>
    }

    const aprox = exato ? '' : '≈ '
    const maiorPeriodo = periodos.reduce((topo, p) => (p.estimativa > topo.estimativa ? p : topo), periodos[0])
    const maxDia = Math.max(...diasSemana.map((d) => d.estimativa)) || 1
    const diaPico = diasSemana.findIndex((d) => d.estimativa === maxDia)
    const leituraHora = (item, h) =>
        `${faixaHora(h)} · ${percentual(item.percentual)} · ${aprox}${plural(item.estimativa, 'commit', 'commits')}`

    return (
        <>
            <p className="gh-resumo">
                Horário com maior frequência de commits: <strong>{faixaHora(horaPico)}</strong>, e o período com mais commits é a{' '}
                <strong>{maiorPeriodo.rotulo.toLowerCase()}</strong> ({percentual(maiorPeriodo.percentual)}). {TEXTOS.semQualidade}
            </p>

            <div className={`gh-amostra papel ${exato ? 'gh-amostra--exata' : ''}`} role="note">
                <p>
                    {exato
                        ? `Todos os ${plural(total, 'commit público', 'commits públicos')} de ${data(dados.inicio)} a ${data(dados.fim)} foram analisados.`
                        : `Foram analisados ${numero(analisados)} dos ${plural(total, 'commit público', 'commits públicos')} de ${data(dados.inicio)} a ${data(dados.fim)}. A busca do GitHub devolve no máximo 100 commits por página, então, nos trimestres com mais commits, só os mais recentes entram. Cada commit analisado representa os demais do trimestre, e os números com ≈ são estimativas, não contagens exatas.`}
                    {dados.incompleto && ' O GitHub avisou que parte dos resultados desta busca veio incompleta.'}
                </p>
                <p>
                    Horários no fuso America/Sao_Paulo.
                </p>
            </div>

            <div className="gh-bloco papel">
                <h3 className="gh-bloco-titulo">Commits por horário do dia</h3>
                <Colunas
                    classe="gh-colunas--horas"
                    itens={horas}
                    valor={(item) => item.percentual}
                    leitura={leituraHora}
                    eixo={(item, h) => (h % 3 === 0 ? hora(h) : '')}
                    topo={(item) => percentual(item.percentual)}
                    legenda="Distribuição dos commits por horário do dia, em porcentagem"
                />
            </div>

            <div className="gh-duo">
                <div className="gh-bloco papel">
                    <h3 className="gh-bloco-titulo">Commits por dia da semana</h3>
                    <ul className="gh-semana">
                        {ORDEM_SEMANA.map((dia, indice) => (
                            <li
                                key={dia}
                                className={dia === diaPico ? 'gh-dia gh-dia--pico' : 'gh-dia'}
                                style={{ '--rel': `${(diasSemana[dia].estimativa / maxDia) * 100}%`, '--i': indice }}
                            >
                                <span className="gh-dia-nome">
                                    <span aria-hidden="true">{DIAS_SEMANA[dia].curto}</span>
                                    <span className="visualmente-oculto">{DIAS_SEMANA[dia].longo}</span>
                                </span>
                                <span className="gh-trilho" aria-hidden="true">
                                    <span className="gh-trilho-barra" />
                                </span>
                                <span className="gh-dia-valor">
                                    {aprox}
                                    {numero(diasSemana[dia].estimativa)}
                                    <span className="visualmente-oculto"> commits, {percentual(diasSemana[dia].percentual)}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="gh-bloco papel">
                    <h3 className="gh-bloco-titulo">Commits por período</h3>
                    <ul className="gh-periodos">
                        {periodos.map((periodo, indice) => (
                            <li
                                key={periodo.chave}
                                className={periodo === maiorPeriodo ? 'gh-periodo gh-periodo--pico' : 'gh-periodo'}
                                style={{ '--rel': `${periodo.percentual}%`, '--i': indice }}
                            >
                                <span className="gh-periodo-nome">{periodo.rotulo}</span>
                                <span className="gh-periodo-faixa">
                                    {hora(periodo.de)}–{hora((periodo.ate + 1) % 24)}
                                </span>
                                <span className="gh-periodo-valor">{percentual(periodo.percentual)}</span>
                                <span className="gh-trilho" aria-hidden="true">
                                    <span className="gh-trilho-barra" />
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <details className="gh-repos-analisados">
                <summary>Repositórios com commits analisados ({numero(repositorios.length)})</summary>
                <ul className="gh-tags">
                    {repositorios.map((repo) => (
                        <li key={repo.nome} className="tag">
                            {repo.nome} · {plural(repo.commits, 'commit', 'commits')}
                        </li>
                    ))}
                </ul>
                <p className="gh-nota">A contagem por repositório considera apenas os commits analisados na amostra.</p>
            </details>
        </>
    )
}

function Horarios() {
    const commits = useFonte(commitsFonte)
    if (commits.status !== 'pronto') return <Estado estado={commits} />
    return <HorariosConteudo dados={commits.dados} />
}

/* =====================================================================
   Repositórios: lista dos públicos, com estrelas e forks
   ===================================================================== */

function RepositoriosConteudo({ dados }) {
    const [todos, setTodos] = useState(false)
    const ordenados = useMemo(
        () =>
            [...dados.repos].sort(
                (a, b) =>
                    b.estrelas - a.estrelas ||
                    (b.atualizadoEm ?? '').localeCompare(a.atualizadoEm ?? '') ||
                    a.nome.localeCompare(b.nome),
            ),
        [dados],
    )
    if (ordenados.length === 0) return <Vazio>Nenhum repositório público próprio encontrado.</Vazio>

    const visiveis = todos ? ordenados : ordenados.slice(0, LIMITES.reposExibidos)

    return (
        <>
            <p className="gh-resumo">
                <strong>{plural(ordenados.length, 'repositório público próprio', 'repositórios públicos próprios')}</strong>, em ordem de
                estrelas e, no empate, do mais recente.
                {dados.forksIgnorados > 0 && ` ${plural(dados.forksIgnorados, 'fork de outro projeto ficou', 'forks de outros projetos ficaram')} de fora.`}
                {dados.truncado && ` Foram lidos só os ${LIMITES.maxPaginasRepos * LIMITES.reposPorPagina} mais recentes.`}
            </p>

            <ol className="gh-repos">
                {visiveis.map((repo) => (
                    <li key={repo.nome} className="gh-repo papel">
                        <div className="gh-repo-topo">
                            <a className="gh-repo-nome" href={repo.url} target="_blank" rel="noopener noreferrer">
                                {repo.nome}
                                <span className="visualmente-oculto"> (abre em nova aba)</span>
                            </a>
                            <span className="gh-repo-meta">
                                <span>
                                    <FaStar aria-hidden="true" /> {numero(repo.estrelas)}
                                    <span className="visualmente-oculto"> estrelas</span>
                                </span>
                                <span>
                                    <FaCodeBranch aria-hidden="true" /> {numero(repo.forks)}
                                    <span className="visualmente-oculto"> forks</span>
                                </span>
                            </span>
                        </div>
                        {repo.descricao && <p className="gh-repo-descricao">{repo.descricao}</p>}
                        <p className="gh-repo-rodape">
                            {repo.linguagem && <span className="tag">{repo.linguagem}</span>}
                            {repo.arquivado && <span className="tag">arquivado</span>}
                            {repo.atualizadoEm && <span>Atualizado em {data(repo.atualizadoEm.slice(0, 10))}</span>}
                        </p>
                    </li>
                ))}
            </ol>

            {ordenados.length > LIMITES.reposExibidos && (
                <button type="button" className="botao botao--secundario gh-ver-mais" onClick={() => setTodos((v) => !v)} aria-expanded={todos}>
                    {todos ? 'Mostrar menos' : `Mostrar todos (${ordenados.length})`}
                </button>
            )}
        </>
    )
}

function Repositorios() {
    const perfil = useFonte(perfilFonte)
    if (perfil.status !== 'pronto') return <Estado estado={perfil} />
    return <RepositoriosConteudo dados={perfil.dados} />
}

/* =====================================================================
   Página: abas + conteúdo + como os dados são obtidos
   ===================================================================== */

const VISOES = {
    resumo: Resumo,
    linguagens: Linguagens,
    atividade: Atividade,
    horarios: Horarios,
    repositorios: Repositorios,
}

function Abas({ ativa, aoEscolher }) {
    const refs = useRef({})

    const aoTeclar = (evento, indice) => {
        const destino = {
            ArrowRight: (indice + 1) % SECOES.length,
            ArrowLeft: (indice - 1 + SECOES.length) % SECOES.length,
            Home: 0,
            End: SECOES.length - 1,
        }[evento.key]
        if (destino === undefined) return
        evento.preventDefault()
        aoEscolher(SECOES[destino].id)
        refs.current[SECOES[destino].id]?.focus()
    }

    return (
        <div className="gh-abas" role="tablist" aria-label="Seções das estatísticas">
            {SECOES.map((secao, indice) => (
                <button
                    key={secao.id}
                    ref={(el) => {
                        refs.current[secao.id] = el
                    }}
                    type="button"
                    role="tab"
                    id={`gh-aba-${secao.id}`}
                    aria-selected={ativa === secao.id}
                    aria-controls="gh-painel"
                    tabIndex={ativa === secao.id ? 0 : -1}
                    className={ativa === secao.id ? 'gh-aba gh-aba--ativa' : 'gh-aba'}
                    title={secao.descricao}
                    onClick={() => aoEscolher(secao.id)}
                    onKeyDown={(evento) => aoTeclar(evento, indice)}
                >
                    {secao.rotulo}
                </button>
            ))}
        </div>
    )
}

function Github() {
    const [ativa, setAtiva] = useState(SECAO_PADRAO)
    const Visao = VISOES[ativa]
    const secao = SECOES.find((s) => s.id === ativa)

    return (
        <article className="pagina container github">
            <header className="pagina-topo">
                <p className="pagina-faixa">{TEXTOS.faixa}</p>
                <h1 className="pagina-titulo" tabIndex={-1}>
                    {TEXTOS.titulo}
                </h1>
                <p className="pagina-intro">
                    {TEXTOS.intro}{' '}
                    <a href={URL_PERFIL} target="_blank" rel="noopener noreferrer">
                        github.com/{USUARIO}
                        <span className="visualmente-oculto"> (abre em nova aba)</span>
                    </a>
                </p>
            </header>

            <Abas ativa={ativa} aoEscolher={setAtiva} />

            <section id="gh-painel" role="tabpanel" aria-labelledby={`gh-aba-${ativa}`} className="gh-painel">
                <h2 className="subtitulo">{secao.descricao}</h2>
                <SecaoComErro key={ativa}>
                    <Visao />
                </SecaoComErro>
            </section>

            <details className="gh-metodologia papel">
                <summary>Como estes dados são obtidos e quais são os limites</summary>
                <dl>
                    {METODOLOGIA.map((item) => (
                        <div key={item.titulo}>
                            <dt>{item.titulo}</dt>
                            <dd>{item.texto}</dd>
                        </div>
                    ))}
                </dl>
            </details>
        </article>
    )
}

export default Github
