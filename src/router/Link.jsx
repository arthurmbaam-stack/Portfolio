import { useRota } from './contexto'

// Link para outra página do portfólio. Mantém o href real (abre em nova aba, copia o
// endereço etc.) e, no clique normal, troca de página com a animação.
function Link({ para, children, ...resto }) {
    const { caminho, navegar } = useRota()

    function aoClicar(evento) {
    if (
        evento.defaultPrevented ||
        evento.button !== 0 ||
        evento.metaKey ||
        evento.ctrlKey ||
        evento.shiftKey ||
        evento.altKey
    ) {
        return
    }
    evento.preventDefault()
    const caixa = evento.currentTarget.getBoundingClientRect()
    navegar(para, {
        origem: {
        x: ((caixa.left + caixa.width / 2) / window.innerWidth) * 100,
        y: ((caixa.top + caixa.height / 2) / window.innerHeight) * 100,
        },
    })
    }

    return (
    <a
        href={`#${para}`}
        onClick={aoClicar}
        aria-current={caminho === para ? 'page' : undefined}
        {...resto}
    >
        {children}
    </a>
    )
}

export default Link
