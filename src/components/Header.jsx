import './Header.css'

const links = [
    { href: '#sobre', texto: 'Sobre' },
    { href: '#projetos', texto: 'Projetos' },
    { href: '#experiencias', texto: 'Experiências' },
    { href: '#certificados', texto: 'Certificados' },
    { href: '#interesses', texto: 'Interesses' },
    { href: '#musicas', texto: 'Músicas' },
    { href: '#contato', texto: 'Contato' },
]

function Header({ nome }) {
    return (
    <header className="cabecalho">
        <div className="container cabecalho-conteudo">
        <a href="#inicio" className="cabecalho-nome">{nome}</a>
        <nav aria-label="Navegação principal">
            <ul>
            {links.map((l) => (
                <li key={l.href}><a href={l.href}>{l.texto}</a></li>
            ))}
            </ul>
        </nav>
        </div>
    </header>
    )
}

export default Header
