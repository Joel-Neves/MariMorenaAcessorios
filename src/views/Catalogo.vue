<template>
  <div class="catalogo">
    <div class="catalogo-container">
      <h1 class="titulo">Nosso Catálogo</h1>

      <div v-if="categorias.length > 0" class="filtros">
        <button
          :class="['filtro-btn', { active: categoriaSelecionada === null }]"
          @click="filtrarCategoria(null)">
          Todos
        </button>
        <button
          v-for="categoria in categorias"
          :key="categoria"
          :class="['filtro-btn', { active: categoriaSelecionada === categoria }]"
          @click="filtrarCategoria(categoria)"
        >
          {{ categoria }}
        </button>
      </div>

      <div v-if="carregando" class="loading">
        <p>Carregando produtos...</p>
      </div>

      <div v-else-if="erro" class="erro">
        <p>{{ erro }}</p>
      </div>

      <div v-else-if="produtosFiltrados.length === 0" class="vazio">
        <p>Nenhum produto encontrado.</p>
      </div>

      <div v-else class="produtos-grid">
        <ProductCard
          v-for="produto in produtosFiltrados"
          :key="produto.id"
          :produto="produto"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useProdutoStore } from '@/stores/produtoStore';
import ProductCard from '@/components/ProductCard.vue';

const produtoStore = useProdutoStore();
const categoriaSelecionada = ref(null);

const carregando = computed(() => produtoStore.carregando);
const erro = computed(() => produtoStore.erro);
const categorias = computed(() => produtoStore.categorias);

const produtosFiltrados = computed(() => {
  let filtered = produtoStore.produtos.filter(produto => produto.estoque > 0);
  if (!categoriaSelecionada.value) {
    return filtered;
  }
  return filtered.filter(produto => produto.categoria === categoriaSelecionada.value);
});

const filtrarCategoria = (category) => {
  categoriaSelecionada.value = category;
};

onMounted(async () => {
  await produtoStore.carregarProdutos();
});
</script>

<style scoped>
.catalogo {
  min-height: 100vh;
  background-color: #ffffff;
  padding: 2rem 1rem;
}

.catalogo-container {
  max-width: 1200px;
  margin: 0 auto;
}

.titulo {
  text-align: center;
  color: #1a1a1a;
  font-size: 2.5rem;
  margin-bottom: 2rem;
}

.filtros {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.filtro-btn {
  padding: 0.6rem 1.5rem;
  border: 2px solid #d4af37;
  background-color: #ffffff;
  color: #1a1a1a;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.filtro-btn:hover {
  background-color: #d4af37;
  color: #1a1a1a;
}

.filtro-btn.active {
  background-color: #d4af37;
  color: #1a1a1a;
}

.produtos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.loading,
.erro,
.vazio {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #666666;
}

.erro {
  color: #e74c3c;
}

@media (max-width: 768px) {
  .titulo {
    font-size: 2rem;
  }

  .produtos-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }
}
</style>
