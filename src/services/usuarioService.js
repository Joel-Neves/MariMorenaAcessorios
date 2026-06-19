import axiosInstance from './api';

const mapUsuario = (data = {}) => ({
  id: data.id,
  nome: data.name,
  email: data.email,
  telefone: data.phone,
});

export const usuarioService = {
  async listarTodos() {
    try {
      const response = await axiosInstance.get('/clients');
      return response.data.map(mapUsuario);
    } catch (error) {
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
      throw new Error('Não foi possível buscar o usuário');
    }
  },

  async criar(usuario) {
    try {
      const response = await axiosInstance.post('/clients', usuario);
      return mapUsuario(response.data);
    } catch (error) {
      throw new Error('Não foi possível criar o usuário');
    }
  },

  async atualizar(id, dadosAtualizados) {
    try {
      const response = await axiosInstance.put(`/clients/${id}`, dadosAtualizados);
      return mapUsuario(response.data);
    } catch (error) {
      throw new Error('Não foi possível atualizar o usuário');
    }
  },

  async deletar(id) {
    try {
      await axiosInstance.delete(`/clients/${id}`);
      return true;
    } catch (error) {
      throw new Error('Não foi possível deletar o usuário');
    }
  }
};