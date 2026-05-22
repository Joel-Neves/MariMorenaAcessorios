import axiosInstance from './api';

export const commentService = {
  async findAll() {
    try {
      return await axiosInstance.get('/comments');
    } catch (error) {
      console.error('Erro ao listar comentários:', error);
      throw new Error('Não foi possível carregar os comentários');
    }
  },

  async findById(id) {
    try {
      return await axiosInstance.get(`/comments/${id}`);
    } catch (error) {
      console.error('Erro ao buscar comentário:', error);
      throw error;
    }
  },

  async findByProduct(productId) {
    try {
      return await axiosInstance.get(`/comments/product/${productId}`);
    } catch (error) {
      console.error('Erro ao buscar comentários por produto:', error);
      throw new Error('Não foi possível buscar os comentários');
    }
  },

  async findByUser(userId) {
    try {
      return await axiosInstance.get(`/comments/user/${userId}`);
    } catch (error) {
      console.error('Erro ao buscar comentários por usuário:', error);
      throw new Error('Não foi possível buscar os comentários');
    }
  },

  async create(comment) {
    try {
      return await axiosInstance.post('/comments', {
        ...comment,
        createdAt: new Date(),
        approved: comment.approved || false
      });
    } catch (error) {
      console.error('Erro ao criar comentário:', error);
      throw new Error('Não foi possível criar o comentário');
    }
  },

  async update(id, updatedData) {
    try {
      return await axiosInstance.put(`/comments/${id}`, updatedData);
    } catch (error) {
      console.error('Erro ao atualizar comentário:', error);
      throw new Error('Não foi possível atualizar o comentário');
    }
  },

  async delete(id) {
    try {
      await axiosInstance.delete(`/comments/${id}`);
      return true;
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
      throw new Error('Não foi possível deletar o comentário');
    }
  },

  async approveComment(id) {
    try {
      return await axiosInstance.put(`/comments/${id}/approve`, { approved: true });
    } catch (error) {
      console.error('Erro ao aprovar comentário:', error);
      throw new Error('Não foi possível aprovar o comentário');
    }
  },

  async reproveComment(id) {
    try {
      return await axiosInstance.put(`/comments/${id}/reprove`, { approved: false });
    } catch (error) {
      console.error('Erro ao reprovar comentário:', error);
      throw new Error('Não foi possível reprovar o comentário');
    }
  }
};
