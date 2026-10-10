import CONFIG from '../config/GithubConfig'
import { PERIODOS_DIA } from '../data/Github'

// Consulta o GitHub (só dados públicos, direto do navegador), organiza as
// respostas e calcula as estatísticas da página de GitHub.
//
// Cada fonte (perfil, commits, contribuições...) é buscada uma vez e guardada
// em memória e no sessionStorage por CACHE_MINUTOS. Fontes que dependem do
// "hoje" também vencem quando o dia muda em America/Sao_Paulo. Erros nunca
// ficam guardados, e depois de um limite de consultas nenhuma chamada nova
// é feita até o horário de liberação informado pelo GitHub.

const {
    USUARIO,
    URL_API,
    URL_CONTRIBUICOES,
    FUSO_HORARIO,
    JANELA_DIAS,
    INCLUIR_FORKS,
    PREFIXOS_REPOS_OCULTOS,
    CACHE_MINUTOS,
    LIMITES,
} = CONFIG

/* =====================================================================
   Erros
   ===================================================================== */

// Limite de consultas da API do GitHub. `resetEm` é o instante (ms) em que volta a liberar.
export class GitHubLimiteError extends Error {
    constructor(resetEm = null) {
        super('Limite de consultas do GitHub atingido')
        this.name = 'GitHubLimiteError'
        this.resetEm = resetEm
    }
}

/* =====================================================================
   Datas no fuso configurado (America/Sao_Paulo)
   ===================================================================== */

const formatoDia = new Intl.DateTimeFormat('en-US', {
    timeZone: FUSO_HORARIO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
})

// "2026-10-10" no fuso configurado
export function chaveDoDia(data = new Date()) {
    const partes = Object.fromEntries(formatoDia.formatToParts(data).map((p) => [p.type, p.value]))
    return `${partes.year}-${partes.month}-${partes.day}`
}

const meioDia = (chave) => new Date(`${chave}T12:00:00Z`)

export function somarDias(chave, dias) {
    const data = meioDia(chave)
    data.setUTCDate(data.getUTCDate() + dias)
    return data.toISOString().slice(0, 10)
}

// 0 = domingo ... 6 = sábado
export const diaDaSemana = (chave) => meioDia(chave).getUTCDay()

/* =====================================================================
   Cache por visita + sessionStorage
   ===================================================================== */

const PREFIXO_STORAGE = `github-stats:v1:${USUARIO}:`

function lerStorage(nome) {
    try {
        const bruto = window.sessionStorage.getItem(PREFIXO_STORAGE + nome)
        return bruto ? JSON.parse(bruto) : null
    } catch {
        return null
    }
}

function gravarStorage(nome, registro) {
    try {
        window.sessionStorage.setItem(PREFIXO_STORAGE + nome, JSON.stringify(registro))
    } catch {
        // Armazenamento cheio ou bloqueado: segue só com o cache em memória
    }
}

// diaria: o resultado só vale no dia (em São Paulo) em que foi buscado
function criarFonte(nome, carregador, { diaria = false } = {}) {
    let registro = null // { salvoEm, dia, dados }
    let promessa = null
    let bloqueio = null // erro de limite ainda em vigor

    const valido = (r) =>
        Boolean(r) &&
        Date.now() - r.salvoEm < CACHE_MINUTOS * 60000 &&
        (!diaria || r.dia === chaveDoDia())

    function peek() {
        if (!valido(registro)) registro = lerStorage(nome)
        return valido(registro) ? registro.dados : null
    }

    return {
        peek,
        carregar() {
            const guardado = peek()
            if (guardado) return Promise.resolve(guardado)
            if (promessa) return promessa
            if (bloqueio) {
                if (bloqueio.resetEm && Date.now() < bloqueio.resetEm) return Promise.reject(bloqueio)
                bloqueio = null
            }
            promessa = carregador()
                .then((dados) => {
                    registro = { salvoEm: Date.now(), dia: chaveDoDia(), dados }
                    gravarStorage(nome, registro)
                    promessa = null
                    return dados
                })
                .catch((erro) => {
                    promessa = null
                    if (erro instanceof GitHubLimiteError) bloqueio = erro
                    throw erro
                })
            return promessa
        },
    }
}

/* =====================================================================
   GitHub REST API
   ===================================================================== */

// Só o cabeçalho Accept (permitido sem preflight de CORS) e nenhuma credencial
async function consultar(caminho) {
    let resposta
    try {
        resposta = await fetch(`${URL_API}${caminho}`, {
            headers: { Accept: 'application/vnd.github+json' },
        })
    } catch {
        throw new Error('Sem conexão com o GitHub')
    }
    if (resposta.ok) return resposta.json()

    const restantes = resposta.headers.get('x-ratelimit-remaining')
    const reset = Number(resposta.headers.get('x-ratelimit-reset'))
    const espera = Number(resposta.headers.get('retry-after'))
    let mensagem = ''
    try {
        mensagem = (await resposta.json())?.message ?? ''
    } catch {
        // corpo vazio ou sem JSON
    }
    const limite =
        resposta.status === 429 ||
        (resposta.status === 403 && (restantes === '0' || espera > 0 || /rate limit/i.test(mensagem)))
    if (limite) {
        const resetEm = reset > 0 ? reset * 1000 : espera > 0 ? Date.now() + espera * 1000 : null
        throw new GitHubLimiteError(resetEm)
    }
    const erro = new Error(`GitHub: HTTP ${resposta.status}`)
    erro.status = resposta.status
    throw erro
}

// A busca tem limite próprio (10 por minuto): as chamadas entram numa fila
// e saem uma de cada vez, para não disparar o limite secundário do GitHub.
let filaBusca = Promise.resolve()
function consultarBusca(caminho) {
    const tarefa = filaBusca.then(() => consultar(caminho))
    filaBusca = tarefa.catch(() => {})
    return tarefa
}

/* =====================================================================
   Perfil e repositórios
   ===================================================================== */

async function buscarRepositorios() {
    const itens = []
    let truncado = false
    for (let pagina = 1; pagina <= LIMITES.maxPaginasRepos; pagina++) {
        const lote = await consultar(
            `/users/${USUARIO}/repos?type=owner&sort=pushed&per_page=${LIMITES.reposPorPagina}&page=${pagina}`,
        )
        itens.push(...lote)
        if (lote.length < LIMITES.reposPorPagina) break
        if (pagina === LIMITES.maxPaginasRepos) truncado = true
    }
    return { itens, truncado }
}

const repoOculto = (nome) =>
    PREFIXOS_REPOS_OCULTOS.some((prefixo) => nome.toLowerCase().startsWith(prefixo.toLowerCase()))

export function normalizarPerfil(usuario, repositorios, truncado = false) {
    const publicos = repositorios.filter((r) => !r.private && !repoOculto(r.name))
    const proprios = publicos.filter((r) => INCLUIR_FORKS || !r.fork)
    const repos = proprios.map((r) => ({
        nome: r.name,
        url: r.html_url,
        descricao: r.description ?? '',
        linguagem: r.language ?? null,
        estrelas: r.stargazers_count ?? 0,
        forks: r.forks_count ?? 0,
        atualizadoEm: r.pushed_at ?? r.updated_at ?? null,
        arquivado: Boolean(r.archived),
    }))

    return {
        usuario: {
            login: usuario.login,
            nome: usuario.name || usuario.login,
            avatar: usuario.avatar_url,
            url: usuario.html_url,
            bio: usuario.bio?.trim() ?? '',
            empresa: usuario.company ?? '',
            local: usuario.location ?? '',
            seguidores: usuario.followers ?? 0,
            seguindo: usuario.following ?? 0,
            criadoEm: usuario.created_at?.slice(0, 10) ?? null,
        },
        repos,
        forksIgnorados: publicos.length - proprios.length,
        estrelas: repos.reduce((soma, r) => soma + r.estrelas, 0),
        forks: repos.reduce((soma, r) => soma + r.forks, 0),
        truncado,
    }
}

export const perfilFonte = criarFonte('perfil', async () => {
    const [usuario, repositorios] = await Promise.all([
        consultar(`/users/${USUARIO}`),
        buscarRepositorios(),
    ])
    return normalizarPerfil(usuario, repositorios.itens, repositorios.truncado)
})

/* =====================================================================
   Linguagens (linguagem principal de cada repositório)
   ===================================================================== */

export function resumirLinguagens(repos) {
    const contagem = new Map()
    let semLinguagem = 0
    repos.forEach((repo) => {
        if (!repo.linguagem) {
            semLinguagem++
            return
        }
        contagem.set(repo.linguagem, (contagem.get(repo.linguagem) ?? 0) + 1)
    })
    const total = [...contagem.values()].reduce((soma, valor) => soma + valor, 0)
    const itens = [...contagem]
        .map(([nome, valor]) => ({ nome, valor, percentual: total ? (valor / total) * 100 : 0 }))
        .sort((a, b) => b.valor - a.valor || a.nome.localeCompare(b.nome))
    return { total, semLinguagem, itens }
}

// Primeiros `limite` itens + uma linha "Outras" com a soma do resto
export function agruparOutras(itens, limite = LIMITES.linguagensExibidas) {
    const topo = itens.slice(0, limite)
    const resto = itens.slice(limite)
    if (resto.length === 0) return topo
    return [
        ...topo,
        {
            nome: `Outras (${resto.length})`,
            valor: resto.reduce((soma, i) => soma + i.valor, 0),
            percentual: resto.reduce((soma, i) => soma + i.percentual, 0),
            outras: true,
        },
    ]
}

/* =====================================================================
   Pull requests e issues (busca pública do GitHub, total de todos os tempos)
   ===================================================================== */

const contarBusca = async (consulta) =>
    (await consultarBusca(`/search/issues?q=${encodeURIComponent(consulta)}&per_page=1`)).total_count ?? 0

export const contagensFonte = criarFonte(
    'contagens',
    async () => {
        const pullRequests = await contarBusca(`author:${USUARIO} type:pr is:public`)
        const issues = await contarBusca(`author:${USUARIO} type:issue is:public`)
        return { pullRequests, issues }
    },
    { diaria: true },
)

/* =====================================================================
   Commits: dia da semana e horário (busca pública de commits)
   ===================================================================== */

// Divide os últimos `dias` dias (terminando em `fim`) em `partes` períodos seguidos
export function dividirPeriodo(fim, dias = JANELA_DIAS, partes = LIMITES.periodosCommits) {
    const base = Math.floor(dias / partes)
    const resto = dias % partes
    const periodos = []
    let de = somarDias(fim, -(dias - 1))
    for (let i = 0; i < partes; i++) {
        const ate = somarDias(de, base + (i < resto ? 1 : 0) - 1)
        periodos.push({ de, ate })
        de = somarDias(ate, 1)
    }
    return periodos
}

const caminhoCommits = ({ de, ate }, pagina) =>
    `/search/commits?q=${encodeURIComponent(`author:${USUARIO} author-date:${de}..${ate}`)}` +
    `&sort=author-date&order=desc&per_page=${LIMITES.commitsPorPagina}&page=${pagina}`

const extrairCommits = (itens = []) =>
    itens
        .map((item) => ({
            data: item.commit?.author?.date,
            repo: item.repository?.name ?? item.repository?.full_name ?? null,
        }))
        .filter((commit) => commit.data)

const NOMES_DIAS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// amostras: [{ de, ate, total, incompleto, commits: [{ data, repo }] }], uma por período.
// Cada commit analisado vale (total do período ÷ commits analisados dele), para
// nenhum período pesar mais do que realmente pesou. Quando todos os commits de
// todos os períodos foram analisados, `exato` é verdadeiro e os números são
// contagens reais; caso contrário são estimativas.
export function relogioDeCommits(amostras, fuso = FUSO_HORARIO) {
    const formato = new Intl.DateTimeFormat('en-US', {
        timeZone: fuso,
        hour: 'numeric',
        hourCycle: 'h23',
        weekday: 'short',
    })
    const horas = new Array(24).fill(0)
    const dias = new Array(7).fill(0)
    const repositorios = new Map()
    let total = 0
    let analisados = 0

    amostras.forEach(({ total: totalPeriodo, commits }) => {
        total += totalPeriodo
        const validos = commits.filter((c) => !Number.isNaN(new Date(c.data).getTime()))
        if (validos.length === 0) return
        const peso = Math.max(totalPeriodo, validos.length) / validos.length
        validos.forEach(({ data, repo }) => {
            const partes = formato.formatToParts(new Date(data))
            const hora = Number(partes.find((p) => p.type === 'hour')?.value) % 24
            const dia = NOMES_DIAS_EN.indexOf(partes.find((p) => p.type === 'weekday')?.value)
            if (Number.isNaN(hora) || dia < 0) return
            horas[hora] += peso
            dias[dia] += peso
            analisados++
            if (repo) repositorios.set(repo, (repositorios.get(repo) ?? 0) + 1)
        })
    })

    const soma = horas.reduce((s, v) => s + v, 0)
    const item = (estimativa) => ({ estimativa, percentual: soma ? (estimativa / soma) * 100 : 0 })
    const exato =
        analisados > 0 &&
        amostras.every((a) => !a.incompleto && a.commits.length >= a.total)

    return {
        total,
        analisados,
        exato,
        incompleto: amostras.some((a) => a.incompleto),
        horaPico: soma ? horas.indexOf(Math.max(...horas)) : null,
        horas: horas.map(item),
        diasSemana: dias.map(item),
        periodos: PERIODOS_DIA.map((periodo) => ({
            ...periodo,
            ...item(horas.slice(periodo.de, periodo.ate + 1).reduce((s, v) => s + v, 0)),
        })),
        repositorios: [...repositorios]
            .map(([nome, commits]) => ({ nome, commits }))
            .sort((a, b) => b.commits - a.commits || a.nome.localeCompare(b.nome)),
    }
}

export const commitsFonte = criarFonte(
    'commits-desde-criacao',
    async () => {
        const perfil = await perfilFonte.carregar()
        const inicio = perfil.usuario.criadoEm

        if (!inicio) {
            throw new Error('Não foi possível identificar a criação da conta')
        }

        const fim = chaveDoDia()
        const dias = Math.floor(
            (meioDia(fim) - meioDia(inicio)) / 86400000,
        ) + 1

        const periodos = dividirPeriodo(fim, dias)
        const amostras = []

        for (const periodo of periodos) {
            const pagina = await consultarBusca(caminhoCommits(periodo, 1))
            amostras.push({
                ...periodo,
                total: pagina.total_count ?? 0,
                incompleto: Boolean(pagina.incomplete_results),
                commits: extrairCommits(pagina.items),
            })
        }

        // Períodos com mais de 100 commits: busca mais páginas, dentro de um orçamento
        // pequeno de chamadas (a busca permite 10 por minuto)
        let extras = LIMITES.paginasExtrasCommits
        const pendentes = amostras
            .filter((a) => a.total > a.commits.length)
            .sort((a, b) => b.total - b.commits.length - (a.total - a.commits.length))
        for (const amostra of pendentes) {
            let numero = 2
            while (extras > 0 && amostra.commits.length < amostra.total && numero <= 10) {
                const novos = extrairCommits(
                    (await consultarBusca(caminhoCommits(amostra, numero))).items,
                )
                if (novos.length === 0) break
                amostra.commits.push(...novos)
                numero++
                extras--
            }
        }

        return { inicio: periodos[0].de, fim, fuso: FUSO_HORARIO, ...relogioDeCommits(amostras) }
    },
    { diaria: true },
)

/* =====================================================================
   Contribuições: total, anos, sequências e calendário
   ===================================================================== */

const SEM_SEQUENCIA = { tamanho: 0, inicio: null, fim: null }

// Níveis 1–4 pelos quartis dos dias com contribuição (como o GitHub faz)
function criarEscala(quantidades) {
    const ordenadas = quantidades.filter((q) => q > 0).sort((a, b) => a - b)
    const em = (q) => ordenadas[Math.floor((ordenadas.length - 1) * q)] ?? 0
    const [q1, q2, q3] = [em(0.25), em(0.5), em(0.75)]
    return (quantidade) =>
        quantidade <= 0 ? 0 : quantidade <= q1 ? 1 : quantidade <= q2 ? 2 : quantidade <= q3 ? 3 : 4
}

// contribuicoes: [{ date: "2026-06-09", count: 7 }, ...] (qualquer ordem)
// hoje: "2026-10-10", no fuso configurado
export function resumirContribuicoes(contribuicoes, hoje = chaveDoDia(), janela = null) {
    // Uma entrada por dia, em ordem, só até hoje
    const porDia = new Map()
    contribuicoes.forEach(({ date, count }) => {
        if (typeof date === 'string' && date <= hoje) porDia.set(date, Number(count) || 0)
    })
    const dias = [...porDia]
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([data, quantidade]) => ({ data, quantidade }))

    const inicioJanela = janela === null
    ? (dias[0]?.data ?? hoje)
    : somarDias(hoje, -(janela - 1))
    let total = 0
    let diasAtivos = 0
    let primeiraData = null
    let totalJanela = 0
    let diasAtivosJanela = 0
    let sequencia = null
    let maiorSequencia = SEM_SEQUENCIA
    const anos = new Map()

    dias.forEach(({ data, quantidade }) => {
        const ano = Number(data.slice(0, 4))
        anos.set(ano, (anos.get(ano) ?? 0) + quantidade)
        total += quantidade
        if (data >= inicioJanela) {
            totalJanela += quantidade
            if (quantidade > 0) diasAtivosJanela++
        }
        if (quantidade <= 0) {
            sequencia = null
            return
        }
        diasAtivos++
        primeiraData ??= data
        // Só emenda se o dia anterior for mesmo o dia anterior
        sequencia =
            sequencia && somarDias(sequencia.fim, 1) === data
                ? { ...sequencia, fim: data, tamanho: sequencia.tamanho + 1 }
                : { inicio: data, fim: data, tamanho: 1 }
        if (sequencia.tamanho > maiorSequencia.tamanho) maiorSequencia = sequencia
    })

    // Sequência atual: termina hoje ou ontem (hoje ainda pode receber contribuições)
    let sequenciaAtual = SEM_SEQUENCIA
    let i = dias.length - 1
    if (dias[i]?.data === hoje && dias[i].quantidade <= 0) i--
    if (dias[i] && dias[i].quantidade > 0 && dias[i].data >= somarDias(hoje, -1)) {
        const fim = dias[i].data
        let inicio = fim
        let tamanho = 0
        while (i >= 0 && dias[i].quantidade > 0 && somarDias(dias[i].data, tamanho) === fim) {
            inicio = dias[i].data
            tamanho++
            i--
        }
        sequenciaAtual = { tamanho, inicio, fim }
    }

    // Calendário: uma coluna por semana (domingo a sábado). Os dias da primeira
    // semana anteriores à janela aparecem apagados (`dentro: false`).
    const inicioGrade = somarDias(inicioJanela, -diaDaSemana(inicioJanela))
    const celulas = []
    for (let data = inicioGrade; data <= hoje; data = somarDias(data, 1)) {
        celulas.push({ data, quantidade: porDia.get(data) ?? 0, dentro: data >= inicioJanela })
    }
    const nivel = criarEscala(celulas.filter((c) => c.dentro).map((c) => c.quantidade))
    const semanas = []
    celulas.forEach((celula, indice) => {
        if (indice % 7 === 0) semanas.push([])
        semanas[semanas.length - 1].push({ ...celula, nivel: celula.dentro ? nivel(celula.quantidade) : 0 })
    })

    const primeiroAno = dias.length ? Number(dias[0].data.slice(0, 4)) : null
    const anosLista = []
    for (let ano = primeiroAno; primeiroAno && ano <= Number(hoje.slice(0, 4)); ano++) {
        anosLista.push({ ano, total: anos.get(ano) ?? 0 })
    }

    return {
        hoje,
        total,
        diasAtivos,
        primeiraData,
        sequenciaAtual,
        maiorSequencia,
        anos: anosLista,
        janela: { inicio: inicioJanela, fim: hoje, total: totalJanela, diasAtivos: diasAtivosJanela },
        calendario: { semanas },
    }
}

    export const contribuicoesFonte = criarFonte(
        'contribuicoes-historico-completo',
    async () => {
        let resposta
        try {
            resposta = await fetch(URL_CONTRIBUICOES)
        } catch {
            throw new Error('Sem conexão com a API de contribuições')
        }
        if (!resposta.ok) throw new Error(`Contribuições: HTTP ${resposta.status}`)
        const json = await resposta.json()
        if (!Array.isArray(json?.contributions)) throw new Error('Contribuições: formato inesperado')
        return resumirContribuicoes(json.contributions, chaveDoDia())
    },
    { diaria: true },
)