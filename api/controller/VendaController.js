const Venda = require('../model/Venda.js');

module.exports = class VendaController {
    static async create(req, res) {
        const { itens } = req.body ?? {};

        if (!Array.isArray(itens) || itens.length === 0) {
            return res.status(422).json({ message: 'O carrinho está vazio ou os itens são inválidos' });
        }

        let totalCalculado = 0;
        const itensValidados = [];

        for (const item of itens) {
            const quantidade = Number(item.quantidade);
            const preco = Number(item.preco);

            if (!item.nome || typeof item.nome !== 'string') {
                return res.status(422).json({ message: 'Nome do produto no item é obrigatório' });
            }
            if (!Number.isInteger(quantidade) || quantidade <= 0) {
                return res.status(422).json({ message: `Quantidade inválida para o item: ${item.nome}` });
            }
            if (!Number.isFinite(preco) || preco < 0) {
                return res.status(422).json({ message: `Preço inválido para o item: ${item.nome}` });
            }

            const subtotal = Number((preco * quantidade).toFixed(2));
            totalCalculado += subtotal;

            itensValidados.push({
                produtoId: item.produtoId || item.id || null,
                nome: item.nome,
                preco,
                quantidade,
                subtotal
            });
        }

        try {
            const venda = await Venda.create({
                valorTotal: Number(totalCalculado.toFixed(2)),
                itens: itensValidados,
                status: 'FINALIZADA'
            });

            res.status(201).json({
                message: 'Venda finalizada com sucesso',
                venda
            });
        } catch (err) {
            console.error('Erro ao finalizar venda:', err);
            res.status(500).json({ message: 'Erro ao processar a venda' });
        }
    }

    static async getAll(req, res) {
        try {
            const vendas = await Venda.findAll({ order: [['id', 'DESC']] });
            res.status(200).json(vendas);
        } catch (err) {
            console.error('Erro ao buscar vendas:', err);
            res.status(500).json({ message: 'Erro ao buscar as vendas' });
        }
    }

    static async getById(req, res) {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(422).json({ message: 'ID de venda inválido' });
        }

        try {
            const venda = await Venda.findByPk(id);
            if (!venda) {
                return res.status(404).json({ message: 'Venda não encontrada' });
            }
            res.status(200).json(venda);
        } catch (err) {
            console.error('Erro ao buscar venda por id:', err);
            res.status(500).json({ message: 'Erro ao buscar a venda' });
        }
    }
};

