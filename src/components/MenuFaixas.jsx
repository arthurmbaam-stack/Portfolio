import { useEffect, useState } from 'react'
import Link from '../router/Link'
import { useRota } from '../router/contexto'
import { faixas } from '../data/rotas'
import { perfil } from '../data/perfil'
import './MenuFaixas.css'

// Menu compacto das páginas internas, no formato de lista de faixas de um álbum.
function MenuFaixas() {
    const { caminho } = useRota()
    const [aberto, setAberto] = useState(false)
    const [caminhoAnterior, setCaminhoAnterior] = useState(caminho)

    // Fecha a lista de faixas ao trocar de página (ajuste de estado durante a renderização)
    if (caminho !== caminhoAnterior) {
    setCaminhoAnterior(caminho)
    setAberto(false)
    }

    useEffect(() => {
    if (!aberto) return
    const aoTeclar = (e) => e.key === 'Escape' && setAberto(false)
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
    }, [aberto])

    return (
    <header className="menu">
        <div className="container menu-conteudo">
        <Link para="/" className="menu-marca" title="Voltar ao início">
            <span className="menu-disco" aria-hidden="true" />
            <span className="menu-nome">{perfil.nome}</span>
            <span className="menu-voltar">Início</span>
        </Link>

        <button
            type="button"
            className="menu-botao"
            aria-expanded={aberto}
            aria-controls="menu-faixas"
            onClick={() => setAberto((a) => !a)}
        >
            Faixas
        </button>

        <nav
            id="menu-faixas"
            className={`menu-faixas ${aberto ? 'menu-faixas--aberto' : ''}`}
            aria-label="Páginas do portfólio"
        >
            <ol>
            {faixas.map((f) => (
                <li key={f.caminho}>
                <Link para={f.caminho}>
                    <span className="menu-num">{f.faixa}</span> — {f.titulo}
                </Link>
                </li>
            ))}
            </ol>
        </nav>
        </div>
    </header>
    )
}

export default MenuFaixas
