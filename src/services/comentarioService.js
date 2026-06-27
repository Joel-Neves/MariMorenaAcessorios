import axiosInstance from "./api";

const mapComentario = (comentario) => ({
  id: comentario.id,
  conteudo: comentario.content,
  clienteNome: comentario.authorName,
  clienteId: comentario.clientId,
  produtoNome: comentario.productName,
  createdAt: comentario.createdAt,
});

export const comentarioService = {
  async listarTodos() {
    try {
      const response = await axiosInstance.get("/comments");
      return response.data.map(mapComentario);
    } catch (error) {
      throw error;
    }
  },

  async buscarPorId(id) {
    try {
      const response = await axiosInstance.get(`/comments/${id}`);
      return mapComentario(response.data);
    } catch (error) {
      throw error;
    }
  },
/*
  async buscarPorProduto(produtoId, page = 0, size = 5) {
    const response = await axiosInstance.get(`/comments/product/${produtoId}`, {
      params: { page, size, sort: "createdAt" },
    });
    return {
      comentarios: response.data.content.map(mapComentario),
      paginacao: {
        currentPage: response.data.number,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
        isLast: response.data.last,
        isFirst: response.data.first,
      },
    };
  },
  */
 async buscarPorProduto(produtoId) {
    try {
      const comentarios = await axiosInstance.get(`/comments/product/${produtoId}`);
      return comentarios.data.map(mapComentario);
    } catch (error) {
      throw error;
    }
  },
  async buscarPorCliente(clienteId) {
    try {
      const comentarios = await this.listarTodos();
      return comentarios.filter(
        (comentario) => comentario.clienteId === clienteId,
      );
    } catch (error) {
      throw error;
    }
  },

  async criar(comentario) {
    try {
      const response = await axiosInstance.post("/comments", comentario);
      return mapComentario(response.data);
    } catch (error) {
      throw error;
    }
  },

  async atualizar(id, dadosAtualizados) {
    try {
      const response = await axiosInstance.put(
        `/comments/${id}`,
        dadosAtualizados,
      );
      return mapComentario(response.data);
    } catch (error) {
      throw error;
    }
  },

  async deletar(id) {
    try {
      await axiosInstance.delete(`/comments/${id}`);
    } catch (error) {
      throw error;
    }
  },
};
