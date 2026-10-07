// Páginas do portfólio. A ordem das "faixas" define o menu, a coleção da página
// inicial e os botões de faixa anterior / próxima.
// `fundo` e `detalhe` colorem a capa de vinil de cada página.
export const rotas = [
    { caminho: '/', id: 'inicio', titulo: 'Início' },
    {
    caminho: '/sobre',
    id: 'sobre',
    faixa: '01',
    titulo: 'Sobre mim',
    descricao: 'Trajetória, formação e objetivos',
    fundo: '#cdd9c5',
    detalhe: '#8fa287',
    },
    {
    caminho: '/projetos',
    id: 'projetos',
    faixa: '02',
    titulo: 'Projetos',
    descricao: 'Uma linha do tempo do que construí',
    fundo: '#d6e5ec',
    detalhe: '#8fa9b6',
    },
    {
    caminho: '/certificados',
    id: 'certificados',
    faixa: '03',
    titulo: 'Certificados',
    descricao: 'Cursos e formações',
    fundo: '#f3ecd8',
    detalhe: '#c9bd9a',
    },
    {
    caminho: '/musicas',
    id: 'musicas',
    faixa: '04',
    titulo: 'Músicas',
    descricao: 'Minhas favoritas, com play',
    fundo: '#bfcfb6',
    detalhe: '#7d9273',
    },
    {
    caminho: '/contato',
    id: 'contato',
    faixa: '05',
    titulo: 'Contato',
    descricao: 'Redes sociais e mensagem',
    fundo: '#e3eef3',
    detalhe: '#a3bac6',
    },
]

export const inicio = rotas[0]
export const faixas = rotas.filter((r) => r.faixa)
