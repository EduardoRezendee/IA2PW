import { useState, useEffect } from "react";
import InputGroup from "../../components/inputGroup";
import useProduto from "../../hooks/useProduto";

const Produtos = () => {
    const [produto, setProduto] = useState({ nome: '', preco: '', imagem: '' });
    const [listaProdutos, setListaProdutos] = useState([]);
    const [editandoId, setEditandoId] = useState(null);

    const { getAll, create, update, remove } = useProduto();

    async function carregarProdutos() {
        const dados = await getAll();
        setListaProdutos(dados || []);
    }

    useEffect(() => {
        carregarProdutos();
    }, []);

    function validarImagem(url) {
        if (!url) return true;
        const regex = /\.(jpeg|jpg|png)(\?.*)?$/i;
        const regexBase64 = /^data:image\/(jpeg|jpg|png);base64,/i;
        return regex.test(url) || regexBase64.test(url);
    }

    function validateProduto(produto) {
        if (!produto.nome || !produto.nome.trim()) {
            alert("O campo nome é obrigatório");
            return false;
        }
        if (produto.preco === '' || produto.preco === undefined) {
            alert("O campo preço é obrigatório");
            return false;
        }
        if (Number(produto.preco) < 0) {
            alert("O preço não pode ser negativo");
            return false;
        }
        if (produto.imagem && !validarImagem(produto.imagem)) {
            alert("A imagem deve ser no formato .jpeg ou .png");
            return false;
        }
        return true;
    }

    function handleChange(e) {
        setProduto({ ...produto, [e.target.name]: e.target.value });
    }

    function handleArquivo(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            alert("Apenas imagens .jpeg e .png são permitidas");
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setProduto((prev) => ({ ...prev, imagem: reader.result }));
        };
        reader.readAsDataURL(file);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!validateProduto(produto)) {
            return;
        }

        const dados = {
            nome: produto.nome.trim(),
            preco: Number(produto.preco),
            imagem: produto.imagem || null
        };

        if (editandoId) {
            await update(editandoId, dados);
            setEditandoId(null);
        } else {
            await create(dados);
        }

        setProduto({ nome: '', preco: '', imagem: '' });
        carregarProdutos();
    }

    function handleEditar(item) {
        setEditandoId(item.id);
        setProduto({ nome: item.nome, preco: item.preco, imagem: item.imagem || '' });
    }

    async function handleExcluir(id) {
        if (window.confirm("Deseja excluir este produto?")) {
            await remove(id);
            carregarProdutos();
        }
    }

    return (
        <div className="container">
            <h1 className="text-center fs-4">Produtos</h1>
            <div>
                <form onSubmit={handleSubmit}>
                    <InputGroup
                        label="Nome"
                        onChange={handleChange}
                        type="text"
                        placeholder="Nome do Produto"
                        name="nome"
                        value={produto.nome} />
                    <InputGroup
                        label="Preço"
                        onChange={handleChange}
                        type="number"
                        placeholder="Preço do Produto"
                        name="preco"
                        min="0"
                        step="0.01"
                        value={produto.preco} />
                    <InputGroup
                        label="Imagem (URL)"
                        onChange={handleChange}
                        type="text"
                        placeholder="URL da Imagem (.jpeg ou .png)"
                        name="imagem"
                        value={produto.imagem && !produto.imagem.startsWith('data:') ? produto.imagem : ''} />

                    <div className="input-group mb-3">
                        <span className="input-group-text">Arquivo</span>
                        <input
                            className="form-control"
                            type="file"
                            accept="image/png, image/jpeg"
                            onChange={handleArquivo} />
                    </div>

                    <button className="btn btn-primary" type="submit">
                        {editandoId ? "Atualizar" : "Salvar"}
                    </button>
                    {editandoId && (
                        <button
                            className="btn btn-secondary ms-2"
                            type="button"
                            onClick={() => {
                                setEditandoId(null);
                                setProduto({ nome: '', preco: '', imagem: '' });
                            }}>
                            Cancelar
                        </button>
                    )}
                </form>
            </div>
            <table className="table table-striped mt-3">
                <thead>
                    <tr>
                        <th>Imagem</th>
                        <th>Nome</th>
                        <th>Preço</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {listaProdutos.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center">Nenhum produto encontrado</td>
                        </tr>
                    ) : (
                        listaProdutos.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    {item.imagem ? (
                                        <img src={item.imagem} alt={item.nome} width="50" height="50" style={{ objectFit: 'cover' }} />
                                    ) : (
                                        "-"
                                    )}
                                </td>
                                <td>{item.nome}</td>
                                <td>R$ {Number(item.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td>
                                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleEditar(item)}>
                                        Editar
                                    </button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleExcluir(item.id)}>
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Produtos;
