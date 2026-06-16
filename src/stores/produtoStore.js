import { defineStore } from 'pinia';
import { produtoService } from '../services/produtoService';

export const useProdutoStore = defineStore('products', {
  state: () => ({
    produtos: [],
    produtoAtual: null,
    carregando: false,
    erro: null
  }),

  getters: {
    getProdutoPorId: (state) => (id) => {
      return state.produtos.find(produto => produto.id === id);
    },

    produtosPorCategoria: (state) => (categoria) => {
      if (!categoria) return state.produtos;
      return state.produtos.filter(produto => (produto.categoria || produto.categoria) === categoria);
    },

    categorias(state) {
      const produtos = Array.isArray(state.produtos) ? state.produtos : [];
      const cats = produtos.map(p => p.categoria || p.categoria).filter(Boolean);
      return [...new Set(cats)];
    }
  },

  actions: {
    async carregarProdutos() {
      this.carregando = true;
      this.erro = null;
      try {
        const produtos = await produtoService.buscarTodos();
        this.produtos = Array.isArray(produtos) ? produtos : [];
      } catch (error) {
        this.erro = error.message;
        console.error('Erro ao carregar produtos:', error);
      } finally {
        this.carregando = false;
      }
    },

    async carregarProduto(id) {
      this.carregando = true;
      this.erro = null;
      try {
        this.produtoAtual = await produtoService.buscarPorId(id);
      } catch (error) {
        this.erro = error.message;
        console.error('Erro ao carregar produto:', error);
      } finally {
        this.carregando = false;
      }
    },

    async criarProduto(produto) {
      this.carregando = true;
      this.erro = null;
      try {
        const novoProduto = await produtoService.criar(produto);
        this.produtos.push(novoProduto);
        return novoProduto;
      } catch (error) {
        this.erro = error.message;
        console.error('Erro ao criar produto:', error);
        throw error;
      } finally {
        this.carregando = false;
      }
    },

    async atualizarProduto(id, dadosAtualizados) {
      this.carregando = true;
      this.erro = null;
      try {
        const produtoAtualizado = await produtoService.atualizar(id, dadosAtualizados);
        const index = this.produtos.findIndex(p => p.id === id);
        if (index !== -1) {
          this.produtos[index] = { ...this.produtos[index], ...produtoAtualizado };
        }
        return produtoAtualizado;
      } catch (error) {
        this.erro = error.message;
        console.error('Erro ao atualizar produto:', error);
        throw error;
      } finally {
        this.carregando = false;
      }
    },

    async deletarProduto(id) {
      this.carregando = true;
      this.erro = null;
      try {
        await produtoService.deletar(id);
        this.produtos = this.produtos.filter(p => p.id !== id);
      } catch (error) {
        this.erro = error.message;
        console.error('Erro ao deletar produto:', error);
        throw error;
      } finally {
        this.carregando = false;
      }
    },
    async atualizarEstoque(id, quantidade) {
      this.carregando = true;
      this.erro = null;
      try {
        const produtoAtualizado = await produtoService.atualizarEstoque(id, quantidade);
        const index = this.produtos.findIndex(p => p.id === id);
        if (index !== -1) {
          this.produtos[index] = { ...this.produtos[index], ...produtoAtualizado };
        }
        return produtoAtualizado;
      } catch (error) {
        this.erro = error.message;
        console.error('Erro ao atualizar estoque:', error);
        throw error;
      } finally {
        this.carregando = false;
      }
    }
  }
});
