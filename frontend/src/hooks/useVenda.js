import api from "../utils/api";

function useVenda() {
    async function getAll() {
        const response = await api.get('/venda/getAll');
        return response.data;
    }

    async function getById(id) {
        const response = await api.get(`/venda/getById/${id}`);
        return response.data;
    }

    async function create(venda) {
        const response = await api.post('/venda/create', venda);
        return response.data;
    }

    return { getAll, getById, create };
}

export default useVenda;

