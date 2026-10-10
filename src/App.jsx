import { useCallback, useEffect, useRef, useState } from 'react'
import IntroVinil from './components/IntroVinil'
import MenuFaixas from './components/MenuFaixas'
import FaixaNav from './components/FaixaNav'
import Rodape from './components/Rodape'
import RouterProvider from './router/RouterProvider'
import { useRota } from './router/contexto'
import { rotas } from './data/rotas'
import { perfil } from './data/perfil'
import Inicio from './pages/Inicio'
import Sobre from './pages/Sobre'
import Projetos from './pages/Projetos'
import Certificados from './pages/Certificados'
import Musicas from './pages/Musicas'
import Canvas from './pages/Canvas'
import GitHub from './pages/Github'
import Contato from './pages/Contato'

const paginas = {
  '/': Inicio,
  '/sobre': Sobre,
  '/projetos': Projetos,
  '/certificados': Certificados,
  '/musicas': Musicas,
  '/canvas': Canvas,
  '/GitHub': GitHub,
  '/contato': Contato,
}

function Paginas() {
  const { caminho } = useRota()
  const primeiraRenderizacao = useRef(true)
  const Pagina = paginas[caminho] ?? Inicio
  const rota = rotas.find((r) => r.caminho === caminho)
  const eInicio = caminho === '/'

  // A cada troca de página: título da aba, volta ao topo e foco no título principal
  // (ajuda quem usa teclado ou leitor de tela). Não rouba o foco no primeiro carregamento.
  useEffect(() => {
    document.title = eInicio ? `${perfil.nome} · Portfólio` : `${rota.titulo} · ${perfil.nome}`
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

    if (primeiraRenderizacao.current) {
      primeiraRenderizacao.current = false
      return
    }
    document.querySelector('main h1')?.focus({ preventScroll: true })
  }, [caminho, eInicio, rota.titulo])

  return (
    <>
      <a href="#conteudo" className="pular-conteudo" onClick={(e) => {
        e.preventDefault()
        document.querySelector('main h1')?.focus()
      }}>
        Ir para o conteúdo
      </a>

      {!eInicio && <MenuFaixas />}
      <main id="conteudo">
        <Pagina key={caminho} />
      </main>
      {!eInicio && <FaixaNav />}
      <Rodape nome={perfil.nome} />
    </>
  )
}

function App() {
  // A abertura com o disco girando aparece uma vez, quando o site abre na página inicial.
  const [mostrarIntro, setMostrarIntro] = useState(() => {
    const hash = window.location.hash.replace(/^#/, '')
    return hash === '' || hash === '/'
  })

  const finalizarIntro = useCallback(() => {
    setMostrarIntro(false)
  }, [])

  if (mostrarIntro) {
    return <IntroVinil onFinish={finalizarIntro} />
  }

  return (
    <RouterProvider>
      <Paginas />
    </RouterProvider>
  )
}

export default App
