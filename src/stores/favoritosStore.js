import { defineStore } from 'pinia';
import { authService } from '../services/authService';
import { favoritosService } from '../services/favoritosService';

export const useFavoritosStore = defineStore('favoritos', {
  state: () => ({
    favoritos: [],
    carregando: false,
    erro: null
  }),

  getters: {
    isFavorito: (state) => (produtoId) => {
      return state.favoritos.some(fav => fav.produtoId === produtoId);
    },

    getFavoritoPorId: (state) => (produtoId) => {
      return state.favoritos.find(fav => fav.produtoId === produtoId);
    },

    favoritosComProdutos: (state) => {
      return state.favoritos.map(fav => fav.produto).filter(Boolean);
    }
  },

  actions: {
    async carregarFavoritos() {
      const user = authService.getCurrentUser();
      if (!user) return;

      this.carregando = true;
      this.erro = null;
      try {
        this.favoritos = await favoritosService.carregarFavoritos(user.id);
      } catch (error) {
        this.erro = error.message;
        console.error('Erro ao carregar favoritos:', error);
      } finally {
        this.carregando = false;
      }
    },

    async adicionarFavorito(produto) {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      if (this.isFavorito(produto.id)) return; 

      this.carregando = true;
      this.erro = null;
      try {
        const novoFavorito = await favoritosService.adicionarFavorito(user.id, produto);
        this.favoritos.push(novoFavorito);
      } catch (error) {
        this.erro = error.message;
        console.error('Erro ao adicionar favorito:', error);
        throw error;
      } finally {
        this.carregando = false;
      }
    },

    async removerFavorito(produtoId) {
      const favorito = this.getFavoritoPorId(produtoId);
      if (!favorito) return;

      this.carregando = true;
      this.erro = null;
      try {
        await favoritosService.removerFavorito(favorito.id);
        this.favoritos = this.favoritos.filter(fav => fav.produtoId !== produtoId);
      } catch (error) {
        this.erro = error.message;
        console.error('Erro ao remover favorito:', error);
        throw error;
      } finally {
        this.carregando = false;
      }
    }
  },

  persist: true
});
