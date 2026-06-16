import { defineStore } from "pinia";
import { authService } from "../services/authService";
import { favoritosService } from "../services/favoritosService";

export const useFavoritosStore = defineStore("favoritos", {
  state: () => ({
    favoritos: [],
    carregando: false,
    erro: null,
  }),

  getters: {
    produtosFavoritos: (state) => {
      return state.favoritos.map((fav) => fav.product);
    },

    isFavorito: (state) => (produtoId) => {
      return state.favoritos.some((fav) => fav.product.id === produtoId);
    },

    getFavoritoPorProdutoId: (state) => (produtoId) => {
      return state.favoritos.find((fav) => fav.product.id === produtoId);
    },
  },

  actions: {
    async carregarFavoritos() {
      const user = authService.getCurrentUser();

      if (!user) {
        this.favoritos = [];
        return;
      }

      this.carregando = true;
      this.erro = null;

      try {
        this.favoritos = await favoritosService.carregarFavoritos(user.id);
      } catch (error) {
        this.erro = error.message;
        console.error("Erro ao carregar favoritos:", error);
      } finally {
        this.carregando = false;
      }
    },

    async adicionarFavorito(product) {
      const user = authService.getCurrentUser();

      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      if (this.isFavorito(product.id)) {
        return;
      }

      try {
        const novoFavorito = await favoritosService.adicionarFavorito(
          user.id,
          product,
        );

        this.favoritos.push(novoFavorito);
      } catch (error) {
        this.erro = error.message;
        throw error;
      }
    },

    async removerFavorito(produtoId) {
      const favorito = this.getFavoritoPorProdutoId(produtoId);

      if (!favorito) return;

      await favoritosService.removerFavorito(favorito.id);

      this.favoritos = this.favoritos.filter(
        (fav) => fav.product.id !== produtoId,
      );
    },
  },
});
