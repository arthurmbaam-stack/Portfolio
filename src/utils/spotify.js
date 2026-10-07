// Se o link for de uma faixa, álbum ou playlist do Spotify, devolve a URL do player
// incorporado. Para qualquer outro link, devolve null.
export function embedSpotify(link) {
    try {
    const url = new URL(link)
    if (url.hostname !== 'open.spotify.com') return null
    const achado = url.pathname.match(/\/(track|album|playlist|episode)\/([A-Za-z0-9]+)/)
    return achado ? `https://open.spotify.com/embed/${achado[1]}/${achado[2]}` : null
    } catch {
    return null
    }
}
