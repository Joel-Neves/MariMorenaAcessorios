import axiosInstance from "./api"; // seu cliente axios

export const authService = {
  /**
   * Registrar novo usuário
   * O backend retorna um UserResponseDTO
   */
  async registrar(name, email, phone, password) {
    try {
      const response = await axiosInstance.post('/clients', {
        name: name,
        email,
        phone: phone,
        password},
        { withCredentials: true }
        
      );

      // Extrair usuário da resposta (axios retorna em response.data)
      const user = response?.data ?? response ?? null;

      if (!user) {
        throw new Error('Resposta do servidor inválida: usuário não retornado');
      }

      localStorage.setItem('currentUser', JSON.stringify(user));
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
      return user;
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Erro ao registrar';
      throw new Error(msg);
    }
  },

  /**
   * Fazer login
   * Recebe email + password, retorna UserResponseDTO
   */
  async login(email, password) {
    try {
      const response = await axiosInstance.post(
        '/auth/login',
        { email, password },
        { withCredentials: true }
      );

      const user = response?.data?.user ?? null;
      if (!user) throw new Error('Usuário não retornado');

      // Armazene o usuário logado
      localStorage.setItem('currentUser', JSON.stringify(user));
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
      return user;
    } catch (error) {
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
      throw new Error(error?.response?.data?.message || error?.message);
    }
  },

  /**
   * Fazer logout
   * Limpa localStorage e encerra sessão HTTP
   */
  async logout() {
    try {
      await axiosInstance.post('/auth/logout');
      localStorage.removeItem('currentUser');
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  },

  /**
   * Obter usuário armazenado em localStorage
   * Parse seguro com tratamento de erro
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.warn('Invalid currentUser in localStorage, removing it.', e);
      localStorage.removeItem('currentUser');
      return null;
    }
  },

  /**
   * Verificar se está autenticado
   */
  isAuthenticated() {
    return !!this.getCurrentUser();
  },

  /**
   * Espera pelo usuário armazenado no localStorage (útil em guards)
   */
  async waitForUser() {
    return new Promise((resolve) => {
      const start = Date.now();
      const timeout = 1000;

      const checkUser = () => {
        const user = this.getCurrentUser();

        if (user) {
          resolve(user);
          return;
        }

        if (Date.now() - start >= timeout) {
          resolve(null);
          return;
        }

        setTimeout(checkUser, 100);
      };

      checkUser();
    });
  },

  /**
   * Validar autenticação com o backend
   * Retorna usuário se autenticado, lança erro se não
   */
  async verifyAuth() {
    try {
      const response = await axiosInstance.get('/auth/me');
      const user = response?.data ?? response ?? null;
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
      return user;
    } catch (error) {
      localStorage.removeItem('currentUser');
      throw error;
    }
  }
};

export default authService;