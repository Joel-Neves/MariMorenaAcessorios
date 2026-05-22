<template>
  <div class="lista-orders">
    <h2>Lista de Orders</h2>
    <p>Gerencie todos os orders realizados na plataforma.</p>
    <div v-if="loading" class="loading">Carregando orders...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="search-bar">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Buscar por client ou ID do order..."
          class="search-input"
        />
        <i class="fas fa-search search-icon"></i>
      </div>
      <table class="orders-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Client</th>
            <th>Data</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id">
            <td>#{{ order.id.slice(-8) }}</td>
            <td>{{ order.clientName || 'Client não encontrado' }}</td>
            <td>{{ order.dataCriacao }}</td>
            <td>{{ order.valorFormatado }}</td>
            <td>{{ order.status }}</td>
            <td>
              <router-link :to="{ name: 'order-detalhes', params: { id: order.id } }" class="btn-detalhes">
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
import { orderService } from '@/services/orderService'
import { userService } from '@/services/userService'

const orders = ref([])
const loading = ref(true)
const error = ref(null)
const searchTerm = ref('')

const filteredOrders = computed(() => {
  if (!searchTerm.value) return orders.value
  const term = searchTerm.value.toLowerCase()
  return orders.value.filter(order =>
    order.clientName?.toLowerCase().includes(term) ||
    order.id.toLowerCase().includes(term)
  )
})

const carregarOrders = async () => {
  try {
    const todosOrders = await orderService.listarTodos()

    const ordersComClients = await Promise.all(
      todosOrders.map(async (order) => {
        try {
          let clientName = 'Client não informado'
          if (order.userId) {
            const client = await userService.buscarPorId(order.userId)
            clientName = client ? client.name : 'Client não encontrado'
          }

          const valorFormatado = (order.total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

          return {
            ...order,
            clientName,
            valorFormatado
          }
        } catch (err) {
          console.error(`Erro ao buscar client para order ${order.id}:`, err)
          return {
            ...order,
            clientName: 'Erro ao carregar',
            dataFormatada: order.dataCriacao ? new Date(order.dataCriacao.seconds * 1000).toLocaleDateString('pt-BR') : 'N/A',
            valorFormatado: (order.valorTotal || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
          }
        }
      })
    )

    orders.value = ordersComClients
  } catch (err) {
    error.value = 'Erro ao carregar orders: ' + err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  carregarOrders()
})
</script>

<style scoped>
.lista-orders {
  padding: 24px;
  background: #f5f5dc;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
}

/* Títulos padrão produtos */
.lista-orders h2 {
  margin-bottom: 6px;
  font-size: 26px;
  color: #2c3e50;
  font-weight: 700;
}

.lista-orders p {
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
.orders-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
  margin-top: 10px;
}

.orders-table thead th {
  background: #f1f1f1;
  padding: 14px;
  font-size: 15px;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #ddd;
  text-align: left;
}

/* Linhas como cartões */
.orders-table tbody tr {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.07);
  transition: 0.18s ease;
}

.orders-table tbody tr:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.orders-table td {
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
