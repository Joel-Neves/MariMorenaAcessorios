import { defineStore } from 'pinia';

export const useBagStore = defineStore('bag', {
  state: () => ({
    itens: []
  }),

  getters: {
    totalItems(state) {
      return state.itens.reduce((total, item) => total + item.quantity, 0);
    },

    totalValue(state) {
      return state.itens.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    getItemById: (state) => (productId) => {
      return state.itens.find(item => item.id === productId);
    }
  },

  actions: {
    addItem(product) {
      const itemExistence = this.itens.find(item => item.id === product.id);

      if (itemExistence) {
        itemExistence.quantity++;
      } else {
        this.itens.push({
          ...product,
          quantity: 1
        });
      }
    },

    removeItem(productId) {
      const index = this.itens.findIndex(item => item.id === productId);
      if (index !== -1) {
        this.itens.splice(index, 1);
      }
    },

    updateQuantity(productId, quantity) {
      const item = this.itens.find(item => item.id === productId);
      if (item) {
        if (quantity <= 0) {
          this.removeItem(productId);
        } else {
          item.quantity = quantity;
        }
      }
    },

    clearBag() {
      this.itens = [];
    }
  },

  persist: true
});
