import { defineStore } from 'pinia';

export const useSacolaStore = defineStore('sacola', {
  state: () => ({
    itens: []
  }),

  getters: {
    totalItens(state) {
      return state.itens.reduce((total, item) => total + item.quantidade, 0);
    },

    valorTotal(state) {
      return state.itens.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    },

    getItemPorId: (state) => (produtoId) => {
      return state.itens.find(item => item.id === produtoId);
    }
  },

  actions: {
    adicionarItem(produto) {
      const itemExistente = this.itens.find(item => item.id === produto.id);

      if (itemExistente) {
        itemExistente.quantidade++;
      } else {
        this.itens.push({
          ...produto,
          quantidade: 1
        });
      }
    },

    removerItem(produtoId) {
      const index = this.itens.findIndex(item => item.id === produtoId);
      if (index !== -1) {
        this.itens.splice(index, 1);
      }
    },

    atualizarQuantidade(produtoId, quantidade) {
      const item = this.itens.find(item => item.id === produtoId);
      if (item) {
        if (quantidade <= 0) {
          this.removerItem(produtoId);
        } else {
          item.quantidade = quantidade;
        }
      }
    },

    limparSacola() {
      this.itens = [];
    }
  }
});
