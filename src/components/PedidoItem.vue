<template>
  <tr>
    <td style="padding-left: 20px;">#{{ pedido.id }}</td>

    <td>
      <div class="produto-info">
        <img
          v-if="produto?.imagens?.[0]?.url"
          :src="produto.imagens[0].url"
          :alt="produto.nome"
          class="produto-imagem"
        />
        <span>{{ produto?.nome || 'Produto removido' }}</span>
      </div>
    </td>

    <td>
      <span :class="`status status-${pedido.orderStatus}`">
        {{ (pedido.orderStatus) }}
      </span>
    </td>

    <td>{{ totalQuantidade }}</td>

    <td>
      <button class="btn-detalhes" @click="$emit('ver-detalhes', pedido)">
        Ver Detalhes
      </button>
    </td>
  </tr>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { produtoService } from '@/services/produtoService';

const props = defineProps({
  pedido: { type: Object, required: true }
});

const firstItem = computed(() => props.pedido.orderItems?.[0] || null);
const totalQuantidade = computed(() =>
  props.pedido.orderItems?.reduce((total, item) => total + (item.quantity ?? 0), 0) || 0
);

const produto = ref(null);

async function loadProduto() {
  const item = firstItem.value;
  if (item && item.productId) {
    try {
      produto.value = await produtoService.buscarPorId(item.productId);
    } catch (e) {
      produto.value = null;
      console.error('Erro ao buscar produto:', e);
    }
  } else {
    produto.value = null;
  }
}

watch(firstItem, loadProduto, { immediate: true });
</script>

<style scoped>
.produto-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.produto-imagem {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.btn-detalhes {
  padding: 0.5rem 1rem;
  background-color: #d4af37;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-detalhes:hover {
  background-color: #c49b2a;
}
</style>
