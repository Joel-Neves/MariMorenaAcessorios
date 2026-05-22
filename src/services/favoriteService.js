import axiosInstance from './api';

export const favoriteService = {
  async findById(userId) {
    try {
      return await axiosInstance.get(`/favorites/${userId}`);
    } catch (error) {
      console.error('Erro ao carregar favorites:', error);
      throw error;
    }
  },

  async create(userId, productId) {
    try {
      return await axiosInstance.post('/favorites', {
        userId,
        productId: productId,
      });
    } catch (error) {
      console.error('Erro ao adicionar favorite:', error);
      throw error;
    }
  },

  async delete(favoriteId) {
    try {
      await axiosInstance.delete(`/favorites/${favoriteId}`);
    } catch (error) {
      console.error('Erro ao remover favorite:', error);
      throw error;
    }
  }
};
