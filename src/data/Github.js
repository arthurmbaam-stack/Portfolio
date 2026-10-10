// Dados estáticos da página de estatísticas do GitHub: seções, rótulos, textos e cores.

export const SECOES = [
    { id: 'resumo', rotulo: 'Resumo', descricao: 'Perfil e números gerais' },
    { id: 'linguagens', rotulo: 'Linguagens', descricao: 'Linguagem principal de cada repositório' },
    { id: 'atividade', rotulo: 'Atividade', descricao: 'Contribuições ao longo do tempo' },
    { id: 'horarios', rotulo: 'Horários', descricao: 'Quando os commits acontecem' },
    { id: 'repositorios', rotulo: 'Repositórios', descricao: 'Repositórios públicos' },
]

export const SECAO_PADRAO = 'resumo'

// Índice 0 = domingo (mesma convenção de Date.getDay)
export const DIAS_SEMANA = [
    { curto: 'Dom', longo: 'domingo' },
    { curto: 'Seg', longo: 'segunda-feira' },
    { curto: 'Ter', longo: 'terça-feira' },
    { curto: 'Qua', longo: 'quarta-feira' },
    { curto: 'Qui', longo: 'quinta-feira' },
    { curto: 'Sex', longo: 'sexta-feira' },
    { curto: 'Sáb', longo: 'sábado' },
]

// Segunda primeiro, domingo no fim
export const ORDEM_SEMANA = [1, 2, 3, 4, 5, 6, 0]

// Períodos do dia (horas inicial e final, inclusive)
export const PERIODOS_DIA = [
    { chave: 'madrugada', rotulo: 'Madrugada', de: 0, ate: 5 },
    { chave: 'manha', rotulo: 'Manhã', de: 6, ate: 11 },
    { chave: 'tarde', rotulo: 'Tarde', de: 12, ate: 17 },
    { chave: 'noite', rotulo: 'Noite', de: 18, ate: 23 },
]

// Cores suaves do portfólio, usadas nas fatias do disco de linguagens
export const CORES_LINGUAGENS = [
    '#8fa287',
    '#8fa9b6',
    '#c9bd9a',
    '#5d6e56',
    '#4d6571',
    '#b7c7a9',
    '#a3bac6',
    '#d9cfae',
]
export const COR_OUTRAS = '#b9b3a6'

export const TEXTOS = {
    faixa: 'Faixa 06',
    titulo: 'GitHub',
    intro:
        'Estatísticas montadas ao vivo com dados públicos do GitHub. Cada seção explica o período e os repositórios analisados.',
    carregando: 'Carregando dados do GitHub…',
    erro: 'Não foi possível carregar estes dados agora. Verifique a conexão e tente de novo.',
    limite:
        'O limite de consultas do GitHub foi atingido para este navegador. Os dados voltam a carregar depois do horário de liberação.',
    vazio: 'Ainda não há dados públicos suficientes para este gráfico.',
    tentarDeNovo: 'Tentar novamente',
    indisponivel: 'Indisponível agora',
    diferencaContribuicoes:
        'Contribuições e commits não são a mesma coisa. As contribuições (calendário do perfil) somam commits, pull requests, issues e revisões de código. Já os commits contados nesta página são só os públicos, na branch principal, ligados ao seu usuário.',
}

// Explicações exibidas no final da página
export const METODOLOGIA = [
    {
        titulo: 'Perfil, estrelas, forks e linguagens',
        texto:
            'Vêm da API pública do GitHub (usuário e lista de repositórios). Só entram repositórios públicos próprios; forks de outros projetos ficam de fora. A linguagem de cada repositório é a principal detectada pelo GitHub: o gráfico conta repositórios, não linhas de código.',
    },
    {
 titulo: 'Commits por dia da semana e horário',
    texto:
        'A análise consulta commits públicos desde a criação da conta até hoje. Os horários são convertidos para America/Sao_Paulo.',
    },
    {
        titulo: 'Commits por dia da semana e horário',
        texto:
            'Vêm da busca pública de commits do GitHub, dos últimos 12 meses, em quatro trimestres. A busca devolve no máximo 100 commits por página, então, se um trimestre tiver mais que isso, só os mais recentes dele são analisados e os valores viram estimativas (marcadas com ≈). Os horários são convertidos para America/Sao_Paulo.',
    },
    {
        titulo: 'O que não aparece',
        texto:
            'Repositórios privados, commits fora da branch principal, commits com e-mail não vinculado à conta e visitas ao perfil ou aos repositórios, que a API do GitHub não disponibiliza. Sem token, o GitHub permite 60 chamadas por hora e 10 buscas por minuto por conexão; por isso os resultados ficam guardados por 30 minutos neste navegador.',
    },
]