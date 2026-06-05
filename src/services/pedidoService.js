import axiosInstance from './api';

export const pedidoService = {
  async listarTodos() {
    try {
      const response = await axiosInstance.get('/orders');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar pedidos:', error);
      throw new Error('Não foi possível carregar os pedidos');
    }
  },

  async buscarPorId(id) {
    try {
      const response = await axiosInstance.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      throw error;
    }
  },

  async buscarPorUsuario(clientId) {
    try {
      const response = await axiosInstance.get(`/orders/client/${clientId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pedidos por usuário:', error);
      throw new Error('Não foi possível buscar os pedidos');
    }
  },

  async criar(pedido) {
    try {
      const response = await axiosInstance.post('/orders', pedido);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      throw new Error('Não foi possível criar o pedido');
    }
  },

  async atualizar(id, dadosAtualizados) {
    try {
      const response = await axiosInstance.put(`/orders/${id}`, dadosAtualizados);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      throw new Error('Não foi possível atualizar o pedido');
    }
  },
  async atualizarStatus(id, status) {
    try {
      const response = await axiosInstance.patch(`/orders/${id}/status?status=${status}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      throw new Error('Não foi possível atualizar o status do pedido');
    }
  },

  async deletar(id) {
    try {
      const response = await axiosInstance.delete(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar pedido:', error);
      throw new Error('Não foi possível deletar o pedido');
    }
  }
};
