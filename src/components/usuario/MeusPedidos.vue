<template>
  <div class="meus-pedidos">
    <h2>Meus Pedidos</h2>

    <!-- Filtros e Busca -->
    <div class="filters">
      <div class="filter-group">
        <label for="status-filter">Filtrar por Status:</label>
        <select id="status-filter" v-model="statusFilter" @change="filtrarPedidos">
          <option value="">Todos</option>
          <option value="PENDENTE">Pendente</option>
          <option value="PROCESSANDO">Processando</option>
          <option value="ENVIADO">Enviado</option>
          <option value="ENTREGUE">Entregue</option>
          <option value="CANCELADO">CANCELADO</option>
        </select>
      </div>
      <div class="search-group">
        <input type="text" v-model="searchQuery" placeholder="Buscar por número do pedido ou produto..."
          @input="filtrarPedidos" />
      </div>
    </div>

    <!-- Tabela de Pedidos -->
    <div v-if="pedidosFiltrados.length > 0" class="pedidos-table">
      <table class="tabela-pedidos">
        <thead>
          <tr>
            <th>Número do Pedido</th>
            <th>Produto</th>
            <th>Status</th>
            <th>Itens</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <PedidoItem v-for="pedido in pedidosFiltrados" :key="pedido.id" :pedido="pedido" class="pedido-item"
            @ver-detalhes="verDetalhes" />
        </tbody>
      </table>
    </div>


    <div v-else-if="!loading" class="empty-state">
      <p>{{ pedidos.length === 0 ? 'Você ainda não fez nenhum pedido.' : 'Nenhum pedido encontrado com os filtros aplicados.' }}</p>
    </div>

    <div v-if="loading" class="loading">Carregando pedidos...</div>

    <!-- Popup de Confirmação de Cancelamento -->
    <div v-if="showCancelPopup" class="modal-overlay" @click="fecharCancelPopup">
      <div class="modal-content confirm-popup" @click.stop>
        <h3>Confirmar Cancelamento</h3>
        <p>Tem certeza que deseja cancelar o pedido <strong>#{{ pedidoParaCancelar?.id }}</strong>?</p>
        <p class="cancel-warning">Esta ação não poderá ser desfeita.</p>
        <div class="popup-actions">
          <button @click="confirmarCancelamento" class="btn-confirmar-cancelamento">Sim, Cancelar Pedido</button>
          <button @click="fecharCancelPopup" class="btn-voltar">Voltar</button>
        </div>
      </div>
    </div>

    <!-- Modal de Detalhes -->
    <div v-if="pedidoSelecionado" class="modal-overlay" @click="fecharModal">
      <div class="modal-content" @click.stop>
       <h3>Detalhes do Pedido #{{ pedidoSelecionado.id }}</h3>
        <div class="pedido-detalhes">
          <div class="detalhe-item">
            <strong>Status:</strong>
            <span :class="`status status-${pedidoSelecionado.status}`">{{ pedidoSelecionado.status }}</span>
          </div>
          <div class="detalhe-item">
            <strong>Data:</strong> {{ pedidoSelecionado.createdAt }}
          </div>
          <div class="detalhe-item">
            <strong>Frete:</strong> R$ {{ (pedidoSelecionado.frete ?? 0).toFixed(2) }}
          </div>
          <div class="detalhe-item">
            <strong>Total:</strong> R$ {{ (pedidoSelecionado.valorTotal ?? 0).toFixed(2) }}
          </div>
          <div class="detalhe-item">
            <strong>Itens:</strong>
            <ul class="itens-lista">
              <li v-for="item in pedidoSelecionado.itens" :key="item.produtoId">
                <img v-if="item.produto?.imagens?.[0]?.url" :src="item.produto.imagens[0].url" :alt="item.produto.nome"
                  class="item-imagem" />
                <span>{{ item.produto?.nome || 'Produto' }} - Quantidade: {{ item.quantidade }} - R$ {{
                  item.produto?.preco ? item.produto.preco.toFixed(2) : '0.00' }}</span>
              </li>
            </ul>
          </div>
        </div>
          <div v-if="podeCancelar(pedidoSelecionado)" class="detalhe-item">
            <button @click="cancelarPedido(pedidoSelecionado)" class="btn-cancelar">Cancelar Pedido</button>
          </div>
          <div v-if="enderecoEntrega" class="detalhe-item-endereco">
            <strong>Endereço de Entrega:</strong>
            <p><strong>Rua:</strong> {{ enderecoEntrega.rua }}, <strong>Nº:</strong> {{ enderecoEntrega.numero }}</p>
              <p><strong>Bairro:</strong> {{ enderecoEntrega.bairro }}</p>
              <p><strong>CEP:</strong> {{ enderecoEntrega.cep }}</p>
              <p><strong>Cidade:</strong> {{ enderecoEntrega.cidade }} - {{ enderecoEntrega.estado }}</p>
          </div>
        </div>
        <button @click="fecharModal" class="btn-fechar">Fechar</button>
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { pedidoService } from '@/services/pedidoService';
import { produtoService } from '@/services/produtoService';
import { authService } from '@/services/authService';
import PedidoItem from '../PedidoItem.vue';
import { enderecoService } from '@/services/enderecoService.js';

const pedidos = ref([]);
const pedidosFiltrados = ref([]);
const loading = ref(false);
const statusFilter = ref('');
const searchQuery = ref('');
const pedidoSelecionado = ref(null);
const enderecoEntrega = ref(null);
const showCancelPopup = ref(false);
const pedidoParaCancelar = ref(null);

onMounted(async () => {
  await carregarPedidos();
});

const carregarPedidos = async () => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) return;

  loading.value = true;

  try {
    const userPedidos = await pedidoService.buscarPorUsuario(currentUser.id);

    // coletar productIds únicos
    const productIds = new Set();
    userPedidos.forEach(p => {
      p.itens?.forEach(i => i.produtoId && productIds.add(i.produtoId));
    });

    // buscar produtos em paralelo
    const produtos = await Promise.all(
      [...productIds].map(id =>
        produtoService.buscarPorId(id).then(prod => ({ id, prod })).catch(() => ({ id, prod: null }))
      )
    );

    const produtoMap = new Map(produtos.map(p => [p.id, p.prod]));

    // associar produtos aos itens
    userPedidos.forEach(pedido => {
      pedido.itens?.forEach(item => {
        item.produto = produtoMap.get(item.produtoId) || null;
      });
    });

    pedidos.value = userPedidos;
    pedidosFiltrados.value = userPedidos;
  } catch (error) {
    console.error("Erro ao carregar pedidos:", error);
  } finally {
    loading.value = false;
  }
};
//buscar endereco de entrega
const carregarEnderecoEntrega = async (pedido) => {
  if (!pedido.enderecoId) return;

  try {
    const endereco = await enderecoService.buscarPorId(pedido.enderecoId);
    enderecoEntrega.value = endereco;
  } catch (error) {
    console.error("Erro ao carregar endereço de entrega:", error);
  }
};

// Filtrar pedidos
const filtrarPedidos = () => {
  let filtrados = pedidos.value;

  // Filtro por status
  if (statusFilter.value) {
    filtrados = filtrados.filter(pedido => pedido.status === statusFilter.value);
  }

  // Busca por id do pedido ou nome do produto
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtrados = filtrados.filter(pedido =>
      (pedido.id && pedido.id.toString().includes(query)) ||
      pedido.itens?.some(item =>
        item.produto && item.produto.nome?.toLowerCase().includes(query)
      )
    );
  }
  pedidosFiltrados.value = filtrados;
};


const verDetalhes = async (pedido) => {
  pedidoSelecionado.value = pedido;
  await carregarEnderecoEntrega(pedido);
};

const fecharModal = () => {
  pedidoSelecionado.value = null;
  enderecoEntrega.value = null;
};

const podeCancelar = (pedido) => {
  return pedido.status === 'PENDENTE';
};

const cancelarPedido = (pedido) => {
  fecharModal();
  pedidoParaCancelar.value = pedido;
  showCancelPopup.value = true;
};

const fecharCancelPopup = () => {
  showCancelPopup.value = false;
  pedidoParaCancelar.value = null;
};

const confirmarCancelamento = async () => {
  const pedido = pedidoParaCancelar.value;
  if (!pedido) return;

  try {
    await pedidoService.atualizarStatus(pedido.id, 'CANCELADO');

    for (const item of pedido.itens) {
      if (item.produtoId) {
        const p = await produtoService.buscarPorId(item.produtoId);
        const novaQuantidade = (p.estoque ?? 0) + (item.quantidade ?? 0);
        await produtoService.atualizarEstoque(item.produtoId, novaQuantidade);
      }
    }

    fecharCancelPopup();
    fecharModal();
    await carregarPedidos(); 
  } catch (error) {
    console.error('Erro ao cancelar pedido:', error);
    fecharCancelPopup();
    alert('Erro ao cancelar pedido: ' + error.message);
  }
};


</script>

<style scoped>
.meus-pedidos {
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

.pedidos-table {
  overflow-x: auto;
}
.tabela-pedidos {
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
.status-CANCELADO { background-color: #f8d7da; color: #721c24; }

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

.pedido-detalhes {
  margin: 1rem 0;
}

.detalhe-item {
  margin-bottom: 1rem;
}

.detalhe-item strong {
  display: block;
  margin-bottom: 0.5rem;
}
.detalhe-item-endereco {
  margin-bottom: 1rem;
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

.confirm-popup {
  max-width: 450px;
  text-align: center;
}

.confirm-popup h3 {
  color: #d9534f;
  margin-bottom: 1rem;
}

.cancel-warning {
  color: #d9534f;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.popup-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}

.btn-confirmar-cancelamento {
  padding: 0.75rem 1.5rem;
  background-color: #d9534f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-confirmar-cancelamento:hover {
  background-color: #c9302c;
}

.btn-voltar {
  padding: 0.75rem 1.5rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-voltar:hover {
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