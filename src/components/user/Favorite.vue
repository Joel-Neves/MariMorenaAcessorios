<template>
  <div class="favorites">
    <h2>My Favorites</h2>

    <div v-if="carregando" class="loading">
      Carregando favorites...
    </div>

    <div v-else-if="erro" class="error">
      Erro ao carregar favorites: {{ erro }}
    </div>

    <div v-else-if="favoritesComProdutos.length === 0" class="empty">
      <p>Você ainda não tem produtos favorites.</p>
      <router-link to="/" class="btn-explore">Explorar Produtos</router-link>
    </div>

    <div v-else class="favorites-grid">
      <div
        v-for="produto in favoritesComProdutos"
        :key="produto.id"
        class="favorite-item"
      >
        <router-link :to="`/produto/${produto.id}`" class="produto-link">
          <div class="produto-imagem">
            <img :src="produto.imagens[0].url" :alt="produto.name" />
          </div>
          <div class="produto-info">
            <h3 class="produto-name">{{ produto.name }}</h3>
            <p class="produto-categoria">{{ produto.categoria }}</p>
            <p class="produto-preco">R$ {{ formatarPreco(produto.preco) }}</p>
          </div>
        </router-link>
        <button
          class="btn-remover"
          @click="removerFavorite(produto.id)"
          :disabled="carregando"
        >
          Remover dos Favorites
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useFavoritesStore } from '../../stores/favoriteStore';

const favoritesStore = useFavoritesStore();

const carregando = computed(() => favoritesStore.carregando);
const erro = computed(() => favoritesStore.erro);
const favoritesComProdutos = computed(() => favoritesStore.favoritesComProdutos);

const formatarPreco = (preco) => {
  return preco.toFixed(2).replace('.', ',');
};

const removerFavorite = async (produtoId) => {
  try {
    await favoritesStore.removerFavorite(produtoId);
  } catch (error) {
    console.error('Erro ao remover favorite:', error);
  }
};

onMounted(() => {
  favoritesStore.carregarFavorites();
});
</script>

<style scoped>
.favorites {
  padding: 2rem;
}

.loading, .error, .empty {
  text-align: center;
  padding: 2rem;
}

.error {
  color: #d9534f;
}

.empty {
  color: #666;
}

.btn-explore {
  display: inline-block;
  padding: 0.8rem 1.5rem;
  background-color: #d4af37;
  color: #1a1a1a;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-explore:hover {
  background-color: #c49b2a;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.favorite-item {
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
}

.favorite-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.produto-link {
  text-decoration: none;
  color: inherit;
  flex: 1;
}

.produto-imagem {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.produto-imagem img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.favorite-item:hover .produto-imagem img {
  transform: scale(1.05);
}

.produto-info {
  padding: 1rem;
}

.produto-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #1a1a1a;
}

.produto-categoria {
  font-size: 0.85rem;
  color: #666666;
  margin: 0 0 0.5rem 0;
}

.produto-preco {
  font-size: 1.2rem;
  font-weight: bold;
  color: #d4af37;
  margin: 0;
}

.btn-remover {
  width: 100%;
  padding: 0.8rem;
  background-color: #d9534f;
  color: #ffffff;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-remover:hover {
  background-color: #c9302c;
}

.btn-remover:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
