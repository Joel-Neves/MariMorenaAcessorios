import apiClient from './api';

export const usuarioService = {
  async listarTodos() {
    try {
      return await apiClient.get('/users');
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      throw new Error('Não foi possível carregar os usuários');
    }
  },

  async buscarPorId(id) {
    try {
      if (!id) {
        throw new Error('ID do usuário não fornecido');
      }
      return await apiClient.get(`/users/${id}`);
    } catch (error) {
      console.error('Erro ao buscar por ID do usuário:', error);
      throw error;
    }
  },

  async buscarPorEmail(email) {
    try {
      return await apiClient.get(`/users/email/${email}`);
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      throw new Error('Não foi possível buscar o usuário');
    }
  },

  async criar(usuario) {
    try {
      return await apiClient.post('/users', usuario);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  },

  async atualizar(id, dadosAtualizados) {
    try {
      return await apiClient.put(`/users/${id}`, dadosAtualizados);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw new Error('Não foi possível atualizar o usuário');
    }
  },

  async deletar(id) {
    try {
      await apiClient.delete(`/users/${id}`);
      return true;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw new Error('Não foi possível deletar o usuário');
    }
  }
};
