import axiosInstance from "./api";

const mapProduto = (data) => {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    price: data.price,
    quantity: data.quantity,
    color: data.color,
    category: data.category,
    imageUrl: (data.imageUrl || []).map((url) => ({ url })), // Mapeia cada URL para um objeto com a propriedade 'url'
  };
};

export const produtoService = {
  async buscarTodos() {
    try {
      const response = await axiosInstance.get("/products");
      return response.data.map(mapProduto);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      throw new Error("Não foi possível buscar os produtos");
    }
  },

  async buscarPorId(id) {
    try {
      const response = await axiosInstance.get(`/products/${id}`);
      return mapProduto(response.data);
    } catch (error) {
      console.error("Erro ao buscar produto:", error);
      throw error;
    }
  },

  async buscarPorCategoria(category) {
    try {
      const response = await axiosInstance.get(
        `/products/category/${category}`,
      );
      return response.data.map(mapProduto);
    } catch (error) {
      console.error("Erro ao buscar produtos por categoria:", error);
      throw new Error("Não foi possível buscar os produtos");
    }
  },

  async criar(product, arquivos) {
    try {
      const formData = new FormData();

      const productBlob = new Blob([JSON.stringify(product)], {
        type: "application/json",
      });

      formData.append("product", productBlob);

      arquivos.forEach((arquivo) => {
        formData.append("files", arquivo);
      });

      const response = await axiosInstance.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      throw new Error("Não foi possível cadastrar o produto");
    }
  },

  async atualizar(id, dadosAtualizados) {
    try {
      const response = await axiosInstance.put(
        `/products/${id}`,
        dadosAtualizados,
      );
      return mapProduto(response.data);
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      throw new Error("Não foi possível atualizar o produto");
    }
  },

  async deletar(id) {
    try {
      await axiosInstance.delete(`/products/${id}`);
      return true;
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
      throw new Error("Não foi possível deletar o produto");
    }
  },
};
