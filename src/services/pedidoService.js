import apiClient from './api';

export const pedidoService = {
  async listarTodos() {
    try {
      return await apiClient.get('/pedidos');
    } catch (error) {
      console.error('Erro ao listar pedidos:', error);
      throw new Error('Não foi possível carregar os pedidos');
    }
  },

  async buscarPorId(id) {
    try {
      return await apiClient.get(`/pedidos/${id}`);
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      throw error;
    }
  },

  async buscarPorUsuario(userId) {
    try {
      return await apiClient.get(`/pedidos/usuario/${userId}`);
    } catch (error) {
      console.error('Erro ao buscar pedidos por usuário:', error);
      throw new Error('Não foi possível buscar os pedidos');
    }
  },

  async buscarPorStatus(status) {
    try {
      return await apiClient.get(`/pedidos/status/${status}`);
    } catch (error) {
      console.error('Erro ao buscar pedidos por status:', error);
      throw new Error('Não foi possível buscar os pedidos');
    }
  },

  async criar(pedido) {
    try {
      return await apiClient.post('/pedidos', pedido);
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      throw new Error('Não foi possível criar o pedido');
    }
  },

  async atualizar(id, dadosAtualizados) {
    try {
      return await apiClient.put(`/pedidos/${id}`, dadosAtualizados);
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      throw new Error('Não foi possível atualizar o pedido');
    }
  },

  async deletar(id) {
    try {
      await apiClient.delete(`/pedidos/${id}`);
      return true;
    } catch (error) {
      console.error('Erro ao deletar pedido:', error);
      throw new Error('Não foi possível deletar o pedido');
    }
  }
};
