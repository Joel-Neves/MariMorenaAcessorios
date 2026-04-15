<template>
  <div class="cadastrar-container">
    <div class="cadastrar-card">
      <h1 class="titulo-principal">Cadastrar novo produto</h1>
      <p class="subtitulo">Preencha as informações para adicionar um novo item ao catálogo.</p>

      <div class="form-grid">
        <!-- Informações -->
        <section class="form-box">
          <h2 class="section-title">Informações do Produto</h2>

          <div class="form-group">
            <label for="nome">Nome do produto</label>
            <input id="nome" v-model="produto.nome" type="text" required :class="{ 'is-invalid': v$.nome.$error }" />
            <div v-if="v$.nome.$error" class="invalid-feedback">
              {{ getFieldError('nome') }}
            </div>
          </div>

          <div class="form-group">
            <label for="preco">Preço</label>
            <input id="preco" v-model.number="produto.preco" type="number" step="0.01" required :class="{ 'is-invalid': v$.preco.$error }" />
            <div v-if="v$.preco.$error" class="invalid-feedback">
              {{ getFieldError('preco') }}
            </div>
          </div>
          <div class="form-group">
            <label for="cor">Cor</label>
            <input id="cor" v-model="produto.cor" required :class="{ 'is-invalid': v$.cor.$error }"/>
          </input>
            <div v-if="v$.cor.$error" class="invalid-feedback">{{ getFieldError('cor') }}</div>
          </div>

          <div class="form-group">
            <label for="categoria">Categoria</label>
            <select id="categoria" v-model="produto.categoria" required :class="{ 'is-invalid': v$.categoria.$error }" >
              <option value="">Selecione</option>
              <option value="Anéis">Anéis</option>
              <option value="Brincos">Brincos</option>
              <option value="Colares">Colares</option>
              <option value="Conjuntos">Conjuntos</option>
              <option value="Pulseiras">Pulseiras</option>
              <option value="Tiaras">Tiaras</option>
              <option value="Outros">Outros</option>
            </select>
            <div v-if="v$.categoria.$error" class="invalid-feedback">{{ getFieldError('categoria') }}</div>
          </div>
          <div class="form-group">
            <label for="estoque">Estoque</label>
            <input id="estoque" v-model.number="produto.estoque" type="number" step="1" min="0" required :class="{ 'is-invalid': v$.estoque.$error }" />
            <div v-if="v$.estoque.$error" class="invalid-feedback">
              {{ getFieldError('estoque') }}
            </div>
          </div>

          <div class="form-group">
            <label for="descricao">Descrição</label>
            <textarea id="descricao" v-model="produto.descricao" rows="4" required :class="{ 'is-invalid': v$.descricao.$error }"></textarea>
            <div v-if="v$.descricao.$error" class="invalid-feedback">
              {{ getFieldError('descricao') }}
            </div>
          </div>
        </section>

        <section class="form-box">
          <h2 class="section-title">Imagens e Mídia</h2>

          <div class="upload-area" @dragover.prevent @drop.prevent="onDrop" @click="$refs.fileInput.click()" required :class="{ 'is-invalid': imagensInvalidas }">
            <div class="upload-content">
              <i class="fas fa-camera"></i>
              <p>Clique ou arraste arquivos aqui</p>
              <span class="formatos">png, jpg, webp, mp4</span>
            </div>
            <input ref="fileInput" type="file" multiple accept=".png,.jpg,.jpeg,.webp,.mp4"
              @change="onFileChange" style="display: none" />
          </div>

          <div v-if="imagensInvalidas" class="invalid-feedback">
            Adicione pelo menos uma imagem ou vídeo do produto.
          </div>

          <div v-if="arquivos.length" class="file-list">
            <h3>Arquivos selecionados</h3>
            <ul>
              <li v-for="(arquivo, index) in arquivos" :key="index">
                {{ arquivo.name }}
                <button type="button" @click="removerArquivo(index)" class="btn-remove">Remover</button>
              </li>
            </ul>
          </div>
        </section>
      </div>

      <div class="form-actions">
        <button type="button" @click="limparFormulario" class="btn-secondary">Limpar</button>
        <button @click="salvarProduto" class="btn-primary">Salvar Produto</button>
      </div>
    </div>
  </div>
</template>


<script setup>
import { computed, ref } from 'vue';
import { produtoService } from '@/services/produtoService';
import { storageService } from '@/services/storageService';
import { helpers, minLength, minValue, required, numeric } from '@vuelidate/validators';
import { useVuelidate } from '@vuelidate/core';

const produto = ref({
  nome: '',
  preco: null,
  cor: '',
  categoria: '',
  estoque: null,
  descricao: '',
  ativo: true,
});

const rules = {
  nome: {
    required: helpers.withMessage('O nome do produto é obrigatório.', required),
    minLength: helpers.withMessage('O nome deve ter ao menos 3 caracteres.', minLength(3)),
  },
  preco: {
    required: helpers.withMessage('O preço do produto é obrigatório.', required),
    minValue: helpers.withMessage('O preço deve ser maior que zero.', minValue(0.01),),
    numeric: helpers.withMessage('O preço deve ser um valor numérico.', numeric),
  },
  cor: {
    required: helpers.withMessage('A cor do produto é obrigatória.', required),
  },
  categoria: {
    required: helpers.withMessage('A categoria do produto é obrigatória.', required),
  },
  estoque: {
    required: helpers.withMessage('O estoque do produto é obrigatório.', required),
    minValue: helpers.withMessage('O estoque deve ser igual ou maior que zero.', minValue(0)),
    numeric: helpers.withMessage('O estoque deve ser um valor numérico.', numeric),
  },
  descricao: {
    required: helpers.withMessage('A descrição do produto é obrigatória.', required),
    minLength: helpers.withMessage('A descrição deve ter ao menos 10 caracteres.', minLength(10)),
  },
};

const v$ = useVuelidate(rules, produto);

const arquivos = ref([]);
const tentouEnviar = ref(false);
const imagensInvalidas = computed(() => tentouEnviar.value && arquivos.value.length === 0);

const onFileChange = (event) => {
  const files = Array.from(event.target.files);
  arquivos.value.push(...files);
};

const onDrop = (event) => {
  const files = Array.from(event.dataTransfer.files);
  arquivos.value.push(...files);
};

const removerArquivo = (index) => {
  arquivos.value.splice(index, 1);
};

const salvarProduto = async () => {
  tentouEnviar.value = true;
  const formularioValido = await v$.value.$validate();

  if (!formularioValido || arquivos.value.length === 0) {
    alert('Revise os campos obrigatórios antes de salvar.');
    return;
  }

  try {
    const novoProduto = {
      ...produto.value,
      imagens: []
    };

    const produtoCriado = await produtoService.criar(novoProduto);

    const imagensParaAtualizar = [];

    for (const arquivo of arquivos.value) {
      const { url, caminho } = await storageService.uploadImagemProduto(
        arquivo,
        produtoCriado.id
      );

      imagensParaAtualizar.push({ url, path: caminho });
    }

    await produtoService.atualizar(produtoCriado.id, { imagens: imagensParaAtualizar });

    alert('Produto cadastrado com sucesso!');
    limparFormulario();
  } catch (error) {
    console.error('Erro ao salvar produto:', error);
    alert('Erro ao salvar produto: ' + error.message);
  }
};

const limparFormulario = () => {
  produto.value = {
    nome: '',
    preco: null,
    cor: '',
    categoria: '',
    estoque: null,
    descricao: '',
    ativo: true,
  };
  arquivos.value = [];
  tentouEnviar.value = false;
  v$.value.$reset();
};

const getFieldError = (campo) => {
  const field = v$.value[campo];
  if (!field?.$errors?.length) return '';
  return field.$errors[0].$message;
};
</script>

<style scoped>
.cadastrar-container {
  min-height: 100vh;
  background: #1a1a1a; 
  padding: 30px;
  display: flex;
  justify-content: center;
}

.cadastrar-card {
  background: #f5f5dc; 
  width: 100%;
  max-width: 1100px;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}

.titulo-principal {
  font-size: 2.2rem;
  color: #333;
  text-align: center;
  margin-bottom: 10px;
}

.subtitulo {
  text-align: center;
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 30px;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

/* Caixa de formulário */
.form-box {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.section-title {
  font-size: 1.3rem;
  margin-bottom: 15px;
  color: #333;
  font-weight: bold;
}

/* Inputs */
.form-group {
  margin-bottom: 15px;
}

.form-group label {
  font-weight: bold;
  color: #444;
  display: block;
  margin-bottom: 5px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #fafafa;
  font-size: 1rem;
}

.is-invalid {
  border-color: #c0392b !important;
  background: #fff4f4;
}

.invalid-feedback {
  margin-top: 6px;
  font-size: 0.9rem;
  color: #c0392b;
}

.upload-area {
  border: 2px dashed #aaa;
  border-radius: 10px;
  padding: 35px;
  text-align: center;
  cursor: pointer;
  background: #f9f9f9;
  transition: 0.3s;
}

.upload-area:hover {
  border-color: #666;
  background: #f1f1f1;
}

.upload-content i {
  font-size: 48px;
  color: #777;
  margin-bottom: 10px;
}

.upload-content p {
  margin: 0;
  font-size: 1rem;
  color: #555;
}

.formatos {
  font-size: 0.85rem;
  color: #666;
}

.file-list {
  margin-top: 20px;
}

.file-list ul {
  list-style: none;
  padding: 0;
}

.file-list li {
  background: #eee;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-remove {
  padding: 5px 10px;
  background: #c0392b;
  color: white;
  border-radius: 6px;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
}

.form-actions {
  text-align: right;
  margin-top: 25px;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #666;
  color: white;
  margin-right: 10px;
}

</style>
