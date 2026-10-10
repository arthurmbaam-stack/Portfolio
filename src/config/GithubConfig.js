// Configurações da página de estatísticas do GitHub (pages/Github.jsx).
// Tudo o que muda de um perfil para outro, ou que limita o número de consultas,
// fica aqui. Nenhum token ou segredo entra neste arquivo: todas as consultas
// usam apenas dados públicos e são feitas direto do navegador.

const USUARIO = 'arthurmbaam-stack'

const GITHUB_CONFIG = {
    USUARIO,
    URL_PERFIL: `https://github.com/${USUARIO}`,

    // API pública do GitHub (sem autenticação: 60 chamadas/hora e 10 buscas/minuto por IP)
    URL_API: 'https://api.github.com',

    // Calendário de contribuições. O GitHub só entrega esse dado oficialmente
    // pela API GraphQL, que exige token. Esta API pública de terceiros lê o
    // calendário exibido no perfil e responde com CORS liberado.
    URL_CONTRIBUICOES: `https://github-contributions-api.jogruber.de/v4/${USUARIO}?y=all`,

    // Fuso usado no "hoje" e na análise dos horários dos commits
    FUSO_HORARIO: 'America/Sao_Paulo',
    IDIOMA: 'pt-BR',

    // Período analisado (em dias, contando o dia de hoje)
    JANELA_DIAS: 365,

    // Forks de outros projetos ficam fora das contagens por padrão
    INCLUIR_FORKS: false,
    // Repositórios cujo nome começa com algum destes prefixos não entram (ex.: ['curso-'])
    PREFIXOS_REPOS_OCULTOS: [],

    // Quanto tempo (em minutos) uma resposta fica guardada na sessão do navegador,
    // para não repetir consultas ao recarregar a página ou trocar de seção
    CACHE_MINUTOS: 30,

    LIMITES: {
        reposPorPagina: 100, // máximo permitido pela API
        maxPaginasRepos: 3, // até 300 repositórios
        linguagensExibidas: 8, // o restante vira "Outras"
        reposExibidos: 12, // ranking de repositórios (há botão para ver todos)
        periodosCommits: 4, // a janela é dividida em trimestres para amostrar os commits
        commitsPorPagina: 100, // máximo permitido pela busca de commits
        paginasExtrasCommits: 2, // páginas adicionais, se algum trimestre passar de 100 commits
    },
}

export default GITHUB_CONFIG