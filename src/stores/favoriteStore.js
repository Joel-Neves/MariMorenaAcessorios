import { defineStore } from 'pinia';
import { authService } from '../services/authService';
import { favoriteService } from '../services/favoriteService';

export const useFavoriteStore = defineStore('favorite', {
  state: () => ({
    favorites: [],
    loading: false,
    error: null
  }),

  getters: {
    isFavorite: (state) => (productId) => {
      return state.favorites.some(fav => fav.productId === productId);
    },

    getFavoriteById: (state) => (productId) => {
      return state.favorites.find(fav => fav.productId === productId);
    },

    productFavorited: (state) => {
      return state.favorites.map(fav => fav.product).filter(Boolean);
    }
  },

  actions: {
    async loadFavorites() {
      const user = authService.getCurrentUser();
      if (!user) return;

      this.loading = true;
      this.error = null;
      try {
        this.favorites = await favoriteService.loadFavorites(user.id);
      } catch (error) {
        this.error = error.message;
        console.error('Erro ao carregar favorites:', error);
      } finally {
        this.loading = false;
      }
    },

    async addFavorite(produto) {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      if (this.isFavorite(produto.id)) return; 

      this.loading = true;
      this.error = null;
      try {
        const newFavorite = await favoriteService.addFavorite(user.id, produto);
        this.favorites.push(newFavorite);
      } catch (error) {
        this.error = error.message;
        console.error('Erro ao adicionar favorite:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async removeFavorite(produtoId) {
      const favorite = this.getFavoriteById(produtoId);
      if (!favorite) return;

      this.loading = true;
      this.error = null;
      try {
        await favoriteService.removeFavorite(favorite.id);
        this.favorites = this.favorites.filter(fav => fav.productId !== produtoId);
      } catch (error) {
        this.error = error.message;
        console.error('Erro ao remover favorite:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    }
  },

  persist: true
});
