<template>
  <div class="client-container">
    <div v-if="loading" class="loading">Carregando detalhes...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="client-card">

      <!-- Título -->
      <h2 class="title">Detalhes do client</h2>

      <!-- Grid de informações -->
      <div class="info-grid">

        <div class="info-item">
          <strong>Name</strong>
          <span>{{ client.name }}</span>

          <strong>Email</strong>
          <span>{{ client.email }}</span>

          <strong>Telefone</strong>
          <span>{{ client.phone || 'N/A' }}</span>

          <strong>Endereço</strong>
          <span>{{ formatAddress }}</span>
          <div class="info-item">
            <strong>Total Gasto</strong>
            <span>{{ formatTotalValue }}</span>
          </div>
        </div>


      </div>

      <!-- Ações -->
      <div class="actions">
        <button class="btn-action" @click="submitEmail">
          <i class="fas fa-envelope"></i> Enviar Email
        </button>
      </div>

      <!-- Histórico de compras -->
      <h3 class="subtitle">Histórico de Compras</h3>

      <div v-if="orders.length > 0" class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Data</th>
              <th>Status</th>
              <th>Valor</th>
              <th>Produtos</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td>#{{ order.id.slice(-8).toUpperCase() }}</td>
              <td>{{ order.createdAt }}</td>
              <td>
                <span :class="['status', statusClass(order.status)]">{{ order.status }}</span>
              </td>
              <td>{{ formatOrderValue(order.total) }}</td>
              <td>{{ totalProducts(order) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else class="order-none">Nenhuma compra encontrada.</p>

    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { userService } from '@/services/userService'
import { orderService } from '@/services/orderService'

const route = useRoute()

const client = ref(null)
const orders = ref([])
const loading = ref(true)
const error = ref(null)
const totalvalue = ref(0)



const formatTotalValue = computed(() => {
  return totalvalue.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
})

const loadClientData = async () => {
  try {
    const id = route.params.id
    client.value = await userService.findById(id)
    orders.value = await orderService.findByUserId(id)

    totalvalue.value = orders.value
      .reduce((sum, o) => sum + (o.total || 0), 0)
  } catch (err) {
    error.value = 'Erro ao carregar data: ' + err.message
  } finally {
    loading.value = false
  }
}

const statusClass = (status) => {
  if (status === 'SHIPPED') return 'status-success'
  if (status === 'PENDING' || status === 'DELIVERED') return 'status-attention'
  if (status === 'CANCELLED') return 'status-critical'
}

const formatOrderValue = (total) => {
  return (total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const totalProducts = (order) => {
  if (!order?.itens?.length) return 0;

  return order.itens.reduce((total, item) => total + (item.quantity || 0), 0);
};

const submitEmail = () => {
  if (client.value && client.value.email) {
    window.location.href = `mailto:${client.value.email}`
  }
}
const formatAddress = computed(() => {
  const e = client.value?.endereco
  if (!e) return "N/A"

  const part = [
    e.street,
    e.number ? `, ${e.number}` : "",
    e.complement ? ` - ${e.complement}` : "",
    e.neighborhood ? ` - ${e.neighborhood}` : "",
    (e.city || e.state)
      ? `${e.city}${e.city && e.state ? " - " : ""}${e.state}`
      : "",
    e.zipCode ? `CEP: ${e.zipCode}` : ""
  ]

  return part.filter(Boolean).join(" ")
})

onMounted(() => {
  loadClientData()
})
</script>


<style scoped>
/* Fundo suave */
.client-container {
  background: #f4f4f4;
  min-height: 100vh;
  padding: 30px;
  display: flex;
  justify-content: center;
}

/* Cartão principal */
.client-card {
  background: #fff;
  width: 100%;
  max-width: 900px;
  padding: 35px;
  border-radius: 14px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.07);
}

/* Títulos */
.title {
  font-size: 26px;
  margin-bottom: 25px;
  font-weight: 600;
  color: #222;
}

.subtitle {
  font-size: 20px;
  margin: 40px 0 15px;
  font-weight: 600;
  color: #333;
}

/* Grid de informações */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.info-item {
  background: #fafafa;
  border: 1px solid #eee;
  padding: 16px;
  border-radius: 10px;
}

.info-item strong {
  font-size: 14px;
  color: #666;
}

.info-item span {
  display: block;
  margin-top: 4px;
  font-size: 16px;
  font-weight: 500;
  color: #222;
}

/* Botão */
.actions {
  margin-top: 20px;
  text-align: center;
}

.btn-action {
  background: #0066ff;
  color: #fff;
  padding: 12px 26px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 15px;
  transition: 0.2s;
}

.btn-action:hover {
  background: #0053d6;
}

/* table minimalista */
.table-container {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  padding: 14px;
  background: #f1f1f1;
  font-weight: 600;
  color: #444;
  text-align: left;
  border-bottom: 2px solid #e0e0e0;
}

.table td {
  padding: 14px;
  border-bottom: 1px solid #eee;
  color: #555;
}

/* Status minimalista */
.status {
  padding: 5px 12px;
  border-radius: 30px;
  font-size: 12px;
  font-weight: 600;
}

.status-success {
  background: #d1f7d6;
  color: #047a3b;
}

.status-attention {
  background: #fff3c4;
  color: #7a6104;
}

.status-critical {
  background: #ffd6d6;
  color: #a30707;
}

/* Sem orders */
.order-none {
  text-align: center;
  padding: 50px;
  font-size: 16px;
  color: #666;
  font-style: italic;
}

/* Loader & error */
.loading, .error {
  font-size: 18px;
  padding: 40px;
  color: #333;
}

.error {
  color: #c40000;
}
</style>

