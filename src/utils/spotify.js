const ID_SPOTIFY = /^[A-Za-z0-9]{22}$/
const URL_IFRAME_API = 'https://open.spotify.com/embed/iframe-api/v1'

// Aceita o link copiado do Spotify (pode ter ?si=..., /intl-pt/, /embed/) ou o URI
// (spotify:track:ID). `tipoEsperado` é 'track' ou 'playlist'.
// Devolve null quando o valor não for válido.
export function interpretarSpotify(entrada, tipoEsperado) {
    if (typeof entrada !== 'string') return null
    const texto = entrada.trim()
    let tipo
    let id

    const uri = texto.match(/^spotify:([a-z]+):([A-Za-z0-9]+)$/)
    if (uri) {
        tipo = uri[1]
        id = uri[2]
    } else {
        let url
        try {
            url = new URL(texto)
        } catch {
            return null
        }
        if (url.protocol !== 'https:' || url.hostname !== 'open.spotify.com') return null

        const partes = url.pathname.split('/').filter(Boolean)
        while (partes[0]?.startsWith('intl-') || partes[0] === 'embed') partes.shift()
        tipo = partes[0]
        id = partes[1]
    }

    if (tipo !== tipoEsperado || !ID_SPOTIFY.test(id ?? '')) return null

    return {
        tipo,
        id,
        uri: `spotify:${tipo}:${id}`,
        url: `https://open.spotify.com/${tipo}/${id}`,
        embedUrl: `https://open.spotify.com/embed/${tipo}/${id}`,
    }
}

// Alturas padrão do Spotify: compacto para música, maior para playlist.
export function alturaEmbed(tipo) {
    return tipo === 'playlist' ? 352 : 152
}

// Carrega a iFrame API do Spotify só quando ela é necessária e guarda o resultado.
// É ela que avisa se o player está tocando ou pausado (evento "playback_update").
// Se o script for bloqueado ou demorar demais, a promessa é rejeitada e a página
// usa o player simples, sem o disco acompanhar a reprodução.
let promessaApi = null

export function carregarIframeApi(tempoLimiteMs = 10000) {
    if (promessaApi) return promessaApi

    promessaApi = new Promise((resolve, reject) => {
        const script = document.createElement('script')
        let temporizador

        function falhar(motivo) {
            clearTimeout(temporizador)
            script.remove()
            promessaApi = null // permite tentar de novo numa próxima escolha
            reject(new Error(motivo))
        }

        window.onSpotifyIframeApiReady = (api) => {
            clearTimeout(temporizador)
            resolve(api)
        }

        temporizador = setTimeout(() => falhar('tempo-esgotado'), tempoLimiteMs)
        script.src = URL_IFRAME_API
        script.async = true
        script.onerror = () => falhar('script-bloqueado')
        document.body.appendChild(script)
    })

    return promessaApi
}