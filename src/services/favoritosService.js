import axiosInstance from './api';

export const favoritosService = {
  async carregarFavoritos(userId) {
    try {
      return await axiosInstance.get(`/favoritos/usuario/${userId}`);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      throw error;
    }
  },

  async adicionarFavorito(userId, produto) {
    try {
      return await axiosInstance.post('/favoritos', {
        userId,
        produtoId: produto.id,
        produto,
        dataAdicionado: new Date()
      });
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      throw error;
    }
  },

  async removerFavorito(favoritoId) {
    try {
      await axiosInstance.delete(`/favoritos/${favoritoId}`);
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      throw error;
    }
  }
};
