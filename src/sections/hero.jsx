import Vinil from '../components/Vinil'
import './Hero.css'

function Hero({ nome, cargo, iniciais }) {
    return (
        <section id="inicio" className="hero">
        <div className="container hero-conteudo">
            <div className="hero-texto">
            <h1 className="hero-nome">{nome}</h1>
            <p className="hero-cargo">{cargo}</p>
            <div className="hero-botoes">
                <a href="#projetos" className="botao botao--primario">Conheça meus projetos</a>
                <a href="#contato" className="botao botao--secundario">Entre em contato</a>
            </div>
            </div>
            <Vinil iniciais={iniciais} />
        </div>
        </section>
    )
    }

export default Hero
