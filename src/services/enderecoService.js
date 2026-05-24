import axiosInstance from "./api";

export const enderecoService = {
    async listarTodos() {
        try {
            const response = await axiosInstance.get('/addresses');
            return response.data;
        } catch (error) {
            console.error('Erro ao listar endereços:', error);
            throw new Error('Não foi possível carregar os endereços');
        }
    },
    async criar(endereco) {
        try {
            const response = await axiosInstance.post('/addresses', endereco);
            return response.data;
        } catch (error) {
            console.error('Erro ao criar endereço:', error);
            throw new Error('Não foi possível criar o endereço');
        }
    },

    async buscarPorId(id) {
        try {
            const response = await axiosInstance.get(`/addresses/${id}`);
            return response?.data || null; // Retorna null se o endereço não for encontrado
        } catch (error) {
            console.error('Erro ao buscar endereço:', error);
            throw new Error('Não foi possível buscar o endereço');
        }
    },
    async buscarPorUsuario(clientId) {
        try {
            const response = await axiosInstance.get(`/addresses/client/${clientId}`);
            return response?.data || null; // Retorna null se não houver endereço para o usuário
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
            throw new Error('Não foi possível atualizar o endereço');
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
