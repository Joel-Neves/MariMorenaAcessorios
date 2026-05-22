import { defineStore } from 'pinia';
import { productService } from '../services/productService';

export const useProductStore = defineStore('products', {
  state: () => ({
    products: [],
    currentProduct: null,
    loading: false,
    error: null
  }),

  getters: {
    getProductById: (state) => (id) => {
      return state.products.find(product => product.id === id);
    },

    productsByCategory: (state) => (category) => {
      if (!category) return state.products;
      return state.products.filter(product => product.category === category);
    },

    categories(state) {
      const products = Array.isArray(state.products) ? state.products : [];
      const cats = products.map(p => p.categoria).filter(Boolean);
      return [...new Set(cats)];
    }
  },

  actions: {
    async loadProducts() {
      this.loading = true;
      this.error = null;
      try {
        const products = await productService.loadProducts();
        this.products = Array.isArray(products) ? products : [];
      } catch (error) {
        this.error = error.message;
        console.error('Erro ao carregar produtos:', error);
      } finally {
        this.loading = false;
      }
    },

    async loadProduct(id) {
      this.loading = true;
      this.error = null;
      try {
        this.currentProduct = await productService.loadProduct(id);
      } catch (error) {
        this.error = error.message;
        console.error('Erro ao carregar produto:', error);
      } finally {
        this.loading = false;
      }
    },

    async createProduct(product) {
      this.loading = true;
      this.error = null;
      try {
        const newProduct = await productService.createProduct(product);
        this.products.push(newProduct);
        return newProduct;
      } catch (error) {
        this.error = error.message;
        console.error('Erro ao criar produto:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateProduct(id, updatedData) {
      this.loading = true;
      this.error = null;
      try {
        const updatedProduct = await productService.updateProduct(id, updatedData);
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
          this.products[index] = { ...this.products[index], ...updatedProduct };
        }
        return updatedProduct;
      } catch (error) {
        this.error = error.message;
        console.error('Erro ao atualizar produto:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteProduct(id) {
      this.loading = true;
      this.error = null;
      try {
        await productService.deleteProduct(id);
        this.products = this.products.filter(p => p.id !== id);
      } catch (error) {
        this.error = error.message;
        console.error('Erro ao deletar produto:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
