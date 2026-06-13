<template>
  <div class="favoritos">
    <h2>Meus Favoritos</h2>

    <div v-if="carregando" class="loading">
      Carregando favoritos...
    </div>

    <div v-else-if="erro" class="error">
      Erro ao carregar favoritos: {{ erro }}
    </div>

    <div v-else-if="favoritosComProdutos.length === 0" class="empty">
      <p>Você ainda não tem produtos favoritos.</p>
      <router-link to="/" class="btn-explore">Explorar Produtos</router-link>
    </div>

    <div v-else class="favoritos-grid">
      <div
        v-for="produto in favoritosComProdutos"
        :key="produto.id"
        class="favorito-item"
      >
        <router-link :to="`/produto/${produto.id}`" class="produto-link">
          <div class="produto-imagem">
            <img :src="produto.imagens[0]?.url" :alt="produto.nome" />
          </div>
          <div class="produto-info">
            <h3 class="produto-nome">{{ produto.nome }}</h3>
            <p class="produto-categoria">{{ produto.categoria }}</p>
            <p class="produto-preco">{{ formatarPreco(produto.preco) }}</p>
          </div>
        </router-link>
        <button
          class="btn-remover"
          @click="removerFavorito(produto.id)"
          :disabled="carregando"
        >
          Remover dos Favoritos
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useFavoritosStore } from '../../stores/favoritosStore';

const favoritosStore = useFavoritosStore();

const carregando = computed(() => favoritosStore.carregando);
const erro = computed(() => favoritosStore.erro);
const favoritosComProdutos = computed(() => favoritosStore.favoritosComProdutos);

const formatarPreco = (preco) => {
  return preco.toFixed(2).replace('.', ',');
};

const removerFavorito = async (produtoId) => {
  try {
    await favoritosStore.removerFavorito(produtoId);
  } catch (error) {
    console.error('Erro ao remover favorito:', error);
  }
};

onMounted(() => {
  favoritosStore.carregarFavoritos();
});
</script>

<style scoped>
.favoritos {
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

.favoritos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.favorito-item {
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
}

.favorito-item:hover {
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

.favorito-item:hover .produto-imagem img {
  transform: scale(1.05);
}

.produto-info {
  padding: 1rem;
}

.produto-nome {
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
