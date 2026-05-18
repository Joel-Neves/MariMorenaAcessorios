import apiClient from './api';

export const authService = {
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      return response.user;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw new Error(error.message || 'Email ou senha incorretos');
    }
  },

  async registrar(email, password, displayName, arquivoFoto, dadosAdicionais = {}) {
    try {
      // Fazer upload da foto se fornecida
      let photoURL = '';
      if (arquivoFoto) {
        const uploadResponse = await this.uploadFoto(arquivoFoto);
        photoURL = uploadResponse.url;
      }

      // Registrar usuário
      const response = await apiClient.post('/users', {
        email,
        password,
        nome: displayName,
        photoURL,
        telefone: dadosAdicionais.telefone,
        ...dadosAdicionais
      });

      localStorage.setItem('authToken', response.token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      return response.user;
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      throw new Error(error.message || 'Erro ao registrar usuário');
    }
  },

  async logout() {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      return true;
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw new Error('Erro ao fazer logout');
    }
  },

  async updateProfile(updates) {
    try {
      const response = await apiClient.put('/users/{id}/profile', updates);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      return response.user;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw new Error('Erro ao atualizar perfil');
    }
  },

  async resetPassword(email) {
    try {
      await apiClient.post('/auth/reset-password', { email });
      return true;
    } catch (error) {
      console.error('Erro ao enviar email de redefinição:', error);
      throw new Error('Erro ao enviar email de redefinição');
    }
  },

  async uploadFoto(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response;
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      throw new Error('Erro ao fazer upload da foto');
    }
  },

  getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  },

  getToken() {
    return localStorage.getItem('authToken');
  },

  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  async waitForUser() {
    return new Promise((resolve) => {
      const user = this.getCurrentUser();
      if (user) {
        resolve(user);
      } else {
        setTimeout(() => {
          resolve(this.getCurrentUser());
        }, 100);
      }
    });
  }
};
