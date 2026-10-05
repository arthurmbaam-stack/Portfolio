import { useState } from 'react'
import { perfil } from '../data/perfil'
import './Sobre.css'

function Sobre() {
    const [idioma, setIdioma] = useState('pt')
    const titulo = idioma === 'pt' ? 'Sobre mim' : 'About me'

    return (
        <section id="sobre" className="secao secao--alt">
        <div className="container">
            <div className="sobre-topo">
            <h2 className="secao-titulo">{titulo}</h2>
            <div className="sobre-idioma" role="group" aria-label="Idioma / Language">
                <button type="button" aria-pressed={idioma === 'pt'} onClick={() => setIdioma('pt')}>PT</button>
                <button type="button" aria-pressed={idioma === 'en'} onClick={() => setIdioma('en')}>EN</button>
            </div>
            </div>

            <div className="sobre-grade">
            <div className="sobre-texto" lang={idioma}>
                {perfil.sobre[idioma].map((p) => <p key={p}>{p}</p>)}
                <h3>{idioma === 'pt' ? 'Objetivos' : 'Goals'}</h3>
                <p>{perfil.objetivos[idioma]}</p>
                <a href={perfil.curriculo} download className="botao botao--primario">
                {idioma === 'pt' ? 'Baixar currículo' : 'Download résumé'}
                </a>
            </div>

            <aside className="sobre-formacao papel">
                <h3>{idioma === 'pt' ? 'Formação' : 'Education'}</h3>
                {perfil.formacao.map((f) => (
                <div key={f.curso}>
                    <strong>{f.curso}</strong>
                    <p>{f.instituicao}</p>
                    <p className="sobre-periodo">{f.periodo}</p>
                </div>
                ))}
            </aside>
            </div>
        </div>
        </section>
    )
}

export default Sobre
