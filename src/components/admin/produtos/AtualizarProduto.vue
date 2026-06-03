<template>
  <div class="atualizar-produto">
    
    <div class="form-panel">
      <h1>Atualizar produto</h1>
      <p>Edite as informações do produto selecionado.</p>
      <form @submit.prevent="salvarProduto">
        <section class="form-section">
          <h2>Informações do acessório</h2>

          <div class="form-group">
            <label for="nome">Nome do produto</label>
            <input id="nome" v-model="produto.name" type="text" required />
          </div>

          <div class="form-group">
            <label for="preco">Preço</label>
            <input id="preco" v-model.number="produto.price" type="number" step="0.01" required />
          </div>
          <div class="form-group">
            <label for="cor">Cor</label>
            <input id="cor" v-model="produto.color" type="text" />
          </div>
          <div class="form-group">
            <label for="categoria">Categorias</label>
            <select id="categoria" v-model="produto.category" required>
              <option value="">Selecione uma categoria</option>
              <option value="ANEL">Anéis</option>
              <option value="BRINCO">Brincos</option>
              <option value="COLAR">Colares</option>
              <option value="CONJUNTO">Conjuntos</option>
              <option value="BRACELETE">Pulseiras</option>
              <option value="TIARA">Tiaras</option>
              <option value="OUTROS">Outros</option>
            </select>
          </div>
          <div class="form-group">
            <label for="estoque">Estoque</label>
            <input id="estoque" v-model.number="produto.quantity" type="number" step="0.01" required />
          </div>

          <div class="form-group">
            <label for="descricao">Descrição</label>
            <textarea id="descricao" v-model="produto.description" rows="4" required></textarea>
          </div>

          <div>
            <label for="ativo">
              <input id="ativo" v-model="produto.active" type="checkbox" />
              Produto ativo
            </label>
          </div>
        </section>

        <section class="form-section">
          <h2>Mídia e imagens</h2>

          <div v-if="imagensExistentes.length > 0" class="imagens-existentes">
            <h3>Imagens atuais:</h3>
            <div class="imagens-grid">
              <div v-for="(imagem, index) in imagensExistentes" :key="index" class="imagem-item">
                <img :src="imagem.url" alt="Imagem do produto" />
                <button type="button" @click="removerImagemExistente(index)">Remover</button>
              </div>
            </div>
          </div>

          <div class="upload-area" @dragover.prevent @drop.prevent="onDrop" @click="$refs.fileInput.click()">
            <div class="upload-content">
              <i class="fas fa-camera"></i>
              <p>Clique para fazer upload ou arraste e solte</p>
              <p class="upload-formats">Formatos suportados: png, jpg, jpeg, webp</p>
            </div>
            <input ref="fileInput" type="file" multiple accept=".png,.jpg,.jpeg,.webp" @change="onFileChange"
              style="display: none;" />
          </div>

          <div v-if="arquivosNovos.length > 0" class="file-list">
            <h3>Novos arquivos selecionados:</h3>
            <ul>
              <li v-for="(arquivo, index) in arquivosNovos" :key="index">
                {{ arquivo.name }}
                <button type="button" @click="removerArquivoNovo(index)">Remover</button>
              </li>
            </ul>
          </div>
        </section>

        <div class="form-actions">
          <button type="button" @click="cancelarEdicao" class="btn-secondary">Cancelar edição</button>
          <button type="button" @click="desabilitarProduto" class="btn-warning">Desabilitar produto</button>
          <button type="button" @click="excluirProduto" class="btn-danger">Excluir</button>
          <button type="submit" class="btn-primary">Salvar alterações</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { produtoService } from '@/services/produtoService';

const route = useRoute();
const router = useRouter();

const produto = ref({
  name: '',
  price: null,
  color: '',
  category: '',
  description: '',
  quantity: null,
  active: true
});

const imagensExistentes = ref([]);
const arquivosNovos = ref([]);
const fileInput = ref(null);

onMounted(async () => {
  const produtoId = route.params.id;
  try {
    const produtoData = await produtoService.buscarPorId(produtoId);
    produto.value = {
      name: produtoData.nome || '',
      price: produtoData.preco || null,
      category: produtoData.categoria || '',
      color: produtoData.cor || '',
      description: produtoData.descricao || '',
      quantity: produtoData.estoque || null,
      active: produtoData.ativo !== false 
    };
    imagensExistentes.value = produtoData.imagens || [];
  } catch (error) {
    console.error('Erro ao carregar produto:', error);
    alert('Erro ao carregar produto: ' + error.message);
    router.push('/admin/produtos');
  }
});

const onFileChange = (event) => {
  const files = Array.from(event.target.files);
  arquivosNovos.value.push(...files);
};

const onDrop = (event) => {
  const files = Array.from(event.dataTransfer.files);
  arquivosNovos.value.push(...files);
};

const removerArquivoNovo = (index) => {
  arquivosNovos.value.splice(index, 1);
};

const removerImagemExistente = async (index) => {
  try {
    imagensExistentes.value.splice(index, 1);
  } catch (error) {
    console.error('Erro ao remover imagem:', error);
    alert('Erro ao remover imagem: ' + error.message);
  }
};

const salvarProduto = async () => {
  try {
  const produtoId = route.params.id;
    await produtoService.atualizar(produtoId, produto.value, arquivosNovos.value);
    alert('Produto atualizado com sucesso!');
    router.push('/admin/produtos');
  } catch (error) {
    console.error('Erro ao salvar produto:', error);
    alert('Erro ao salvar produto: ' + error.message);
  }
};

const cancelarEdicao = () => {
  router.go(-1);
};

const desabilitarProduto = async () => {
  const produtoId = route.params.id;
  try {
    await produtoService.atualizar(produtoId, { ativo: false });
    produto.value.ativo = false;
    alert('Produto desabilitado com sucesso!');
  } catch (error) {
    console.error('Erro ao desabilitar produto:', error);
    alert('Erro ao desabilitar produto: ' + error.message);
  }
};

const excluirProduto = async () => {
  if (confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) {
    const produtoId = route.params.id;
    try {
      await produtoService.deletar(produtoId);
      alert('Produto excluído com sucesso!');
      router.push('/admin/produtos');
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao excluir produto: ' + error.message);
    }
  }
};
</script>
<style scoped>
.upload-area {
  margin-top: 20px;
  padding: 30px;
  border: 2px dashed #dcdcdc;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  background-color: #fafafa;
}
.atualizar-produto {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px;
}

.atualizar-produto h1 {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 5px;
}

.atualizar-produto p {
  font-size: 15px;
  color: #666;
  margin-bottom: 25px;
}

/* Painel idêntico ao cadastrar produto */
.form-panel {
  background: #f5f5dc;
  padding: 28px;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

/* Seções */
.form-section {
  margin-bottom: 35px;
}

.form-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: #34495e;
  margin-bottom: 18px;
}

/* Inputs */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #555;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #dcdcdc;
  background: #fafafa;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  background: #fff;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52,152,219,0.15);
}

/* Checkbox padronizado */
#ativo {
  margin-right: 8px;
}

/* Imagens existentes */
.imagens-existentes h3 {
  font-size: 15px;
  margin-bottom: 10px;
  color: #444;
  font-weight: 600;
}

.imagens-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.imagem-item {
  position: relative;
}

.imagem-item img {
  width: 100%;
  height: 110px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.imagem-item button {
  position: absolute;
  top: 6px;
  right: 6px;
  background: #e74c3c;
  border: none;
  color: #fff;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
}
.form-actions{
  display: flex;
  gap: 10px;
}
</style>