import apiClient from './api';

function mapProduto(apiProduto) {
  if (!apiProduto) return null;

  const imagens = Array.isArray(apiProduto.imagens)
    ? apiProduto.imagens.map((imagem) => (typeof imagem === 'string' ? { url: imagem } : imagem)).filter(Boolean)
    : Array.isArray(apiProduto.images)
      ? apiProduto.images.map((imagem) => (typeof imagem === 'string' ? { url: imagem } : imagem)).filter(Boolean)
      : [];

  return {
    ...apiProduto,
    nome: apiProduto.nome ?? apiProduto.name ?? '',
    descricao: apiProduto.descricao ?? apiProduto.description ?? '',
    preco: Number(apiProduto.preco ?? apiProduto.price ?? 0),
    estoque: Number(apiProduto.estoque ?? apiProduto.quantity ?? 0),
    categoria: apiProduto.categoria ?? apiProduto.category ?? null,
    cor: apiProduto.cor ?? apiProduto.color ?? '',
    imagens
  };
}

function extrairListaProdutos(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

export const produtoService = {
  async listarTodos() {
    try {
      const data = await apiClient.get('/products');
      return extrairListaProdutos(data).map(mapProduto);
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      throw new Error('Não foi possível carregar os produtos');
    }
  },

  async buscarPorId(id) {
    try {
      const data = await apiClient.get(`/products/${id}`);
      return mapProduto(data);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      throw error;
    }
  },

  async buscarPorCategoria(category) {
    try {
      const data = await apiClient.get(`/products/category/${category}`);
      return extrairListaProdutos(data).map(mapProduto);
    } catch (error) {
      console.error('Erro ao buscar produtos por categoria:', error);
      throw new Error('Não foi possível buscar os produtos');
    }
  },

  async criar(product) {
    try {
      const data = await apiClient.post('/products', product);
      return mapProduto(data);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw new Error('Não foi possível criar o produto');
    }
  },

  async atualizar(id, dadosAtualizados) {
    try {
      const data = await apiClient.put(`/products/${id}`, dadosAtualizados);
      return mapProduto(data);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw new Error('Não foi possível atualizar o produto');
    }
  },

  async deletar(id) {
    try {
      await apiClient.delete(`/products/${id}`);
      return true;
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw new Error('Não foi possível deletar o produto');
    }
  }
};
