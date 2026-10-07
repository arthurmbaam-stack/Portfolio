import { createContext, useContext } from 'react'

export const RotaContext = createContext(null)

// caminho: rota atual ('/', '/sobre'...)
// fase: 'ociosa' | 'cobrindo' | 'revelando' (animação de troca de página)
// destino: rota para a qual a animação está indo
// navegar(destino, { origem }): troca de página com a animação curta
export function useRota() {
    const contexto = useContext(RotaContext)
    if (!contexto) throw new Error('useRota precisa estar dentro de <RouterProvider>')
    return contexto
}
