import { defineStore } from 'pinia';

export const useBagStore = defineStore('bag', {
  state: () => ({
    items: []
  }),

  getters: {
    totalItems(state) {
      return state.items.reduce((total, item) => total + item.quantity, 0);
    },

    totalValue(state) {
      return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    getItemById: (state) => (productId) => {
      return state.items.find(item => item.id === productId);
    }
  },

  actions: {
    
    addItem(product) {
      const itemExistence = this.items.find(item => item.id === product.id);

      if (itemExistence) {
        itemExistence.quantity++;
      } else {
        this.items.push({
          ...product,
          quantity: 1
        });
      }
    },

    removeItem(productId) {
      const index = this.items.findIndex(item => item.id === productId);
      if (index !== -1) {
        this.items.splice(index, 1);
      }
    },

    updateQuantity(productId, quantity) {
      const item = this.items.find(item => item.id === productId);
      if (item) {
        if (quantity <= 0) {
          this.removeItem(productId);
        } else {
          item.quantity = quantity;
        }
      }
    },

    clearBag() {
      this.items = [];
    }
  },
  persist: true

});
