import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { rotas } from '../data/rotas'
import { RotaContext } from './contexto'
import Transicao from './Transicao'

const DURACAO_COBRIR = 420
const DURACAO_REVELAR = 420

// Roteamento por hash (#/sobre): funciona em qualquer hospedagem estática,
// inclusive GitHub Pages, sem configurar redirecionamentos no servidor.
function lerCaminho() {
    const bruto = window.location.hash.replace(/^#/, '').split('?')[0]
    const limpo = bruto.replace(/\/+$/, '') || '/'
    return rotas.some((r) => r.caminho === limpo) ? limpo : '/'
}

function prefereMenosMovimento() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function RouterProvider({ children }) {
    const [caminho, setCaminho] = useState(lerCaminho)
    const [fase, setFase] = useState('ociosa')
    const [destino, setDestino] = useState(null)
    const [origem, setOrigem] = useState({ x: 50, y: 50 })
    const faseRef = useRef('ociosa')
    const caminhoRef = useRef(caminho)
    const timers = useRef([])

    const mudarFase = useCallback((nova) => {
    faseRef.current = nova
    setFase(nova)
    }, [])

    // Botões voltar/avançar do navegador e links com #/rota
    useEffect(() => {
    const aoMudarHash = () => {
        const novo = lerCaminho()
        caminhoRef.current = novo
        setCaminho(novo)
    }
    window.addEventListener('hashchange', aoMudarHash)
    return () => window.removeEventListener('hashchange', aoMudarHash)
    }, [])

    useEffect(() => {
    const lista = timers.current
    return () => lista.forEach(clearTimeout)
    }, [])

    const navegar = useCallback(
    (para, opcoes = {}) => {
        if (para === caminhoRef.current || faseRef.current !== 'ociosa') return

        if (prefereMenosMovimento()) {
        window.location.hash = para
        return
        }

        setDestino(para)
        setOrigem(opcoes.origem ?? { x: 50, y: 50 })
        mudarFase('cobrindo')

        const trocar = setTimeout(() => {
        window.location.hash = para
        mudarFase('revelando')
        const terminar = setTimeout(() => {
            mudarFase('ociosa')
            setDestino(null)
        }, DURACAO_REVELAR)
        timers.current.push(terminar)
        }, DURACAO_COBRIR)
        timers.current.push(trocar)
    },
    [mudarFase],
    )

    const valor = useMemo(
    () => ({ caminho, fase, destino, navegar }),
    [caminho, fase, destino, navegar],
    )

    const rotaDestino = rotas.find((r) => r.caminho === destino)

    return (
    <RotaContext.Provider value={valor}>
        {children}
        <Transicao fase={fase} origem={origem} rota={rotaDestino} />
    </RotaContext.Provider>
    )
}

export default RouterProvider
