<template>
  <div class="product-detalhes">
    <div v-if="loading" class="loading">
      <p>Carregando product...</p>
    </div>

    <div v-else-if="error" class="erro">
      <p>{{ error }}</p>
      <router-link to="/" class="btn-voltar">Voltar ao Catálogo</router-link>
    </div>

    <div v-else-if="product" class="product-container">
      <button @click="$router.go(-1)" class="btn-voltar-simples">← Voltar</button>

      <div class="product-content">
        <div class="product-galeria">
          <div class="imagem-principal">
            <img :src="currentImage" :alt="product.name" />
          </div>

          <div class="thumbnails">
            <img v-for="(img, index) in product.imagens" :key="index" :src="img.url" :alt="product.name"
              :class="{ ativo: index === currentImageIndex }" @click="changeImage(index)" />
          </div>
        </div>

        <div class="product-info">
          <span class="category-badge">{{ product.category }} - {{ product.color }}</span>
          <h1 class="product-name">{{ product.name }}</h1>
          <p class="product-price">R$ {{ formatPrice(product.price) }}</p>

          <div class="product-description">
            <h3>Descrição</h3>
            <p>{{ product.description }}</p>
          </div>

          <div v-if="product.quantity > 0" class="availability ">
            <p class="hasQuantity">✓ hasQuantity ({{ product.quantity }} disponíveis)</p>
          </div>
          <div v-else class="availability ">
            <p class="isQuantityEmpty">✗ product esgotado</p>
          </div>

          <div class="actions">
            <div class="quantity-selector">
              <button @click="decreaseQuantity" :disabled="purchaseQuantity <= 1">-</button>
              <input type="number" v-model.number="purchaseQuantity" min="1" :max="product.quantity" disabled/>
              <button @click="increaseQuantity" :disabled="purchaseQuantity >= product.quantity || product.quantity === 0">+</button>
            </div>

            <button class="btn-add" @click="addToBag" :disabled="purchaseQuantity < 1 || purchaseQuantity > product.quantity">
              adicionar à Sacola
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useProductStore } from '@/stores/productStore'; 
import { useBagStore } from '@/stores/bagStore';
const props = defineProps({
  product: {
    type: Object, 
  },
});

const route = useRoute();
const productStore = useProductStore();
const bagStore = useBagStore();

const purchaseQuantity = ref(1);

const loading = computed(() => productStore.loading);
const error = computed(() => productStore.error);
const product = computed(() => productStore.productAtual);
const initialImages = props.product?.imagens ?? [];
const currentImage = ref(initialImages[0]?.url || null); 
const currentImageIndex = ref(0);

function changeImage(index) {
  const imgs = product.value?.imagens;
  if (!imgs || !imgs[index]) return;

  currentImageIndex.value = index;
  currentImage.value = imgs[index].url;
}

watch(
  () => product.value,
  (newProduct) => {
    if (newProduct?.images?.length) {
      currentImage.value = newProduct.images[0].url;
      currentImageIndex.value = 0;
    }
  },
  { immediate: true }
);

const formatPrice = (price) => {
  return price.toFixed(2).replace('.', ',');
};

const increaseQuantity = () => {
  if (purchaseQuantity.value < product.value.quantity) {
    purchaseQuantity.value++;
  }
};

const decreaseQuantity = () => {
  if (purchaseQuantity.value > 1) {
    purchaseQuantity.value--;
  }
};

const addToBag = () => {
  for (let i = 0; i < purchaseQuantity.value; i++) {
    bagStore.addItem(product.value);
  }
  purchaseQuantity.value = 1;
};


onMounted(async () => {
  const productId = route.params.id;
  await productStore.carregarproduct(productId);
});
</script>

<style scoped>
.product-detalhes {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem 1rem;
}
.product-galeria {
  max-width: 320px;
}

.image-principal img {
  width: 100%;
  border-radius: 8px;
}

.thumbnails {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}

.thumbnails img {
  width: 60px;
  height: 60px;
  cursor: pointer;
  border-radius: 6px;
  opacity: 0.6;
  transition: 0.2s;
}

.thumbnails img.ativo,
.thumbnails img:hover {
  opacity: 1;
  border: 2px solid #e4dd7e;
}
.product-container {
  max-width: 1200px;
  margin: 0 auto;
}

.btn-back-simples {
  background: none;
  border: none;
  color: #1a1a1a;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: color 0.3s;
}

.btn-back-simples:hover {
  color: #d4af37;
}

.product-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}



.product-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.category-badge {
  display: inline-block;
  width: fit-content;
  padding: 0.3rem 1rem;
  background-color: #d4af37;
  color: #1a1a1a;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.product-name {
  font-size: 2rem;
  color: #1a1a1a;
  margin: 0;
}

.product-price {
  font-size: 2rem;
  color: #d4af37;
  font-weight: bold;
  margin: 0;
}

.product-description {
  margin: 1rem 0;
}

.product-description h3 {
  color: #1a1a1a;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.product-description p {
  color: #666666;
  line-height: 1.6;
}

.availability  {
  margin: 1rem 0;
}

.hasQuantity {
  color: #27ae60;
  font-weight: 600;
}

.isQuantityEmpty {
  color: #e74c3c;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.quantity-selector {
  display: flex;
  align-items: center;
  border: 2px solid #d4af37;
  border-radius: 8px;
  overflow: hidden;
}

.quantity-selector button {
  width: 40px;
  height: 40px;
  border: none;
  background-color: #d4af37;
  color: #1a1a1a;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.quantity-selector button:hover:not(:disabled) {
  background-color: #c49b2a;
}

.quantity-selector button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-selector input {
  width: 60px;
  height: 40px;
  border: none;
  text-align: center;
  font-size: 1rem;
  font-weight: 600;
}

.btn-add {
  flex: 1;
  padding: 0.8rem 2rem;
  background-color: #d4af37;
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-add:hover:not(:disabled) {
  background-color: #c49b2a;
}

.btn-add:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading,
.erro {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #666666;
}

.erro {
  color: #e74c3c;
}

.btn-voltar {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.8rem 2rem;
  background-color: #d4af37;
  color: #1a1a1a;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-voltar:hover {
  background-color: #c49b2a;
}

@media (max-width: 768px) {
  .product-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .product-imagem {
    height: 400px;
  }

  .product-name {
    font-size: 1.5rem;
  }

  .product-price {
    font-size: 1.5rem;
  }

  .actions {
    flex-direction: column;
  }
}
</style>
