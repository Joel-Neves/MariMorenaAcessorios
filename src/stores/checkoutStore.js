import { defineStore } from 'pinia';

export const useCheckoutStore = defineStore('checkout', {
  state: () => ({
    address: null,
    payment: null,
    order: null
  }),

  actions: {
    setAddress(address) {
      this.address = address;
    },

    setPayment(payment) {
      this.payment = payment;
    },

    setOrder(order) {
      this.order = order;
    },

    clearCheckout() {
      this.address = null;
      this.payment = null;
      this.order = null;
    }
  },

  persist: true
});
