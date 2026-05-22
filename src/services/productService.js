import axiosInstance from './api';

const mapProduct = (data) => {
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


export const productService = {
  async findAll() {
    try {
      return await axiosInstance.get('/products');
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw new Error('Não foi possível buscar os produtos');
    }
  },

  async findById(id) {
    try {
      const data = await axiosInstance.get(`/products/${id}`);
      return mapProduct(data);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      throw error;
    }
  },

  async findByCategory(category) {
    try {
      const data = await axiosInstance.get(`/products/category/${category}`);
      return data.map(mapProduct);
    } catch (error) {
      console.error('Erro ao buscar produtos por categoria:', error);
      throw new Error('Não foi possível buscar os produtos');
    }
  },

  async create(product) {
    try {
      const data = await axiosInstance.post('/products', product);
      return mapProduct(data);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw new Error('Não foi possível criar o produto');
    }
  },

  async update(id, updatedData) {
    try {
      const data = await axiosInstance.put(`/products/${id}`, updatedData);
      return mapProduct(data);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw new Error('Não foi possível atualizar o produto');
    }
  },

  async delete(id) {
    try {
      await axiosInstance.delete(`/products/${id}`);
      return true;
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw new Error('Não foi possível deletar o produto');
    }
  }
};
