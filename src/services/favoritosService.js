import axiosInstance from './api';

export const favoritosService = {
  async carregarFavoritos(userId) {
    try {
      const response = await axiosInstance.get(`/favorites/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async adicionarFavorito(userId, produto) {
    try {
      const response = await axiosInstance.post(`/favorites/${userId}/${produto.id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async removerFavorito(favoritoId) {
    try {
      await axiosInstance.delete(`/favorites/${favoritoId}`);
    } catch (error) {
      throw error;
    }
  },
  async favoritado(userId, produtoId) {
    try {
      const response = await axiosInstance.get(`/favorites/${userId}/${produtoId}`);
      return response.data.favoritado;
    } catch (error) {
      throw error;
    }
  }
};
