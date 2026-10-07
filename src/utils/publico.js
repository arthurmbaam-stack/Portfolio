// Monta o caminho de arquivos que ficam em /public (certificados, currículo, áudios),
// respeitando o `base` do Vite. Assim o site também funciona em subpastas,
// como no GitHub Pages (https://usuario.github.io/portfolio/).
export function publico(caminho) {
    if (!caminho || /^(https?:)?\/\//.test(caminho)) return caminho
    return `${import.meta.env.BASE_URL}${caminho.replace(/^\//, '')}`
}
