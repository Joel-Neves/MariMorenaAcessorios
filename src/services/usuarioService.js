import axiosInstance from './api';

const mapUsuario = (data = {}) => ({
  id: data.id,
  nome: data.name,
  email: data.email
});

export const usuarioService = {
  async listarTodos() {
    try {
      const response = await axiosInstance.get('/clients');
      return response.data.map(mapUsuario);
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
      const response = await axiosInstance.get(`/clients/${id}`);
      return mapUsuario(response.data);
    } catch (error) {
      console.error('Erro ao buscar por ID do usuário:', error);
      throw error;
    }
  },

  async criar(usuario) {
    try {
      const response = await axiosInstance.post('/clients', usuario);
      return mapUsuario(response.data);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  },

  async atualizar(id, dadosAtualizados) {
    try {
      const response = await axiosInstance.put(`/clients/${id}`, dadosAtualizados);
      return mapUsuario(response.data);
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