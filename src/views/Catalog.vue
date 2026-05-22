<template>
  <div class="catalog">
    <div class="catalog-container">
      <h1 class="title">Nosso Catálogo</h1>

      <div v-if="categories.length > 0" class="filter">
        <button
          :class="['filter-btn', { active: categorySelecioned === null }]"
          @click="filterCategory(null)">
          Todos
        </button>
        <button
          v-for="category in categories"
          :key="category"
          :class="['filter-btn', { active: categorySelecioned === category }]"
          @click="filterCategory(category)"
        >
          {{ category }}
        </button>
      </div>

      <div v-if="carregando" class="loading">
        <p>Carregando produtos...</p>
      </div>

      <div v-else-if="erro" class="erro">
        <p>{{ erro }}</p>
      </div>

      <div v-else-if="productsFiltered.length === 0" class="void">
        <p>Nenhum produto encontrado.</p>
      </div>

      <div v-else class="products-grid">
        <ProductCard
          v-for="product in productsFiltered"
          :key="product.id"
          :product="product"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useProductStore } from '@/stores/productStore';
import ProductCard from '@/components/ProductCard.vue';

const productStore = useProductStore();
const categorySelecioned = ref(null);

const loading = computed(() => productStore.loading);
const erro = computed(() => productStore.error);
const categories = computed(() => productStore.categories);

const productsFiltered = computed(() => {
  let filtered = productStore.products.filter(product => product.quantity > 0);
  if (!categorySelecioned.value) {
    return filtered;
  }
  return filtered.filter(product => product.category === categorySelecioned.value);
});

const filterCategory = (category) => {
  categorySelecioned.value = category;
};

onMounted(async () => {
  await productStore.loadProducts();
});
</script>

<style scoped>
.catalog {
  min-height: 100vh;
  background-color: #ffffff;
  padding: 2rem 1rem;
}

.catalog-container {
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  text-align: center;
  color: #1a1a1a;
  font-size: 2.5rem;
  margin-bottom: 2rem;
}

.filter {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.filter-btn {
  padding: 0.6rem 1.5rem;
  border: 2px solid #d4af37;
  background-color: #ffffff;
  color: #1a1a1a;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.filter-btn:hover {
  background-color: #d4af37;
  color: #1a1a1a;
}

.filter-btn.active {
  background-color: #d4af37;
  color: #1a1a1a;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.loading,
.error,
.void {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #666666;
}

.error {
  color: #e74c3c;
}

@media (max-width: 768px) {
  .titulo {
    font-size: 2rem;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }
}
</style>
