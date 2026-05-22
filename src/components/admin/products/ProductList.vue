<template>
  <div class="lista-produtos-container">
    <div class="lista-produtos-card">
      <h1 class="titulo-principal">Produtos</h1>
      <div class="acoes-superior">
        <div class="barra-pesquisa">
          <div class="campo-pesquisa">
            <i class="fas fa-search"></i>
            <input
              v-model="termoPesquisa"
              type="text"
              placeholder="Buscar produtos..."
              @input="filtrarProdutos"
            />
          </div>
          <select v-model="filtroCategoria" @change="filtrarProdutos" class="filtro-rapido">
            <option value="">Todas as categorias</option>
            <option v-for="categoria in categoriasUnicas" :key="categoria" :value="categoria">
              {{ categoria }}
            </option>
          </select>
        </div>
        <router-link to="/admin/produtos/cadastrar" class="btn-cadastrar">
          Cadastrar novo produto
        </router-link>
      </div>
      <div v-if="loading" class="loading">Carregando produtos...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else>
        <table class="produtos-table">
          <thead>
            <tr>
              <th>Miniatura</th>
              <th>Produto</th>
              <th>Preço</th>
              <th>Categoria</th>
              <th>Estoque</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="produto in produtosFiltrados" :key="produto.id">
              <td>
                <img
                  v-if="produto.imagens"
                  :src="produto.imagens[0].url"
                  alt="Miniatura do produto"
                  class="miniatura"
                />
                <div v-else class="miniatura-placeholder">
                  <i class="fas fa-image"></i>
                </div>
              </td>
              <td>{{ produto.name }}</td>
              <td>{{ produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}</td>
              <td>{{ produto.categoria }}</td>
              <td>{{ produto.estoque }}</td>
              <td class="acoes">
                <router-link
                  :to="{ name: 'produto-atualizar', params: { id: produto.id } }"
                  class="btn-acao btn-editar"
                  title="Editar"
                >
                  <i class="fas fa-edit"></i>
                </router-link>
                <button
                  @click="confirmarExclusao(produto)"
                  class="btn-acao btn-excluir"
                  title="Excluir"
                >
                  <i class="fas fa-times"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { produtoService } from '@/services/productService'

const produtos = ref([])
const loading = ref(true)
const error = ref(null)
const termoPesquisa = ref('')
const filtroCategoria = ref('')
const produtoParaExcluir = ref(null)

const produtosFiltrados = computed(() => {
  let filtrados = produtos.value

  if (termoPesquisa.value) {
    filtrados = filtrados.filter(produto =>
      produto.name.toLowerCase().includes(termoPesquisa.value.toLowerCase())
    )
  }

  if (filtroCategoria.value) {
    filtrados = filtrados.filter(produto => produto.categoria === filtroCategoria.value)
  }

  return filtrados
})

const categoriasUnicas = computed(() => {
  const categorias = produtos.value.map(produto => produto.categoria)
  return [...new Set(categorias)]
})

const carregarProdutos = async () => {
  try {
    const produtosData = await produtoService.listarTodos()
    produtos.value = produtosData
  } catch (err) {
    error.value = 'Erro ao carregar produtos: ' + err.message
  } finally {
    loading.value = false
  }
}

const filtrarProdutos = () => {
  // A filtragem é feita via computed
}

const confirmarExclusao = (produto) => {
  if (confirm(`Tem certeza que deseja excluir o produto "${produto.name}"?`)) {
    excluirProduto(produto.id)
  }
}

const excluirProduto = async (id) => {
  try {
    await produtoService.excluir(id)
    produtos.value = produtos.value.filter(produto => produto.id !== id)
  } catch (err) {
    alert('Erro ao excluir produto: ' + err.message)
  }
}

onMounted(() => {
  carregarProdutos()
})
</script>

<style scoped>
.lista-produtos-container {
  min-height: 100vh;
  background-color: #1a1a1a; /* Fundo escuro */
  padding: 40px 20px;
  display: flex;
  justify-content: center;
}

.lista-produtos-card {
  background-color: #f5f5dc; /* Bege */
  border-radius: 12px;
  padding: 30px;
  width: 100%;
  max-width: 1300px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
}

.titulo-principal {
  font-size: 2.3rem;
  margin-bottom: 24px;
  color: #333;
  text-align: center;
  font-weight: 700;
  letter-spacing: 1px;
}

.acoes-superior {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 25px;
}

.barra-pesquisa {
  display: flex;
  gap: 12px;
  flex: 1;
  max-width: 600px;
}

.campo-pesquisa {
  position: relative;
  flex: 1;
}

.campo-pesquisa i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #777;
}

.campo-pesquisa input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #bbb;
  border-radius: 6px;
  font-size: 16px;
  transition: all 0.2s;
}

.campo-pesquisa input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
}

.filtro-rapido {
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #bbb;
  font-size: 16px;
  transition: all 0.2s;
}

.filtro-rapido:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
}

.btn-cadastrar {
  background-color: #28a745;
  color: white;
  padding: 12px 20px;
  border-radius: 6px;
  font-size: 16px;
  text-decoration: none;
  transition: background-color 0.3s, transform 0.1s;
  white-space: nowrap;
}

.btn-cadastrar:hover {
  background-color: #218838;
  transform: scale(1.03);
}

.loading,
.error {
  text-align: center;
  padding: 20px;
  font-size: 18px;
}

.error {
  color: red;
  background: #ffe5e5;
  border-radius: 6px;
}

/* ---- TABELA MODERNA ---- */

.produtos-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
  margin-top: 10px;
}

.produtos-table thead th {
  background-color: #e8e8d8;
  font-weight: 600;
  padding: 14px;
  color: #444;
  border-bottom: 2px solid #ccc;
}

.produtos-table tbody tr {
  background: #fff;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.12);
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.produtos-table tbody tr:hover {
  transform: scale(1.01);
  box-shadow: 0 2px 14px rgba(0, 0, 0, 0.18);
}

.produtos-table td {
  padding: 14px;
  color: #555;
}

/* ---- MINIATURA ---- */

.miniatura {
  width: 55px;
  height: 55px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.miniatura-placeholder {
  width: 55px;
  height: 55px;
  background-color: #ddd;
  border: 1px solid #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  color: #555;
}

/* ---- AÇÕES ---- */

.acoes {
  display: flex;
  gap: 10px;
}

.btn-acao {
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  border: none;
  transition: all 0.2s;
}

.btn-editar {
  background-color: #007bff;
  color: white;
}

.btn-editar:hover {
  background-color: #0056b3;
  transform: scale(1.05);
}

.btn-excluir {
  background-color: #dc3545;
  color: white;
}

.btn-excluir:hover {
  background-color: #c82333;
  transform: scale(1.05);
}

</style>
