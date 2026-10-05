import { useState } from 'react'
import { contato } from '../data/contato'
import './Contato.css'

function Contato() {
  const [status, setStatus] = useState('parado') // parado | enviando | sucesso | erro

    async function enviar(evento) {
    evento.preventDefault()
    const form = evento.currentTarget
    setStatus('enviando')

    try {
        const resposta = await fetch(contato.formEndpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
        })
        if (!resposta.ok) throw new Error('Falha no envio')
        form.reset()
        setStatus('sucesso')
    } catch {
        setStatus('erro')
    }
    }

    return (
    <section id="contato" className="secao secao--alt">
        <div className="container contato-grade">
        <div>
            <h2 className="secao-titulo">Contato</h2>
            <p className="secao-intro">Vamos conversar? Mande uma mensagem ou me encontre nas redes.</p>
            <p><a href={`mailto:${contato.email}`}>{contato.email}</a></p>
            <ul className="contato-redes">
            {contato.redes.map((r) => (
                <li key={r.nome}>
                <a href={r.url} target="_blank" rel="noreferrer">{r.nome}</a>
                </li>
            ))}
            </ul>
        </div>

        <form className="contato-form papel" onSubmit={enviar}>
            <label htmlFor="nome">Nome</label>
            <input id="nome" name="nome" type="text" required autoComplete="name" />

            <label htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" required autoComplete="email" />

            <label htmlFor="mensagem">Mensagem</label>
            <textarea id="mensagem" name="mensagem" rows="5" required />

            <button type="submit" className="botao botao--primario" disabled={status === 'enviando'}>
            {status === 'enviando' ? 'Enviando...' : 'Enviar mensagem'}
            </button>

            <p className="contato-status" role="status">
            {status === 'sucesso' && 'Mensagem enviada. Obrigado pelo contato!'}
            {status === 'erro' && 'Não foi possível enviar. Tente novamente ou use o e-mail ao lado.'}
            </p>
        </form>
        </div>
    </section>
    )
}

export default Contato
