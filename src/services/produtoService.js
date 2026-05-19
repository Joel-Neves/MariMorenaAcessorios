import axiosInstance from './api';

const mapProduto = (data) => {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    price: data.price,
    quantity: data.quantity,
    color: data.color,
    category: data.category,
    imageUrl: data.imageUrl
  };
}


export const produtoService = {
  async buscarTodos() {
    try {
      return await axiosInstance.get('/products');
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw new Error('Não foi possível buscar os produtos');
    }
  },

  async buscarPorId(id) {
    try {
      const data = await axiosInstance.get(`/products/${id}`);
      return mapProduto(data);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      throw error;
    }
  },

  async buscarPorCategoria(category) {
    try {
      const data = await axiosInstance.get(`/products/category/${category}`);
      return data.map(mapProduto);
    } catch (error) {
      console.error('Erro ao buscar produtos por categoria:', error);
      throw new Error('Não foi possível buscar os produtos');
    }
  },

  async criar(product) {
    try {
      const data = await axiosInstance.post('/products', product);
      return mapProduto(data);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw new Error('Não foi possível criar o produto');
    }
  },

  async atualizar(id, dadosAtualizados) {
    try {
      const data = await axiosInstance.put(`/products/${id}`, dadosAtualizados);
      return mapProduto(data);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw new Error('Não foi possível atualizar o produto');
    }
  },

  async deletar(id) {
    try {
      await axiosInstance.delete(`/products/${id}`);
      return true;
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw new Error('Não foi possível deletar o produto');
    }
  }
};
