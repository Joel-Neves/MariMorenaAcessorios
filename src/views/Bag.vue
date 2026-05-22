<template>
  <div class="bag">
    <div class="bag-container">
      <h1 class="titulo">Minha Sacola</h1>

      <div v-if="items.length === 0" class="void">
        <p>Sua sacola está vazia</p>
        <router-link to="/" class="btn-continuar">Continuar Comprando</router-link>
      </div>

      <div v-else class="bag-content">
        <div class="items-list">
          <div v-for="item in items" :key="item.id" class="item-card">
            <div class="item-image">
              <img :src="item.images[0].url" :alt="item.name" />
            </div>

            <div class="item-info">
              <h3>{{ item.name }}</h3>
              <p class="category">{{ item.category }}</p>
              <p class="price">R$ {{ formatPrice(item.price) }}</p>
            </div>

            <div class="item-actions">
              <div class="quantity-controls">
                <button @click="removeQuantity(item)" :disabled="item.quantity <= 1">-</button>
                <span class="quantity">{{ item.quantity }}</span>
                <button @click="increaseQuantity(item)">+</button>
              </div>

              <p class="subtotal">Subtotal: R$ {{ formatPrice(item.price * item.quantity) }}</p>

              <button class="btn-remover" @click="removeItem(item.id)">Remover</button>
            </div>
          </div>
        </div>

        <div class="resume">
          <h2>Resumo do Order</h2>
          <p style="color: red; font-size: small;"> Compras acima de R$ 99,99 não paga frete</p>
          <div class="resumo-line">
            <span>Total de itens:</span>
            <span>{{ totalItems }}</span>
            <span>Frete:</span>
            <span>{{ frete.toFixed(2) }}</span>
          </div>

          <div class="resumo-line total">
            <span>Total:</span>
            <span>R$ {{ formatPrice(totalValue.value + frete.value) }}</span>
          </div>

          <button class="btn-confirmOrder" @click="confirmOrder">Finalizar Compra</button>

          <router-link to="/" class="btn-continueShopping">Continuar Comprando</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useBagStore } from '../stores/bagStore';

const router = useRouter();
const bagStore = useBagStore();

const items = computed(() => bagStore.itens);
const totalItems = computed(() => bagStore.totalItems);
const totalValue = computed(() => bagStore.totalValue);

const frete = computed(() => totalValue.value >= 100 ? 0 : 15);

const formatPrice = (price) => {
  return price.toFixed(2).replace('.', ',');
};

const increaseQuantity = (item) => {
  bagStore.updateQuantity(item.id, item.quantity + 1);
};

const removeQuantity = (item) => {
  if (item.quantity > 1) {
    bagStore.updateQuantity(item.id, item.quantity - 1);
  }
};

const removeItem = (itemId) => {
  bagStore.removeItem(itemId);
};

const confirmOrder = () => {
  router.push('/checkout/endereco');
};
</script>

<style scoped>
.bag {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem 1rem;
}

.bag-container {
  max-width: 1200px;
  margin: 0 auto;
}

.titulo {
  text-align: center;
  color: #1a1a1a;
  font-size: 2.5rem;
  margin-bottom: 2rem;
}

.bag-vazio {
  text-align: center;
  padding: 3rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.bag-vazio p {
  font-size: 1.2rem;
  color: #666666;
  margin-bottom: 2rem;
}

.btn-continueShopping {
  display: inline-block;
  padding: 0.8rem 2rem;
  background-color: #d4af37;
  color: #1a1a1a;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-continueShopping:hover {
  background-color: #c49b2a;
}

.bag-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item-card {
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: 1.5rem;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-image {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info h3 {
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.item-info .category {
  color: #666666;
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
}

.item-info .preco {
  color: #d4af37;
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0;
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-end;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 2px solid #d4af37;
  border-radius: 8px;
  overflow: hidden;
}

.quantity-controls button {
  width: 35px;
  height: 35px;
  border: none;
  background-color: #d4af37;
  color: #1a1a1a;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.quantity-controls button:hover:not(:disabled) {
  background-color: #c49b2a;
}

.quantity-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-controls .quantity {
  width: 50px;
  text-align: center;
  font-weight: 600;
  background-color: #ffffff;
}

.subtotal {
  color: #1a1a1a;
  font-weight: 600;
  margin: 0;
}

.btn-remove {
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-remove:hover {
  background-color: #e74c3c;
  color: #ffffff;
}

.resume {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.resume h2 {
  color: #1a1a1a;
  font-size: 1.5rem;
  margin: 0 0 1.5rem 0;
}

.resume-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  color: #666666;
}

.resume-line.total {
  font-size: 1.3rem;
  font-weight: bold;
  color: #1a1a1a;
  padding-top: 1rem;
  border-top: 2px solid #f5f5f5;
  margin-top: 1rem;
}

.resume-line.total span:last-child {
  color: #d4af37;
}

.btn-confirmOrder {
  width: 100%;
  padding: 1rem;
  background-color: #d4af37;
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 1.5rem;
}

.btn-confirmOrder:hover {
  background-color: #c49b2a;
}

.btn-continueShopping {
  display: block;
  text-align: center;
  margin-top: 1rem;
  color: #666666;
  text-decoration: none;
  transition: color 0.3s;
}

.btn-continueShopping:hover {
  color: #d4af37;
}

@media (max-width: 968px) {
  .bag-content {
    grid-template-columns: 1fr;
  }

  .resume {
    position: static;
  }

  .item-card {
    grid-template-columns: 100px 1fr;
    gap: 1rem;
  }

  .item-actions {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
