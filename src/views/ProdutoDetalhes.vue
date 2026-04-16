<template>
  <div class="produto-detalhes">
    <div v-if="carregando" class="loading">
      <p>Carregando produto...</p>
    </div>

    <div v-else-if="erro" class="erro">
      <p>{{ erro }}</p>
      <router-link to="/" class="btn-voltar">Voltar ao Catálogo</router-link>
    </div>

    <div v-else-if="produto" class="produto-container">
      <button @click="$router.go(-1)" class="btn-voltar-simples">← Voltar</button>

      <div class="produto-content">
        <div class="produto-galeria">
          <div class="imagem-principal">
            <img :src="imagemAtual" :alt="produto.nome" />
          </div>

          <div class="thumbnails">
            <img v-for="(img, index) in produto.imagens" :key="index" :src="img.url" :alt="produto.nome"
              :class="{ ativo: index === indiceAtual }" @click="mudarImagem(index)" />
          </div>
        </div>

        <div class="produto-info">
          <span class="categoria-badge">{{ produto.categoria }} - {{ produto.cor }}</span>
          <h1 class="produto-nome">{{ produto.nome }}</h1>
          <p class="produto-preco">R$ {{ formatarPreco(produto.preco) }}</p>

          <div class="produto-descricao">
            <h3>Descrição</h3>
            <p>{{ produto.descricao }}</p>
          </div>

          <div v-if="produto.estoque > 0" class="disponibilidade">
            <p class="em-estoque">✓ Em estoque ({{ produto.estoque }} disponíveis)</p>
          </div>
          <div v-else class="disponibilidade">
            <p class="sem-estoque">✗ Produto esgotado</p>
          </div>

          <div class="acoes">
            <div class="quantidade-selector">
              <button @click="diminuirQuantidade" :disabled="quantidadeCompra <= 1">-</button>
              <input type="number" v-model.number="quantidadeCompra" min="1" :max="produto.estoque" disabled/>
              <button @click="aumentarQuantidade" :disabled="quantidadeCompra >= produto.estoque || produto.estoque === 0">+</button>
            </div>

            <button class="btn-adicionar" @click="adicionarNaSacola" :disabled="quantidadeCompra < 1 || quantidadeCompra > produto.estoque">
              Adicionar à Sacola
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
import { useProdutoStore } from '@/stores/produtoStore'; 
import { useSacolaStore } from '@/stores/sacolaStore';
const props = defineProps({
  produto: {
    type: Object, 
  },
});

const route = useRoute();
const produtoStore = useProdutoStore();
const sacolaStore = useSacolaStore();

const quantidadeCompra = ref(1);

const carregando = computed(() => produtoStore.carregando);
const erro = computed(() => produtoStore.erro);
const produto = computed(() => produtoStore.produtoAtual);
const imagensIniciais = props.produto?.imagens ?? [];
const imagemAtual = ref(imagensIniciais[0]?.url || null); 
const indiceAtual = ref(0);

function mudarImagem(index) {
  const imgs = produto.value?.imagens;
  if (!imgs || !imgs[index]) return;

  indiceAtual.value = index;
  imagemAtual.value = imgs[index].url;
}

watch(
  () => produto.value,
  (novo) => {
    if (novo?.imagens?.length) {
      imagemAtual.value = novo.imagens[0].url;
      indiceAtual.value = 0;
    }
  },
  { immediate: true }
);

const formatarPreco = (preco) => {
  return preco.toFixed(2).replace('.', ',');
};

const aumentarQuantidade = () => {
  if (quantidadeCompra.value < produto.value.estoque) {
    quantidadeCompra.value++;
  }
};

const diminuirQuantidade = () => {
  if (quantidadeCompra.value > 1) {
    quantidadeCompra.value--;
  }
};

const adicionarNaSacola = () => {
  for (let i = 0; i < quantidadeCompra.value; i++) {
    sacolaStore.adicionarItem(produto.value);
  }
  quantidadeCompra.value = 1;
};


onMounted(async () => {
  const produtoId = route.params.id;
  await produtoStore.carregarProduto(produtoId);
});
</script>

<style scoped>
.produto-detalhes {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem 1rem;
}
.produto-galeria {
  max-width: 320px;
}

.imagem-principal img {
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
.produto-container {
  max-width: 1200px;
  margin: 0 auto;
}

.btn-voltar-simples {
  background: none;
  border: none;
  color: #1a1a1a;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: color 0.3s;
}

.btn-voltar-simples:hover {
  color: #d4af37;
}

.produto-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}



.produto-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.categoria-badge {
  display: inline-block;
  width: fit-content;
  padding: 0.3rem 1rem;
  background-color: #d4af37;
  color: #1a1a1a;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.produto-nome {
  font-size: 2rem;
  color: #1a1a1a;
  margin: 0;
}

.produto-preco {
  font-size: 2rem;
  color: #d4af37;
  font-weight: bold;
  margin: 0;
}

.produto-descricao {
  margin: 1rem 0;
}

.produto-descricao h3 {
  color: #1a1a1a;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.produto-descricao p {
  color: #666666;
  line-height: 1.6;
}

.disponibilidade {
  margin: 1rem 0;
}

.em-estoque {
  color: #27ae60;
  font-weight: 600;
}

.sem-estoque {
  color: #e74c3c;
  font-weight: 600;
}

.acoes {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.quantidade-selector {
  display: flex;
  align-items: center;
  border: 2px solid #d4af37;
  border-radius: 8px;
  overflow: hidden;
}

.quantidade-selector button {
  width: 40px;
  height: 40px;
  border: none;
  background-color: #d4af37;
  color: #1a1a1a;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.quantidade-selector button:hover:not(:disabled) {
  background-color: #c49b2a;
}

.quantidade-selector button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantidade-selector input {
  width: 60px;
  height: 40px;
  border: none;
  text-align: center;
  font-size: 1rem;
  font-weight: 600;
}

.btn-adicionar {
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

.btn-adicionar:hover:not(:disabled) {
  background-color: #c49b2a;
}

.btn-adicionar:disabled {
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
  .produto-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .produto-imagem {
    height: 400px;
  }

  .produto-nome {
    font-size: 1.5rem;
  }

  .produto-preco {
    font-size: 1.5rem;
  }

  .acoes {
    flex-direction: column;
  }
}
</style>
