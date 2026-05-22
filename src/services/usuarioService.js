import axiosInstance from './api';
import { authService } from './authService';

export const usuarioService = {
  async listarTodos() {
    try {
      return await axiosInstance.get('/users');
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
      return await axiosInstance.get(`/users/${id}`);
    } catch (error) {
      console.error('Erro ao buscar por ID do usuário:', error);
      throw error;
    }
  },

  async criar(usuario) {
    try {
      return await axiosInstance.post('/clients', usuario);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  },

  async atualizar(id, dadosAtualizados) {
    try {
      return await axiosInstance.put(`/clients/${id}`, dadosAtualizados);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw new Error('Não foi possível atualizar o usuário');
    }
  },

  async deletar(id) {
    try {
      await axiosInstance.delete(`/clients/${id}`);
      return true;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw new Error('Não foi possível deletar o usuário');
    }
  }
};