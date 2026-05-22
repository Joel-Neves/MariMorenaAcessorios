<template>
  <div class="my-orders">
    <h2>My Orders</h2>

    <!-- Filtros e Busca -->
    <div class="filters">
      <div class="filter-group">
        <label for="status-filter">Filtrar por Status:</label>
        <select id="status-filter" v-model="statusFilter" @change="filtrarOrders">
          <option value="">Todos</option>
          <option value="pendente">Pendente</option>
          <option value="processando">Processando</option>
          <option value="enviado">Enviado</option>
          <option value="entregue">Entregue</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>
      <div class="search-group">
        <input type="text" v-model="searchQuery" placeholder="Buscar por número do order ou produto..."
          @input="filtrarOrders" />
      </div>
    </div>

    <!-- Tabela de Orders -->
    <div v-if="ordersFiltrados.length > 0" class="orders-table">
      <table class="tabela-orders">
        <thead>
          <tr>
            <th>Número do Order</th>
            <th>Produto</th>
            <th>Status</th>
            <th>Itens</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <OrderItem v-for="order in ordersFiltrados" :key="order.id" :order="order" class="order-item"
            @ver-detalhes="verDetalhes" />
        </tbody>
      </table>
    </div>


    <div v-else-if="!loading" class="empty-state">
      <p>{{ orders.length === 0 ? 'Você ainda não fez nenhum order.' : 'Nenhum order encontrado com os filtros aplicados.' }}</p>
    </div>

    <div v-if="loading" class="loading">Carregando orders...</div>

    <!-- Modal de Detalhes -->
    <div v-if="orderSelecionado" class="modal-overlay" @click="fecharModal">
      <div class="modal-content" @click.stop>
        <h3>Detalhes do Order #{{ orderSelecionado.numeroOrder || orderSelecionado.id }}</h3>
        <div class="order-detalhes">
          <div class="detalhe-item">
            <strong>Status:</strong> <span :class="`status status-${orderSelecionado.status}`">{{
              getStatusLabel(orderSelecionado.status) }}</span>
          </div>
          <div class="detalhe-item">
            <strong>Data:</strong> {{ orderSelecionado.dataCriacao }}
          </div>
          <div class="detalhe-item">
            <strong>Total:</strong> R$ {{ orderSelecionado.total ? orderSelecionado.total.toFixed(2) : '0.00' }}
          </div>
          <div class="detalhe-item">
            <strong>Itens:</strong>
            <ul class="itens-lista">
              <li v-for="item in orderSelecionado.itens" :key="item.id">
                <img v-if="item.produto && item.produto.imagens[0].url" :src="item.produto.imagens[0].url"
                  :alt="item.produto.name" class="item-imagem" />
                <span>{{ item.produto ? item.produto.name : 'Produto' }} - Quantidade: {{ item.quantidade }} - R$ {{
                  item.produto.preco ? item.produto.preco.toFixed(2) : '0.00' }}</span>
              </li>
            </ul>
          </div>
          <div v-if="podeCancelar(orderSelecionado)" class="detalhe-item">
            <button @click="cancelarOrder(orderSelecionado)" class="btn-cancelar">Cancelar Order</button>
          </div>
          <div v-if="orderSelecionado.endereco" class="detalhe-item">
            <strong>Endereço de Entrega:</strong>
            <p>{{ orderSelecionado.endereco.rua }}, {{ orderSelecionado.endereco.numero }}<br>
              {{ orderSelecionado.endereco.bairro }}, {{ orderSelecionado.endereco.city }} - {{
              orderSelecionado.endereco.estado }}<br>
              CEP: {{ orderSelecionado.endereco.cep }}</p>
          </div>
        </div>
        <button @click="fecharModal" class="btn-fechar">Fechar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { orderService } from '@/services/orderService';
import { produtoService } from '@/services/productService';
import { authService } from '@/services/authService';
import OrderItem from '../OrderItem.vue';

const orders = ref([]);
const ordersFiltrados = ref([]);
const loading = ref(false);
const statusFilter = ref('');
const searchQuery = ref('');
const orderSelecionado = ref(null);

onMounted(async () => {
  await carregarOrders();
});

const carregarOrders = async () => {
  const currentUser = authService.getCurrentUser();
  console.log('Current user:', currentUser);
  if (!currentUser) return;

  loading.value = true;

  try {
    const userOrders = await orderService.buscarPorUser(currentUser.id);
    console.log('User orders:', userOrders);

    userOrders.forEach(order => {
      order.itens = Array.isArray(order.itens)
        ? order.itens
        : Object.values(order.itens || {});
    });

    const produtoIds = new Set();
    userOrders.forEach(p => {
      p.itens.forEach(i => i.produtoId && produtoIds.add(i.produtoId));
    });

    const produtos = await Promise.all(
      [...produtoIds].map(id =>
        produtoService.buscarPorId(id).then(prod => ({ id, prod }))
      )
    );

    const produtoMap = new Map(produtos.map(p => [p.id, p.prod]));

    // Associar produtos aos itens
    userOrders.forEach(order => {
      order.itens.forEach(item => {
        item.produto = produtoMap.get(item.produtoId) || null;
      });
    });

    orders.value = userOrders;
    ordersFiltrados.value = userOrders;

  } catch (error) {
    console.error("Erro ao carregar orders:", error);
  } finally {
    loading.value = false;
  }
};

// Filtrar orders
const filtrarOrders = () => {
  let filtrados = orders.value;

  // Filtro por status
  if (statusFilter.value) {
    filtrados = filtrados.filter(order => order.status === statusFilter.value);
  }

  // Busca por número do order ou name do produto
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtrados = filtrados.filter(order => {
      const numeroMatch = (order.numeroOrder || order.id).toLowerCase().includes(query);
      const produtoMatch = order.itens && order.itens.some(item =>
        item.produto && item.produto.name.toLowerCase().includes(query)
      );
      return numeroMatch || produtoMatch;
    });
  }

  ordersFiltrados.value = filtrados;
};

const getStatusLabel = (status) => {
  const labels = {
    pendente: 'Pendente',
    processando: 'Processando',
    enviado: 'Enviado',
    entregue: 'Entregue',
    cancelado: 'Cancelado'
  };
  return labels[status] || status;
};

const verDetalhes = (order) => {
  orderSelecionado.value = order;
};

const fecharModal = () => {
  orderSelecionado.value = null;
};

const podeCancelar = (order) => {
  return order.status === 'pendente';
};

const cancelarOrder = async (order) => {
  if (!confirm('Tem certeza que deseja cancelar este order?')) return;

  try {
    await orderService.atualizar(order.id, { status: 'cancelado' });
    order.status = 'cancelado';

    for (const item of order.itens) {
      if (item.produtoId) {
        const produto = await produtoService.buscarPorId(item.produtoId);
        const novaQuantidade = (produto.estoque) + (item.estoque);
        await produtoService.atualizar(item.produtoId, { estoque: novaQuantidade });
      }
    }

    alert('Order cancelado com sucesso!');
    fecharModal();
    await carregarOrders(); 
  } catch (error) {
    console.error('Erro ao cancelar order:', error);
    alert('Erro ao cancelar order: ' + error.message);
  }
};


</script>

<style scoped>
.my-orders {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-group,
.search-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group select,
.search-group input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-group input {
  min-width: 300px;
}

.orders-table {
  overflow-x: auto;
}
.tabela-orders {
  border-collapse: separate;
  border-spacing: 0 12px; 
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
}


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

.status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-pendente { background-color: #fff3cd; color: #856404; }
.status-processando { background-color: #cce5ff; color: #004085; }
.status-enviado { background-color: #d1ecf1; color: #0c5460; }
.status-entregue { background-color: #d4edda; color: #155724; }
.status-cancelado { background-color: #f8d7da; color: #721c24; }

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

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.order-detalhes {
  margin: 1rem 0;
}

.detalhe-item {
  margin-bottom: 1rem;
}

.detalhe-item strong {
  display: block;
  margin-bottom: 0.5rem;
}

.itens-lista {
  list-style: none;
  padding: 0;
}

.itens-lista li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.item-imagem {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.btn-fechar {
  padding: 0.5rem 1rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  float: right;
}

.btn-fechar:hover {
  background-color: #5a6268;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }

  .search-group input {
    min-width: auto;
  }

  table {
    font-size: 0.875rem;
  }

  th, td {
    padding: 0.5rem;
  }

  .produto-info {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
