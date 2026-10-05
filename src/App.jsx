import { useCallback, useState } from 'react'
import Introvinil from './components/Introvinil'
import Header from './components/Header'
import Hero from './sections/hero'
import Sobre from './sections/sobre'
import Projetos from './sections/projetos'
import Experiencias from './sections/experiencias'
import Certificados from './sections/certificados'
import Interesses from './sections/interesses'
import Musicas from './sections/musicas'
import Contato from './sections/contato'
import Rodape from './sections/rodape'
import { perfil } from './data/perfil'

function App() {
  const [mostrarIntro, setMostrarIntro] = useState(true)

  const finalizarIntro = useCallback(() => {
    setMostrarIntro(false)
  }, [])

  if (mostrarIntro) {
    return <Introvinil onFinish={finalizarIntro} />
  }

  return (
    <>
      <Header nome={perfil.nome} />
      <main>
        <Hero nome={perfil.nome} cargo={perfil.cargo} iniciais={perfil.iniciais} />
        <Sobre />
        <Projetos />
        <Experiencias />
        <Certificados />
        <Interesses />
        <Musicas />
        <Contato />
      </main>
      <Rodape nome={perfil.nome} />
    </>
  )
}
export default App