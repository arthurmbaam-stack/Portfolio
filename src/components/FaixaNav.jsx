import Link from '../router/Link'
import { useRota } from '../router/contexto'
import { faixas, inicio } from '../data/rotas'
import './FaixaNav.css'

// Atalhos para a faixa anterior e a próxima, no fim das páginas internas.
function FaixaNav() {
    const { caminho } = useRota()
    const indice = faixas.findIndex((f) => f.caminho === caminho)
    if (indice === -1) return null

    const anterior = faixas[indice - 1]
    const proxima = faixas[indice + 1]

    return (
    <nav className="faixa-nav container" aria-label="Faixa anterior e próxima">
        {anterior ? (
        <Link para={anterior.caminho} className="faixa-nav-link">
            <span className="faixa-nav-dica">← Faixa anterior</span>
            <span className="faixa-nav-nome">{anterior.faixa} — {anterior.titulo}</span>
        </Link>
        ) : (
        <Link para={inicio.caminho} className="faixa-nav-link">
            <span className="faixa-nav-dica">← Coleção</span>
            <span className="faixa-nav-nome">Início</span>
        </Link>
        )}

        {proxima ? (
        <Link para={proxima.caminho} className="faixa-nav-link faixa-nav-link--proxima">
            <span className="faixa-nav-dica">Próxima faixa →</span>
            <span className="faixa-nav-nome">{proxima.faixa} — {proxima.titulo}</span>
        </Link>
        ) : (
        <Link para={inicio.caminho} className="faixa-nav-link faixa-nav-link--proxima">
            <span className="faixa-nav-dica">Fim do álbum →</span>
            <span className="faixa-nav-nome">Voltar à coleção</span>
        </Link>
        )}
    </nav>
    )
}

export default FaixaNav
