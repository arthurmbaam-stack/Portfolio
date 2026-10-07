// Cada música pode ter:
//  - arquivo: um áudio em public/musicas/ (ex.: '/musicas/minha-musica.mp3'). Com ele, o
//    site mostra play/pause, barra de progresso e volume próprios.
//  - link: o endereço para ouvir fora do site. Se for uma faixa, álbum ou playlist do
//    Spotify (https://open.spotify.com/track/...), o player do Spotify aparece na página.
// Use só áudios que você tem direito de publicar.
export const musicas = [
    {
    id: 'musica-1',
    titulo: 'Nome da música',
    artista: 'Artista',
    comentario: 'Por que essa música é especial para você.',
    link: 'https://open.spotify.com/',
    arquivo: null,
    },
]
