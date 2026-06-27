import { defineStore } from "pinia";
import { comentarioService } from "@/services/comentarioService";

export const useComentarioStore = defineStore("comentario", {
  state: () => ({
    comentarios: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    getComentariosPorProduto: (state) => (produtoId) =>
      state.comentarios.filter((c) => c.produtoId === produtoId),
    getComentariosPorUsuario: (state) => (clienteId) =>
      state.comentarios.filter((c) => c.clienteId === clienteId),
  },

  actions: {
    async carregarComentarios(produtoId) {
      this.isLoading = true;
      this.error = null;
      try {
        const comentarios = await comentarioService.buscarPorProduto(produtoId);
        this.comentarios = comentarios;
      } catch (error) {
        this.error = error;
      } finally {
        this.isLoading = false;
      }
    },

    async adicionarComentario(comentario) {
      try {
        const novoComentario = await comentarioService.criar(comentario);
        this.comentarios.push(novoComentario);
        return novoComentario;
      } catch (error) {
        this.error = error;
        throw error;
      }
    },

    async removerComentario(comentarioId) {
      try {
        await comentarioService.deletar(comentarioId);
        this.comentarios = this.comentarios.filter(
          (c) => c.id !== comentarioId,
        );
      } catch (error) {
        this.error = error;
        throw error;
      }
    },

    async atualizarComentario(comentarioId, novoConteudo) {
      try {
        const atualizado = await comentarioService.atualizar(
          comentarioId,
          novoConteudo,
        );
        const index = this.comentarios.findIndex((c) => c.id === comentarioId);
        if (index !== -1) this.comentarios[index] = atualizado;
        return atualizado;
      } catch (error) {
        this.error = error;
        throw error;
      }
    },
  },
});
