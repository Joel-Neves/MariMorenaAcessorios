<template>
  <div class="lista-pedidos">
    <h2>Lista de Pedidos</h2>
    <p>Gerencie todos os pedidos realizados na plataforma.</p>
    <div v-if="loading" class="loading">Carregando pedidos...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="search-bar">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Buscar por cliente ou ID do pedido..."
          class="search-input"
        />
        <i class="fas fa-search search-icon"></i>
      </div>
      <table class="pedidos-table">
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>Data</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pedido in filteredPedidos" :key="pedido.id">
            <td>#{{ pedido.id }}</td>
            <td>{{ pedido.clienteNome || 'Cliente não encontrado' }}</td>
            <td>{{ pedido.createdAt }}</td>
            <td>{{ pedido.valorTotal }}</td>
            <td>{{ pedido.status }}</td>
            <td>
              <router-link :to="{ name: 'pedido-detalhes', params: { id: pedido.id } }" class="btn-detalhes">
                Ver Detalhes
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { pedidoService } from '@/services/pedidoService'
import { usuarioService } from '@/services/usuarioService'

const pedidos = ref([])
const loading = ref(true)
const error = ref(null)
const searchTerm = ref('')

const filteredPedidos = computed(() => {
  const term = searchTerm.value.toLowerCase()

  if (!term) return pedidos.value

  return pedidos.value.filter(pedido =>
    pedido.clienteNome?.toLowerCase().includes(term) ||
    pedido.id.toString().includes(term) ||
    pedido.status?.toLowerCase().includes(term)
  )
})
const carregarPedidos = async () => {
  try {
    const todosPedidos = await pedidoService.listarTodos()

    const pedidosComClientes = await Promise.all(
      todosPedidos.map(async pedido => {

        const cliente = await usuarioService.buscarPorId(
          pedido.clienteId
        )

        return {
          ...pedido,

          clienteNome: cliente?.nome ?? 'Cliente não encontrado'

            .map(item =>
              `${item.produtoId}x ${item.quantidade}`
            )
            .join(', ')
        }
      })
    )

    pedidos.value = pedidosComClientes

  } catch (err) {
    error.value = 'Erro ao carregar pedidos: ' + err.message
  } finally {
    loading.value = false
  }
}
onMounted(async () => {
  await carregarPedidos()
})
</script>

<style scoped>
.lista-pedidos {
  padding: 24px;
  background: #f5f5dc;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
}

/* Títulos padrão produtos */
.lista-pedidos h2 {
  margin-bottom: 6px;
  font-size: 26px;
  color: #2c3e50;
  font-weight: 700;
}

.lista-pedidos p {
  margin-bottom: 24px;
  font-size: 15px;
  color: #666;
}

/* Loading e erro */
.loading, 
.error {
  text-align: center;
  padding: 20px;
  font-size: 16px;
}

.error {
  color: #b00020;
  background: #ffebee;
  border-radius: 8px;
}

/* Barra de busca idêntica à usada em produtos */
.search-bar {
  position: relative;
  margin-bottom: 24px;
}

.search-input {
  width: 100%;
  padding: 12px 42px 12px 16px;
  border: 1px solid #dcdcdc;
  border-radius: 10px;
  font-size: 15px;
  transition: 0.2s;
  background: #fafafa;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
  background: #fff;
}

.search-icon {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 17px;
  color: #888;
}

/* Tabela estilo produtos */
.pedidos-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
  margin-top: 10px;
}

.pedidos-table thead th {
  background: #f1f1f1;
  padding: 14px;
  font-size: 15px;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #ddd;
  text-align: left;
}

/* Linhas como cartões */
.pedidos-table tbody tr {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.07);
  transition: 0.18s ease;
}

.pedidos-table tbody tr:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.pedidos-table td {
  padding: 14px;
  font-size: 14px;
  color: #444;
  border-top: 1px solid #eee;
}

/* Botão igual ao de produtos */
.btn-detalhes {
  background-color: #3498db;
  color: white;
  padding: 8px 16px;
  border-radius: 10px;
  text-decoration: none;
  font-size: 14px;
  transition: 0.2s;
}

.btn-detalhes:hover {
  background-color: #217dbb;
  transform: scale(1.04);
}

</style>
