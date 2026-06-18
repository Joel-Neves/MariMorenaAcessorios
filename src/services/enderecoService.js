import axiosInstance from "./api";

const mapEndereco = (endereco) => ({
    id: endereco.id,
    rua: endereco.street,
    numero: endereco.number,
    complemento: endereco.complement,
    bairro: endereco.neighborhood,
    cidade: endereco.city,
    estado: endereco.state,
    cep: endereco.zipCode,
    pais: endereco.country,
    clientId: endereco.clientId
});

export const enderecoService = {
    async listarTodos() {
        try {
            const response = await axiosInstance.get('/addresses');
            return response.data.map(mapEndereco);
        } catch (error) {
            console.error('Erro ao listar endereços:', error);
            throw new Error('Não foi possível carregar os endereços');
        }
    },
    async criar(endereco) {
        try {
            const response = await axiosInstance.post('/addresses', endereco);
            return mapEndereco(response.data);
        } catch (error) {
            console.error('Erro ao criar endereço:', error);
            // Extrai a mensagem real do backend para facilitar o debug
            const backendMsg = error?.response?.data?.message 
                || error?.response?.data?.error 
                || error?.response?.statusText 
                || 'Não foi possível criar o endereço';
            console.error('Mensagem do backend:', backendMsg);
            throw new Error(backendMsg);
        }
    },

    async buscarPorId(id) {
        try {
            const response = await axiosInstance.get(`/addresses/${id}`);
            return mapEndereco(response?.data) || null; // Retorna null se o endereço não for encontrado
        } catch (error) {
            console.error('Erro ao buscar endereço:', error);
            throw new Error('Não foi possível buscar o endereço');
        }
    },
    async buscarPorUsuario(clientId) {
        try {
            const response = await axiosInstance.get(`/addresses/client/${clientId}`);
            const data = response?.data;
            // Garante que sempre retorna um array
            if (Array.isArray(data)) {
                return data.map(mapEndereco);
            } else if (data) {
                return [data]; // Objeto único vira array com 1 elemento
            }
            return []; // Nulo/undefined vira array vazio
        } catch (error) {
            console.error('Erro ao buscar endereço por usuário:', error);
            throw new Error('Não foi possível buscar o endereço');
        }
    },
    
    async atualizar(id, dadosAtualizados) {
        try {
            const response = await axiosInstance.put(`/addresses/${id}`, dadosAtualizados);
            return response.data;
        } catch (error) {
            console.error('Erro ao atualizar endereço:', error);
            const backendMsg = error?.response?.data?.message 
                || error?.response?.data?.error 
                || error?.response?.statusText 
                || 'Não foi possível atualizar o endereço';
            throw new Error(backendMsg);
        }
    },

    async deletar(id) {
        try {
            await axiosInstance.delete(`/addresses/${id}`);
        } catch (error) {
            console.error('Erro ao deletar endereço:', error);
            throw new Error('Não foi possível deletar o endereço');
        }
    }
};
