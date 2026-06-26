<template>
  <div class="lista-clientes">
    <h2>Lista de Clientes</h2>
    <div v-if="loading" class="loading">Carregando clientes...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <table class="clientes-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Última Compra</th>
            <th>Valor Total</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cliente in clientes" :key="cliente.id">
            <td>{{ cliente.nome }}</td>
            <td>{{ cliente.email }}</td>
            <td>{{ (cliente.telefone)?.replace(/^(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3') || 'N/A' }}</td>
            <td>{{ cliente.ultimaCompra || 'N/A' }}</td>
            <td>{{ cliente.valorTotal }}</td>
            <td>
              <router-link :to="{ name: 'cliente-detalhes', params: { id: cliente.id } }" class="btn-detalhes">
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
import { usuarioService } from '@/services/usuarioService'
import { pedidoService } from '@/services/pedidoService'

const clientes = ref([])
const loading = ref(true)
const error = ref(null)

const carregarClientes = async () => {
  try {
    const usuarios = await usuarioService.listarTodos()

    // Para cada cliente, buscar pedidos e calcular última compra e valor total
    const clientesComDados = await Promise.all(
      usuarios.map(async (cliente) => {
        try {
          const pedidos = await pedidoService.buscarPorUsuario(cliente.id)
          const pedidosCompletados = pedidos.filter(p => p.status === 'CONCLUIDO')

          let ultimaCompra = 'N/A'
          let valorTotal = 0

          if (pedidosCompletados.length > 0) {
            // Última compra é a mais recente
            const pedidoMaisRecente = pedidosCompletados.sort((a, b) =>
              new Date(b.createdAt) - new Date(a.createdAt)
            )[0]
            ultimaCompra = new Date(pedidoMaisRecente.createdAt).toLocaleDateString('pt-BR')

            // Valor total é a soma de todos os pedidos concluídos
            valorTotal = pedidosCompletados.reduce((total, pedido) => total + (pedido.valorTotal || 0), 0)
          }

          return {
            ...cliente,
            ultimaCompra,
            valorTotal: valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
          }
        } catch (err) {
          console.error(`Erro ao buscar pedidos do cliente ${cliente.id}:`, err)
          return {
            ...cliente,
            ultimaCompra: 'N/A',
            valorTotal: 'R$ 0,00'
          }
        }
      })
    )

    clientes.value = clientesComDados
  } catch (err) {
    error.value = 'Erro ao carregar clientes: ' + err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  carregarClientes()
})
</script>

<style scoped>
.lista-clientes {
  padding: 24px;
  background: #f5f5dc;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.lista-clientes h2 {
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

.clientes-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px; /* linhas separadas */
  margin-top: 20px;
}

.clientes-table thead th {
  background-color: #f6f6f6;
  font-weight: 600;
  padding: 12px;
  border-bottom: 2px solid #ddd;
  color: #444;
  text-align: left;
}

.clientes-table tbody tr {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.1s, box-shadow 0.1s;
}

.clientes-table tbody tr:hover {
  transform: scale(1.01);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.clientes-table td {
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
