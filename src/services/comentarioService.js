import axiosInstance from './api';

export const comentarioService = {
  async listarTodos() {
    try {
      return await axiosInstance.get('/comentarios');
    } catch (error) {
      console.error('Erro ao listar comentários:', error);
      throw new Error('Não foi possível carregar os comentários');
    }
  },

  async buscarPorId(id) {
    try {
      return await axiosInstance.get(`/comentarios/${id}`);
    } catch (error) {
      console.error('Erro ao buscar comentário:', error);
      throw error;
    }
  },

  async buscarPorProduto(produtoId) {
    try {
      return await axiosInstance.get(`/comentarios/produto/${produtoId}`);
    } catch (error) {
      console.error('Erro ao buscar comentários por produto:', error);
      throw new Error('Não foi possível buscar os comentários');
    }
  },

  async buscarPorUsuario(userId) {
    try {
      return await axiosInstance.get(`/comentarios/usuario/${userId}`);
    } catch (error) {
      console.error('Erro ao buscar comentários por usuário:', error);
      throw new Error('Não foi possível buscar os comentários');
    }
  },

  async criar(comentario) {
    try {
      return await axiosInstance.post('/comentarios', {
        ...comentario,
        dataCriacao: new Date(),
        aprovado: comentario.aprovado || false
      });
    } catch (error) {
      console.error('Erro ao criar comentário:', error);
      throw new Error('Não foi possível criar o comentário');
    }
  },

  async atualizar(id, dadosAtualizados) {
    try {
      return await axiosInstance.put(`/comentarios/${id}`, dadosAtualizados);
    } catch (error) {
      console.error('Erro ao atualizar comentário:', error);
      throw new Error('Não foi possível atualizar o comentário');
    }
  },

  async deletar(id) {
    try {
      await axiosInstance.delete(`/comentarios/${id}`);
      return true;
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
      throw new Error('Não foi possível deletar o comentário');
    }
  },

  async aprovarComentario(id) {
    try {
      return await axiosInstance.put(`/comentarios/${id}/aprovar`, { aprovado: true });
    } catch (error) {
      console.error('Erro ao aprovar comentário:', error);
      throw new Error('Não foi possível aprovar o comentário');
    }
  },

  async reprovarComentario(id) {
    try {
      return await axiosInstance.put(`/comentarios/${id}/reprovar`, { aprovado: false });
    } catch (error) {
      console.error('Erro ao reprovar comentário:', error);
      throw new Error('Não foi possível reprovar o comentário');
    }
  }
};
