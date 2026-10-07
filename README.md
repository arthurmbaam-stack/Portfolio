# Portfólio

Portfólio em React + Vite com tema de discos de vinil. Cada área tem a sua página.

## Como rodar

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # gera a pasta dist/
```

## Páginas

As páginas usam rotas por hash (`/#/sobre`, `/#/projetos`...), então funcionam em qualquer
hospedagem estática, inclusive GitHub Pages, sem configuração extra.

| Rota             | Arquivo                       |
| ---------------- | ----------------------------- |
| `/`              | `src/pages/Inicio.jsx`        |
| `/#/sobre`       | `src/pages/Sobre.jsx`         |
| `/#/projetos`    | `src/pages/Projetos.jsx`      |
| `/#/certificados`| `src/pages/Certificados.jsx`  |
| `/#/musicas`     | `src/pages/Musicas.jsx`       |
| `/#/contato`     | `src/pages/Contato.jsx`       |

A ordem, os títulos e as cores das capas ficam em `src/data/rotas.js`.

## Onde editar o conteúdo

Todo o conteúdo está em `src/data/`:

- `perfil.js`: nome, foto, texto "sobre", formação, objetivos e currículo
- `experiencias.js` e `interesses.js`: aparecem na página Sobre mim
- `projetos.js`: a linha do tempo é ordenada pelo campo `ano`; use `repositorio` e `demo` para os links
- `certificados.js`: coloque os arquivos (PDF ou imagem) em `public/certificados/`
- `musicas.js`: use `arquivo` (áudio em `public/musicas/`) para ter play/pause no site, ou um link de faixa do Spotify para mostrar o player do Spotify
- `contato.js`: e-mail, redes e o endereço do formulário (Formspree)

## Observações

- Os nomes de arquivos respeitam maiúsculas e minúsculas (o build em Linux, como no GitHub Actions ou na Vercel, diferencia).
- As fontes (Fraunces, DM Sans e DM Mono) vêm do Google Fonts, com Georgia e fontes do sistema como reserva.
- Se publicar em uma subpasta (como `usuario.github.io/portfolio/`), defina `base: '/portfolio/'` em `vite.config.js`.
