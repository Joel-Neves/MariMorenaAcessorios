import axiosInstance from './api';

export const favoritosService = {
  async carregarFavoritos(userId) {
    try {
      const response = await axiosInstance.get(`/favorites/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      throw error;
    }
  },

  async adicionarFavorito(userId, produto) {
    try {
      return await axiosInstance.post('/favorites', {
        userId,
        produtoId: produto.id,
      });
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      throw error;
    }
  },

  async removerFavorito(favoritoId) {
    try {
      await axiosInstance.delete(`/favorites/${favoritoId}`);
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      throw error;
    }
  }
};
