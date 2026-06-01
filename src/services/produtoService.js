import axiosInstance from "./api";

const API_BASE_URL = "http://localhost:8080";

function normalizarUrlImagem(url) {
  if (!url) return "";
  return `${API_BASE_URL}${url}`;
}

function mapProduto(data) {
  const imagens = data.imageUrls.map((img) => ({
    url: normalizarUrlImagem(img),
  }));


  return {
    id: data.id,
    nome: data.name,
    descricao: data.description,
    preco: data.price,
    estoque: data.quantity,
    cor: data.color,
    categoria: data.category ? getLabel(categoryMap, data.category, data.category) : "",
    imagens,
  };
}
const categoryMap = {
  RINGS: "Anéis",
  EARRINGS: "Brincos",
  NECKLACES: "Colares",
  SETS: "Conjuntos",
  BRACELETS: "Pulseiras",
  HEADBANDS: "Tiaras",
  OTHERS: "Outros",
};
function getLabel(map, value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  const key = String(value).toUpperCase();
  return map?.[key] ?? fallback ?? value;
}

export function formatarPreco(valor) {
  const numero = Number(valor ?? 0);
  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function obterUrlImagem(produto) {
  if (produto.imagens && produto.imagens.length > 0) {
    return produto.imagens[0].url;
  }
}

export function temImagem(produto) {
  return Boolean(obterUrlImagem(produto));
}

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
