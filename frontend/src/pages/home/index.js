import { useState, useEffect } from "react";
import useProduto from "../../hooks/useProduto";
import useVenda from "../../hooks/useVenda";

const Home = () => {
    const [produtos, setProdutos] = useState([]);
    const [carrinho, setCarrinho] = useState([]);

    const { getAll } = useProduto();
    const { create } = useVenda();

    async function carregarProdutos() {
        const dados = await getAll();
        setProdutos(dados || []);
    }

    useEffect(() => {
        carregarProdutos();
    }, []);

    function adicionarAoCarrinho(item) {
        const itemExistente = carrinho.find((c) => c.id === item.id);
        if (itemExistente) {
            setCarrinho(
                carrinho.map((c) =>
                    c.id === item.id ? { ...c, quantidade: c.quantidade + 1 } : c
                )
            );
        } else {
            setCarrinho([...carrinho, { ...item, quantidade: 1 }]);
        }
    }

    function alterarQuantidade(id, delta) {
        const novoCarrinho = carrinho
            .map((item) => {
                if (item.id === id) {
                    const novaQtd = item.quantidade + delta;
                    return novaQtd > 0 ? { ...item, quantidade: novaQtd } : null;
                }
                return item;
            })
            .filter(Boolean);

        setCarrinho(novoCarrinho);
    }

    function removerDoCarrinho(id) {
        setCarrinho(carrinho.filter((item) => item.id !== id));
    }

    const total = carrinho.reduce((acc, item) => acc + Number(item.preco) * item.quantidade, 0);

    async function finalizarVenda() {
        if (carrinho.length === 0) {
            alert("O carrinho está vazio");
            return;
        }

        try {
            await create({
                itens: carrinho.map((item) => ({
                    produtoId: item.id,
                    nome: item.nome,
                    preco: Number(item.preco),
                    quantidade: item.quantidade
                }))
            });

            alert("Venda finalizada com sucesso!");
            setCarrinho([]);
        } catch (error) {
            alert("Erro ao finalizar a venda");
        }
    }

    return (
        <div className="container mt-4">
            <h1 className="text-center fs-4">Painel de Vendas</h1>

            <div className="row mt-4">
                <div className="col-md-8">
                    <h4>Produtos</h4>
                    <div className="row">
                        {produtos.length === 0 ? (
                            <p className="text-muted">Nenhum produto cadastrado</p>
                        ) : (
                            produtos.map((item) => (
                                <div className="col-md-4 mb-3" key={item.id}>
                                    <div className="card h-100 text-center">
                                        {item.imagem ? (
                                            <img
                                                src={item.imagem}
                                                alt={item.nome}
                                                className="card-img-top"
                                                style={{ height: "130px", objectFit: "contain" }}
                                            />
                                        ) : (
                                            <div className="p-4 bg-light text-muted">Sem foto</div>
                                        )}
                                        <div className="card-body d-flex flex-column">
                                            <h5 className="card-title fs-6">{item.nome}</h5>
                                            <p className="card-text fw-bold text-success">
                                                R$ {Number(item.preco).toFixed(2)}
                                            </p>
                                            <button
                                                className="btn btn-primary btn-sm mt-auto"
                                                onClick={() => adicionarAoCarrinho(item)}
                                            >
                                                Adicionar ao Carrinho
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="col-md-4">
                    <h4>Carrinho de Compras</h4>
                    <table className="table table-sm">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Qtd</th>
                                <th>Subtotal</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {carrinho.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center text-muted">
                                        Carrinho vazio
                                    </td>
                                </tr>
                            ) : (
                                carrinho.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.nome}</td>
                                        <td>
                                            <button
                                                className="btn btn-outline-secondary btn-sm px-1 py-0 me-1"
                                                onClick={() => alterarQuantidade(item.id, -1)}
                                            >
                                                -
                                            </button>
                                            {item.quantidade}
                                            <button
                                                className="btn btn-outline-secondary btn-sm px-1 py-0 ms-1"
                                                onClick={() => alterarQuantidade(item.id, 1)}
                                            >
                                                +
                                            </button>
                                        </td>
                                        <td>R$ {(Number(item.preco) * item.quantidade).toFixed(2)}</td>
                                        <td>
                                            <button
                                                className="btn btn-danger btn-sm px-1 py-0"
                                                onClick={() => removerDoCarrinho(item.id)}
                                            >
                                                x
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <div className="d-flex justify-content-between mt-3">
                        <h5>Total:</h5>
                        <h5 className="text-success">R$ {total.toFixed(2)}</h5>
                    </div>

                    <button
                        className="btn btn-success w-100 mt-2"
                        disabled={carrinho.length === 0}
                        onClick={finalizarVenda}
                    >
                        Finalizar Venda
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
