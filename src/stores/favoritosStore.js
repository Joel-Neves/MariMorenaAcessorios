import { defineStore } from 'pinia';
import { authService } from '../services/authService';
import { favoritosService } from '../services/favoritosService';
import { produtoService } from '../services/produtoService';

export const useFavoritosStore = defineStore('favoritos', {
  state: () => ({
    favoritos: [],
    carregando: false,
    erro: null
  }),

  getters: {
    isFavorito: (state) => (produtoId) => {
      return state.favoritos.some(fav => fav.productId === produtoId);
    },

    getFavoritoPorId: (state) => (produtoId) => {
      return state.favoritos.find(fav => fav.productId === produtoId);
    },

    favoritosComProdutos: (state) => {
      return state.favoritos
        .filter(fav => fav.produto)
        .map(fav => fav.produto);
    }
  },

  actions: {
    async carregarFavoritos() {
      const user = authService.getCurrentUser();
      if (!user) return;

      this.carregando = true;
      this.erro = null;
      try {
        const favoritosData = await favoritosService.carregarFavoritos(user.id);
        
        // Buscar dados completos de cada produto
        const favoritosComProdutos = await Promise.all(
          favoritosData.map(async (fav) => {
            try {
              const produto = await produtoService.buscarPorId(fav.productId);
              return { ...fav, produto };
            } catch (error) {
              console.error(`Erro ao buscar produto ${fav.productId}:`, error);
              return fav;
            }
          })
        );
        
        this.favoritos = favoritosComProdutos;
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
        this.favoritos.push({ ...novoFavorito, produto });
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
        this.favoritos = this.favoritos.filter(fav => fav.productId !== produtoId);
      } catch (error) {
        this.erro = error.message;
        console.error('Erro ao remover favorito:', error);
        throw error;
      } finally {
        this.carregando = false;
      }
    }
  },
});
