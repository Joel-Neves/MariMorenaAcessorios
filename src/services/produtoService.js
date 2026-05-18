import apiClient from './api';

export const produtoService = {
  async listarTodos() {
    try {
      return await apiClient.get('/produtos');
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      throw new Error('Não foi possível carregar os produtos');
    }
  },

  async buscarPorId(id) {
    try {
      return await apiClient.get(`/produtos/${id}`);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      throw error;
    }
  },

  async buscarPorCategoria(categoria) {
    try {
      return await apiClient.get(`/produtos/categoria/${categoria}`);
    } catch (error) {
      console.error('Erro ao buscar produtos por categoria:', error);
      throw new Error('Não foi possível buscar os produtos');
    }
  },

  async criar(produto) {
    try {
      return await apiClient.post('/produtos', produto);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw new Error('Não foi possível criar o produto');
    }
  },

  async atualizar(id, dadosAtualizados) {
    try {
      return await apiClient.put(`/produtos/${id}`, dadosAtualizados);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw new Error('Não foi possível atualizar o produto');
    }
  },

  async deletar(id) {
    try {
      await apiClient.delete(`/produtos/${id}`);
      return true;
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw new Error('Não foi possível deletar o produto');
    }
  }
};
