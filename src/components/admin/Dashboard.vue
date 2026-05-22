<template>
  <div class="dashboard-container">
    <div class="dashboard-card">
      <h1 class="titulo-principal">Dashboard</h1>

      <!-- KPIs Section -->
      <div class="kpis-section">
        <div class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-value">{{ ordersHoje }}</div>
            <div class="kpi-label">Orders hoje</div>
          </div>
          <div class="kpi-icon">
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-value">{{ estoque }}</div>
            <div class="kpi-label">Estoque</div>
          </div>
          <div class="kpi-icon">
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-value">{{ vendasMes }}</div>
            <div class="kpi-label">Vendas no mês</div>
          </div>
          <div class="kpi-icon">
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-value">{{ clientsAtivos }}</div>
            <div class="kpi-label">Clients ativos</div>
          </div>
          <div class="kpi-icon">
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>
      </div>

      <!-- Modules Section -->
      <div class="modules-section">
        <!-- Novos Orders -->
        <div class="module-panel">
          <h2 class="module-title">Novos orders</h2>
          <div v-if="loadingOrders" class="loading">Carregando orders...</div>
          <div v-else-if="errorOrders" class="error">{{ errorOrders }}</div>
          <div v-else class="orders-list">
            <div v-for="order in ordersRecentes" :key="order.id" class="order-item">
              <div class="order-info">
                <span class="order-numero">nº {{ order.numero }}</span>
                <span class="order-produto">{{ order.produtoName }}</span>
              </div>
              <div class="order-status">
                <i v-if="order.status === 'processando'" class="fas fa-spinner fa-spin status-loading"></i>
                <i v-else-if="order.status === 'entregue'" class="fas fa-check status-completed"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Produtos Mais Vendidos -->
        <div class="module-panel">
          <h2 class="module-title">Produtos mais vendidos</h2>
          <div v-if="loadingProdutos" class="loading">Carregando produtos...</div>
          <div v-else-if="errorProdutos" class="error">{{ errorProdutos }}</div>
          <div v-else class="produtos-list">
            <div v-for="produto in produtosVendidos" :key="produto.id" class="produto-item">
              <span class="produto-name">{{ produto.name }}</span>
              <span class="produto-volume">{{ produto.volume }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { orderService } from '@/services/orderService'
import { produtoService } from '@/services/productService'
import { userService } from '@/services/userService'

const ordersHoje = ref('--')
const estoque = ref('--')
const vendasMes = ref('R$ --,--')
const clientsAtivos = ref('--')
const produtos = ref([])

const ordersRecentes = ref([])
const loadingOrders = ref(true)
const errorOrders = ref(null)

const produtosVendidos = ref([])
const loadingProdutos = ref(true)
const errorProdutos = ref(null)

const carregarKPIs = async () => {
  try {
    const hoje = new Date().toISOString().split('T')[0]
    const orders = await orderService.listarTodos()
    const ordersHojeCount = orders.filter(p => p.dataCriacao && p.dataCriacao === hoje).length
    ordersHoje.value = ordersHojeCount

    const produtos = await produtoService.listarTodos()
    const estoqueTotal = produtos.reduce((sum, p) => sum + (p.estoque || 0), 0)
    estoque.value = estoqueTotal

    const mesAtual = new Date().getMonth() + 1
    const anoAtual = new Date().getFullYear()
    const vendas = orders.filter(p => {
      if (p.status !== 'entregue') return false
      const data = p.dataCriacao.toDate ? p.dataCriacao.toDate() : new Date(p.dataCriacao)
      return data.getMonth() + 1 === mesAtual && data.getFullYear() === anoAtual
    })
    const totalVendas = vendas.reduce((sum, p) => sum + (p.total || 0), 0)
    vendasMes.value = totalVendas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

    const users = await userService.listarTodos()
    clientsAtivos.value = users.length
  } catch (err) {
    console.error('Erro ao carregar KPIs:', err)
  }
}

const carregarOrdersRecentes = async () => {
  try {
    const orders = await orderService.listarTodos()
    const produtos = await produtoService.listarTodos()
    const produtoMap = produtos.reduce((map, prod) => {
      map[prod.id] = prod.name
      return map
    }, {})

    const ordersOrdenados = orders.sort((a, b) => {
      const dataA = a.dataCriacao?.toDate ? a.dataCriacao.toDate() : new Date(a.dataCriacao)
      const dataB = b.dataCriacao?.toDate ? b.dataCriacao.toDate() : new Date(b.dataCriacao)
      return dataB - dataA
    })
    ordersRecentes.value = ordersOrdenados.slice(0, 4).map((p) => ({
      id: p.id,
      numero: p.id, 
      produtoName: p.itens?.map(item => produtoMap[item.produtoId]).join(', '),
      status: p.status
    }))
  } catch (err) {
    errorOrders.value = 'Erro ao carregar orders: ' + err.message
  } finally {
    loadingOrders.value = false
  }
}

const carregarProdutosVendidos = async () => {
  try {
    const produtos = await produtoService.listarTodos()
    const orders = await orderService.listarTodos()

    // Calculate total sold quantity for each product
    const vendasPorProduto = orders.reduce((acc, order) => {
      if (order.itens && order.status === 'entregue') {
        order.itens.forEach(item => {
          if (item.produtoId) {
            acc[item.produtoId] = (acc[item.produtoId] || 0) + (item.quantidade)
          }
        })
      }
      return acc
    }, {})

    // Sort products by total sold quantity descending
    produtosVendidos.value = produtos
      .map(p => ({
        id: p.id,
        name: p.name,
        volume: vendasPorProduto[p.id] || 0
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 3)
  } catch (err) {
    errorProdutos.value = 'Erro ao carregar produtos: ' + err.message
  } finally {
    loadingProdutos.value = false
  }
}

onMounted(() => {
  carregarKPIs()
  carregarOrdersRecentes()
  carregarProdutosVendidos()
})
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: #1a1a1a;
  padding: 30px;
  display: flex;
  justify-content: center;
}

.dashboard-card {
  background-color: #f5f5dc;
  border-radius: 14px;
  padding: 35px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 1400px;
  border: 1px solid rgba(0,0,0,0.1);
}

.titulo-principal {
  font-size: 2.4rem;
  font-weight: 700;
  color: #222;
  margin-bottom: 35px;
  text-align: center;
  letter-spacing: .6px;
}

/* KPIs ------- */
.kpis-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22px;
  margin-bottom: 45px;
}

.kpi-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid rgba(0,0,0,0.08);
  transition: transform .2s ease, box-shadow .2s ease;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 14px rgba(0,0,0,0.15);
}

.kpi-value {
  font-size: 2.2rem;
  font-weight: 700;
  color: #222;
}

.kpi-label {
  margin-top: 6px;
  font-size: 0.95rem;
  color: #555;
}

.kpi-icon {
  font-size: 1.7rem;
  color: #777;
  opacity: 0.9;
}

/* PANELS -------- */
.modules-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
}

.module-panel {
  background-color: #fff;
  padding: 25px;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid rgba(0,0,0,0.08);
  transition: box-shadow .2s ease;
}

.module-panel:hover {
  box-shadow: 0 5px 16px rgba(0,0,0,0.15);
}

.module-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 22px;
  color: #222;
}

/* LISTAS -------- */
.orders-list,
.produtos-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-item,
.produto-item {
  background: #fafafa;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(0,0,0,0.08);
  transition: background .2s ease;
}

.order-item:hover,
.produto-item:hover {
  background: #f2f2f2;
}

.order-info {
  display: flex;
  flex-direction: column;
}

.order-numero {
  font-weight: 700;
  color: #222;
}

.order-produto {
  font-size: 0.9rem;
  color: #666;
}

.order-status {
  font-size: 1.4rem;
}

.status-loading {
  color: #f0ad4e;
}

.status-completed {
  color: #28a745;
}

.produto-name {
  font-size: 1rem;
  font-weight: 500;
  color: #222;
}

.produto-volume {
  color: #333;
  font-weight: 700;
  font-size: 0.95rem;
}

/* LOADING E ERRO ------ */
.loading,
.error {
  text-align: center;
  padding: 20px;
  font-size: 1rem;
}

.error {
  color: #c2185b;
  font-weight: 600;
}

</style>
