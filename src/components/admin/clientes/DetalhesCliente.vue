<template>
  <div class="cliente-container">
    <div v-if="loading" class="loading">Carregando detalhes...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="cliente-card">

      <!-- Título -->
      <h2 class="titulo">Detalhes do Cliente</h2>

      <!-- Grid de informações -->
      <div class="info-grid">

        <div class="info-item">
          <strong>Nome</strong>
          <span>{{ cliente.nome }}</span>

          <strong>Email</strong>
          <span>{{ cliente.email }}</span>

          <strong>Telefone</strong>
          <span>{{ cliente.telefone || 'N/A' }}</span>

          <strong>Endereço</strong>
          <span>{{ enderecoFormatado }}</span>
          <div class="info-item">
            <strong>Total Gasto</strong>
            <span>{{ totalGastoFormatado }}</span>
          </div>
        </div>


      </div>

      <!-- Ações -->
      <div class="acoes">
        <button class="btn-acao" @click="enviarEmail">
          <i class="fas fa-envelope"></i> Enviar Email
        </button>
      </div>

      <!-- Histórico de compras -->
      <h3 class="subtitulo">Histórico de Compras</h3>

      <div v-if="pedidos.length > 0" class="tabela-container">
        <table class="tabela">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Data</th>
              <th>Status</th>
              <th>Valor</th>
              <th>Produtos</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="pedido in pedidos" :key="pedido.id">
              <td>#{{ pedido.id }}</td>
              <td>{{ pedido.createdAt }}</td>
              <td>
                <span :class="['status', statusClass(pedido.status)]">{{ pedido.status }}</span>
              </td>
              <td>{{ valorPedidoFormatado(pedido.valorTotal) }}</td>
              <td>{{ totalProdutos(pedido) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else class="nenhum-pedido">Nenhuma compra encontrada.</p>

    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { usuarioService } from '@/services/usuarioService'
import { pedidoService } from '@/services/pedidoService'

const route = useRoute()

const cliente = ref(null)
const pedidos = ref([])
const loading = ref(true)
const error = ref(null)
const totalGasto = ref(0)



const totalGastoFormatado = computed(() => {
  return totalGasto.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
})

const carregarDados = async () => {
  try {
    const id = route.params.id
    cliente.value = await usuarioService.buscarPorId(id)
    pedidos.value = await pedidoService.buscarPorUsuario(id)

    totalGasto.value = pedidos.value
      .reduce((sum, p) => sum + (p.total || 0), 0)
  } catch (err) {
    error.value = 'Erro ao carregar dados: ' + err.message
  } finally {
    loading.value = false
  }
}

const statusClass = (status) => {
  if (status === 'Entregue') return 'status-success'
  if (status === 'Processando' || status === 'Enviado') return 'status-attention'
  return 'status-critical'
}

const valorPedidoFormatado = (total) => {
  return (total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const totalProdutos = (pedido) => {
  if (!pedido?.itens?.length) return 0;

  return pedido.itens.reduce((total, item) => total + (item.quantidade || 0), 0);
};

const enviarEmail = () => {
  if (cliente.value && cliente.value.email) {
    window.location.href = `mailto:${cliente.value.email}`
  }
}
const enderecoFormatado = computed(() => {
  const e = cliente.value?.endereco
  if (!e) return "N/A"

  const partes = [
    e.rua,
    e.numero ? `, ${e.numero}` : "",
    e.complemento ? ` - ${e.complemento}` : "",
    e.bairro,
    (e.cidade || e.estado)
      ? `${e.cidade}${e.cidade && e.estado ? " - " : ""}${e.estado}`
      : "",
    e.cep ? `CEP: ${e.cep}` : ""
  ]

  return partes.filter(Boolean).join(" ")
})

onMounted(() => {
  carregarDados()
})
</script>


<style scoped>
/* Fundo suave */
.cliente-container {
  background: #f4f4f4;
  min-height: 100vh;
  padding: 30px;
  display: flex;
  justify-content: center;
}

/* Cartão principal */
.cliente-card {
  background: #fff;
  width: 100%;
  max-width: 900px;
  padding: 35px;
  border-radius: 14px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.07);
}

/* Títulos */
.titulo {
  font-size: 26px;
  margin-bottom: 25px;
  font-weight: 600;
  color: #222;
}

.subtitulo {
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
.acoes {
  margin-top: 20px;
  text-align: center;
}

.btn-acao {
  background: #0066ff;
  color: #fff;
  padding: 12px 26px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 15px;
  transition: 0.2s;
}

.btn-acao:hover {
  background: #0053d6;
}

/* Tabela minimalista */
.tabela-container {
  overflow-x: auto;
}

.tabela {
  width: 100%;
  border-collapse: collapse;
}

.tabela th {
  padding: 14px;
  background: #f1f1f1;
  font-weight: 600;
  color: #444;
  text-align: left;
  border-bottom: 2px solid #e0e0e0;
}

.tabela td {
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

/* Sem pedidos */
.nenhum-pedido {
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

