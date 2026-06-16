<template>
  <div class="product-card">
    <router-link :to="`/produto/${produto.id}`" class="product-link">
      <div class="product-image">
        <img :src="obterUrlImagem(produto)" :alt="produto.nome" />
      </div>
      <div class="product-info">
        <h3 class="product-name">{{ produto.nome }}</h3>
        <p class="product-category">{{ produto.categoria }}</p>
        <p class="product-price">R$ {{ formatarPreco(produto.preco) }}</p>
      </div>
    </router-link>
    <div class="product-actions">
      <button class="btn-favorite" @click="toggleFavorito">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path :d="mdiHeart"/>
        </svg>
        {{ favoritado ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos' }}
      </button>
      <button class="btn-add-cart" @click="adicionarNaSacola">
        Adicionar à Sacola
      </button>
    </div>
  </div>
</template>

<script setup>
import { useSacolaStore } from '../stores/sacolaStore';
import { useFavoritosStore } from '../stores/favoritosStore';
import { formatarPreco, obterUrlImagem } from '@/services/produtoService';
import { computed } from 'vue';
import { mdiHeart } from '@mdi/js';

const props = defineProps({
  produto: {
    type: Object,
    required: true
  }
});

const sacolaStore = useSacolaStore();
const favoritosStore = useFavoritosStore();

const favoritado = computed(() => favoritosStore.isFavorito(props.produto.id));


const adicionarNaSacola = () => {
  sacolaStore.adicionarItem(props.produto);
};

const toggleFavorito = async () => {
  try {
    if (favoritado.value) {
      await favoritosStore.removerFavorito(props.produto.id);
    } else {
      await favoritosStore.adicionarFavorito(props.produto);
    }
  } catch (error) {
    console.error('Erro ao gerenciar favorito:', error);
  }
};
</script>

<style scoped>
.product-card {
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.product-link {
  text-decoration: none;
  color: inherit;
  flex: 1;
}

.product-image {
  width: 100%;
  height: 250px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-info {
  padding: 1rem;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #1a1a1a;
}

.product-category {
  font-size: 0.85rem;
  color: #666666;
  margin: 0 0 0.5rem 0;
}

.product-price {
  font-size: 1.2rem;
  font-weight: bold;
  color: #d4af37;
  margin: 0;
}

.product-actions {
  display: flex;
  flex-direction: column;
}

.btn-favorite {
  width: 100%;
  padding: 0.8rem;
  background-color: transparent;
  color: #666666;
  border: 1px solid #ddd;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-favorite:hover {
  background-color: #f8f9fa;
  color: #d9534f;
}

.btn-favorite svg {
  fill: currentColor;
}

.btn-add-cart {
  width: 100%;
  padding: 0.8rem;
  background-color: #d4af37;
  color: #1a1a1a;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-add-cart:hover {
  background-color: #c49b2a;
}
</style>
