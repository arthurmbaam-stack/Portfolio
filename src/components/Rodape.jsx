import './Rodape.css'

function Rodape({ nome }) {
    return (
    <footer className="rodape">
        © {new Date().getFullYear()} {nome}. Feito com React e muita música.
    </footer>
    )
}

export default Rodape
