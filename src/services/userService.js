import axiosInstance from './api';
import { authService } from './authService';

export const userService = {
  async create(user) {
    try {
      return await axiosInstance.post('/users', user);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  },
  async getAll() {
    try {
      return await axiosInstance.get('/users');
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      throw new Error('Não foi possível carregar os usuários');
    }
  },

  async findById(id) {
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

  async findByEmail(email) {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }

      const role = currentUser?.role || 'CONSUMER';
      
      if (role === 'ADMIN') {
        return await axiosInstance.get(`/users/admins/email/${email}`);
      }
      return await axiosInstance.get(`/users/clients/email/${email}`);
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      throw new Error('Não foi possível buscar o usuário');
    }
  },


  async update(id, updatedData) {
    try {
      return await axiosInstance.put(`/users/${id}`, updatedData);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw new Error('Não foi possível atualizar o usuário');
    }
  },

  async delete(id) {
    try {
      await axiosInstance.delete(`/users/${id}`);
      return true;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw new Error('Não foi possível deletar o usuário');
    }
  }
};