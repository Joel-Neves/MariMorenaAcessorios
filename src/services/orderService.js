import axiosInstance from './api';

export const orderService = {
  async findAll() {
    try {
      return await axiosInstance.get('/orders');
    } catch (error) {
      console.error('Erro ao listar orders:', error);
      throw new Error('Não foi possível carregar os orders');
    }
  },

  async findById(id) {
    try {
      return await axiosInstance.get(`/orders/${id}`);
    } catch (error) {
      console.error('Erro ao buscar order:', error);
      throw error;
    }
  },

  async findByUserId(userId) {
    try {
      return await axiosInstance.get(`/orders/user/${userId}`);
    } catch (error) {
      console.error('Erro ao buscar orders por usuário:', error);
      throw new Error('Não foi possível buscar os orders');
    }
  },

  async findByStatus(status) {
    try {
      return await axiosInstance.get(`/orders/status/${status}`);
    } catch (error) {
      console.error('Erro ao buscar orders por status:', error);
      throw new Error('Não foi possível buscar os orders');
    }
  },

  async create(order) {
    try {
      return await axiosInstance.post('/orders', order);
    } catch (error) {
      console.error('Erro ao criar order:', error);
      throw new Error('Não foi possível criar o order');
    }
  },

  async update(id, updatedData) {
    try {
      return await axiosInstance.put(`/orders/${id}`, updatedData);
    } catch (error) {
      console.error('Erro ao atualizar order:', error);
      throw new Error('Não foi possível atualizar o order');
    }
  },

  async delete(id) {
    try {
      await axiosInstance.delete(`/orders/${id}`);
      return true;
    } catch (error) {
      console.error('Erro ao deletar order:', error);
      throw new Error('Não foi possível deletar o order');
    }
  }
};
