function Rodape({ nome }) {
    return (
        <footer style={{ padding: '32px 0', textAlign: 'center', color: 'var(--texto-suave)', fontSize: 14 }}>
        © {new Date().getFullYear()} {nome}. Feito com React e muita música.
        </footer>
    )
}

export default Rodape
