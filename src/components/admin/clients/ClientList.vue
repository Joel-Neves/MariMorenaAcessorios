<template>
  <div class="lista-clients">
    <h2>Lista de Clients</h2>
    <div v-if="loading" class="loading">Carregando clients...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <table class="clients-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Última Compra</th>
            <th>Valor Total</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="client in clients" :key="client.id">
            <td>{{ client.name }}</td>
            <td>{{ client.email }}</td>
            <td>{{ client.phone || 'N/A' }}</td>
            <td>{{ client.lastPurchase || 'N/A' }}</td>
            <td>{{ client.totalvalue }}</td>
            <td>
              <router-link :to="{ name: 'client-details', params: { id: client.id } }" class="btn-detalhes">
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
import { ref, onMounted } from 'vue'
import { userService } from '@/services/userService'
import { orderService } from '@/services/orderService'

const clients = ref([])
const loading = ref(true)
const error = ref(null)

const loadClients = async () => {
  try {
    const users = await userService.listarTodos()

    // Para cada client, buscar orders e calcular última compra e valor total
    const clientsWithDetails = await Promise.all(
      users.map(async (client) => {
        try {
          const orders = await orderService.buscarPorUser(client.id)
          const completedOrders = orders.filter(p => p.status === 'concluido')

          let lastPurchase = 'N/A'
          let totalvalue = 0

          if (completedOrders.length > 0) {
            // Última compra é a mais recente
            const orderMostRecent = completedOrders.sort((a, b) =>
              new Date(b.createdAt) - new Date(a.createdAt)
            )[0]
            lastPurchase = new Date(orderMostRecent.createdAt).toLocaleDateString('pt-BR')

            // Valor total é a soma de todos os orders concluídos
            totalvalue = completedOrders.reduce((total, order) => total + (order.total || 0), 0)
          }

          return {
            ...client,
            lastPurchase,
            totalvalue: totalvalue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
          }
        } catch (err) {
          console.error(`Erro ao buscar orders do client ${client.id}:`, err)
          return {
            ...client,
            lastPurchase: 'N/A',
            totalvalue: 'R$ 0,00'
          }
        }
      })
    )

    clients.value = clientsWithDetails
  } catch (err) {
    error.value = 'Erro ao carregar clients: ' + err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadClients()
})
</script>

<style scoped>
.lista-clients {
  padding: 24px;
  background: #f5f5dc;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.lista-clients h2 {
  margin-bottom: 12px;
  font-size: 24px;
  color: #333;
  font-weight: 600;
}

.loading, 
.error {
  text-align: center;
  padding: 20px;
  font-size: 16px;
}

.error {
  color: red;
  background: #ffe5e5;
  border-radius: 6px;
}

.clients-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px; /* linhas separadas */
  margin-top: 20px;
}

.clients-table thead th {
  background-color: #f6f6f6;
  font-weight: 600;
  padding: 12px;
  border-bottom: 2px solid #ddd;
  color: #444;
  text-align: left;
}

.clients-table tbody tr {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.1s, box-shadow 0.1s;
}

.clients-table tbody tr:hover {
  transform: scale(1.01);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.clients-table td {
  padding: 12px;
  color: #555;
  border-top: 1px solid #eee;
}

.btn-detalhes {
  background-color: #007bff;
  color: white;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  font-size: 14px;
  transition: background 0.3s, transform 0.1s;
}

.btn-detalhes:hover {
  background-color: #0056b3;
  transform: scale(1.03);
}

</style>
