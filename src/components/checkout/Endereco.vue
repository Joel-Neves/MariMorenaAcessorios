<template>
  <div class="endereco">
    <h2>Selecionar Endereço de Entrega</h2>

    <div v-if="carregando" class="loading">Carregando endereços...</div>

    <template v-else>
      <!-- Lista de endereços existentes -->
      <div v-if="enderecos.length > 0" class="enderecos-lista">
        <div
          v-for="(end, index) in enderecos.slice(0, 3)"
          :key="end.id || index"
          class="endereco-card"
          :class="{ selected: enderecoSelecionado?.id === end.id }"
          @click="usarEndereco(end)"
        >
          <div class="endereco-info">
            <p class="endereco-label">{{ end.label || `Endereço ${index + 1}` }}</p>
            <p class="endereco-rua">{{ end.rua }}, {{ end.numero }}</p>
            <p class="endereco-bairro">{{ end.bairro }} - {{ end.cidade }}/{{ end.estado }}</p>
            <p class="endereco-cep">CEP: {{ end.cep }}</p>
            <p v-if="end.complemento" class="endereco-complemento">Complemento: {{ end.complemento }}</p>
          </div>
          <div class="card-overlay">
            <span class="btn-entregar">Entregar neste endereço</span>
          </div>
        </div>
      </div>

      <!-- Mensagem quando não tem endereços -->
      <div v-if="enderecos.length === 0 && !exibirFormulario" class="sem-enderecos">
        <p>Nenhum endereço cadastrado.</p>
        <p>Cadastre um endereço para continuar com a compra.</p>
        <button type="button" class="btn-novo-endereco" @click="abrirFormulario">
          + Cadastrar Novo Endereço
        </button>
      </div>

      <!-- Botão para adicionar novo endereço (se tiver menos de 3) -->
      <div v-if="enderecos.length > 0 && enderecos.length < 3 && !exibirFormulario" class="add-address-area">
        <button type="button" class="btn-novo-endereco" @click="abrirFormulario">
          + Cadastrar Novo Endereço
        </button>
      </div>

      <!-- Formulário de novo endereço -->
      <div v-if="exibirFormulario" class="novo-endereco-form">
        <h3>Cadastrar Novo Endereço</h3>

        <div class="form-group">
          <label for="temp-zipCode">CEP:</label>
          <input
            type="text"
            id="temp-zipCode"
            v-model="novoEndereco.zipCode"
            @input="buscarCepNovo"
            maxlength="8"
            placeholder="Digite o CEP"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="temp-street">Rua:</label>
            <input type="text" id="temp-street" v-model="novoEndereco.street" placeholder="Nome da rua" />
          </div>
          <div class="form-group">
            <label for="temp-number">Número:</label>
            <input type="text" id="temp-number" v-model="novoEndereco.number" placeholder="123" maxlength="5" />
          </div>
        </div>

        <div class="form-group">
          <label for="temp-complement">Complemento:</label>
          <input type="text" id="temp-complement" v-model="novoEndereco.complement"
            placeholder="Apartamento, bloco, etc." />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="temp-neighborhood">Bairro:</label>
            <input type="text" id="temp-neighborhood" v-model="novoEndereco.neighborhood" placeholder="Nome do bairro" />
          </div>
          <div class="form-group">
            <label for="temp-city">Cidade:</label>
            <input type="text" id="temp-city" v-model="novoEndereco.city" placeholder="Nome da cidade" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="temp-state">Estado:</label>
            <select id="temp-state" v-model="novoEndereco.state">
              <option value="">Selecione</option>
              <option value="AC">Acre</option>
              <option value="AL">Alagoas</option>
              <option value="AP">Amapá</option>
              <option value="AM">Amazonas</option>
              <option value="BA">Bahia</option>
              <option value="CE">Ceará</option>
              <option value="DF">Distrito Federal</option>
              <option value="ES">Espírito Santo</option>
              <option value="GO">Goiás</option>
              <option value="MA">Maranhão</option>
              <option value="MT">Mato Grosso</option>
              <option value="MS">Mato Grosso do Sul</option>
              <option value="MG">Minas Gerais</option>
              <option value="PA">Pará</option>
              <option value="PB">Paraíba</option>
              <option value="PR">Paraná</option>
              <option value="PE">Pernambuco</option>
              <option value="PI">Piauí</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="RN">Rio Grande do Norte</option>
              <option value="RS">Rio Grande do Sul</option>
              <option value="RO">Rondônia</option>
              <option value="RR">Roraima</option>
              <option value="SC">Santa Catarina</option>
              <option value="SP">São Paulo</option>
              <option value="SE">Sergipe</option>
              <option value="TO">Tocantins</option>
            </select>
          </div>
          <div class="form-group">
            <label for="temp-country">País:</label>
            <input type="text" id="temp-country" v-model="novoEndereco.country" readonly />
          </div>
        </div>

        <p v-if="erroForm" class="error-message">{{ erroForm }}</p>

        <div class="form-actions-row">
          <button type="button" class="btn-cancelar" @click="cancelarFormulario" :disabled="salvando">
            Cancelar
          </button>
          <button type="button" class="btn-salvar-endereco" @click="salvarNovoEndereco" :disabled="salvando">
            {{ salvando ? 'Salvando...' : 'Salvar e Usar este Endereço' }}
          </button>
        </div>
      </div>
    </template>

    <div class="form-actions">
      <router-link to="/sacola" class="btn-voltar">Voltar</router-link>
    </div>

    <p v-if="mensagemErro" class="error-message">{{ mensagemErro }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { authService } from '@/services/authService';
import { enderecoService } from '@/services/enderecoService';
import { buscarEnderecoViaCep } from '@/services/cepService';

const router = useRouter();
const checkoutStore = useCheckoutStore();

const enderecos = ref([]);
const enderecoSelecionado = ref(null);
const carregando = ref(true);
const mensagemErro = ref('');

// Controle do formulário
const exibirFormulario = ref(false);
const salvando = ref(false);
const erroForm = ref('');
const cepTimeout = ref(null);

const novoEndereco = ref({
  zipCode: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  country: 'Brasil',
  label: '',
});

onMounted(async () => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    carregando.value = false;
    return;
  }

  try {
    const enderecosEncontrados = await enderecoService.buscarPorUsuario(currentUser.id);
    enderecos.value = Array.isArray(enderecosEncontrados) ? enderecosEncontrados : [];

    // Se não tem endereço, já abre o formulário
    if (enderecos.value.length === 0) {
      exibirFormulario.value = true;
    }
  } catch (err) {
    console.error("Erro ao carregar endereços:", err);
    mensagemErro.value = 'Erro ao carregar endereços. Tente novamente.';
  } finally {
    carregando.value = false;
  }
});

const usarEndereco = (endereco) => {
  enderecoSelecionado.value = endereco;
  // Guarda o endereço na store no formato inglês que a Confirmacao.vue espera
  checkoutStore.setEndereco({
    id: endereco.id,
    street: endereco.rua || '',
    number: endereco.numero || '',
    complement: endereco.complemento || '',
    neighborhood: endereco.bairro || '',
    city: endereco.cidade || '',
    state: endereco.estado || '',
    zipCode: endereco.cep || '',
    country: endereco.pais || 'Brasil',
    label: endereco.label || '',
  });
  router.push('/checkout/pagamento');
};

function abrirFormulario() {
  novoEndereco.value = {
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    country: 'Brasil',
    label: '',
  };
  erroForm.value = '';
  exibirFormulario.value = true;
}

function cancelarFormulario() {
  exibirFormulario.value = false;
  erroForm.value = '';
}

async function buscarCepNovo() {
  let cepLimpo = novoEndereco.value.zipCode.replace(/\D/g, '');
  novoEndereco.value.zipCode = cepLimpo;

  if (cepLimpo.length === 8) {
    clearTimeout(cepTimeout.value);
    cepTimeout.value = setTimeout(async () => {
      erroForm.value = '';
      try {
        const endereco = await buscarEnderecoViaCep(cepLimpo);
        novoEndereco.value.street = endereco.street;
        novoEndereco.value.neighborhood = endereco.neighborhood;
        novoEndereco.value.city = endereco.city;
        novoEndereco.value.state = endereco.state;
      } catch (err) {
        erroForm.value = 'CEP não encontrado ou inválido.';
      }
    }, 500);
  }
}

async function salvarNovoEndereco() {
  const addr = novoEndereco.value;

  // Validação básica
  if (!addr.zipCode || !addr.street || !addr.number || !addr.neighborhood || !addr.city || !addr.state) {
    erroForm.value = 'Preencha todos os campos obrigatórios (CEP, Rua, Número, Bairro, Cidade e Estado).';
    return;
  }

  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    mensagemErro.value = 'Usuário não autenticado.';
    return;
  }

  salvando.value = true;
  erroForm.value = '';

  try {
    // Envia para o backend no formato inglês que ele espera
    const enderecoData = {
      zipCode: addr.zipCode,
      street: addr.street,
      number: addr.number,
      complement: addr.complement || '',
      neighborhood: addr.neighborhood,
      city: addr.city,
      state: addr.state,
      country: addr.country,
      label: addr.label || '',
      clientId: currentUser.id,
    };

    const created = await enderecoService.criar(enderecoData);

    if (created && created.id) {
      // Adiciona à lista local (já vem em português pelo mapEndereco)
      enderecos.value.push(created);

      // Usa imediatamente o endereço criado
      enderecoSelecionado.value = created;
      checkoutStore.setEndereco({
        id: created.id,
        street: created.rua || '',
        number: created.numero || '',
        complement: created.complemento || '',
        neighborhood: created.bairro || '',
        city: created.cidade || '',
        state: created.estado || '',
        zipCode: created.cep || '',
        country: created.pais || 'Brasil',
        label: created.label || '',
      });

      exibirFormulario.value = false;
      router.push('/checkout/pagamento');
    }
  } catch (err) {
    erroForm.value = err.message || 'Erro ao salvar endereço. Tente novamente.';
    console.error('Erro ao salvar novo endereço:', err);
  } finally {
    salvando.value = false;
  }
}
</script>

<style scoped>
.endereco {
  max-width: 900px;
  margin: 0 auto;
}

.endereco h2 {
  color: #1a1a1a;
  font-size: 1.8rem;
  margin-bottom: 2rem;
  text-align: center;
}

.loading,
.sem-enderecos {
  text-align: center;
  color: #666;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.sem-enderecos p {
  margin: 0.5rem 0;
}

.enderecos-lista {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.endereco-card {
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.3s;
  min-width: 0;
  cursor: pointer;
  position: relative;
}

.endereco-card:hover,
.endereco-card.selected {
  border-color: #d4af37;
  background-color: #fffef5;
}

.card-overlay {
  opacity: 0;
  transition: opacity 0.3s;
}

.endereco-card:hover .card-overlay {
  opacity: 1;
}

.btn-entregar {
  display: inline-block;
  padding: 0.6rem 1.5rem;
  background-color: #d4af37;
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
  text-align: center;
}

.btn-entregar:hover {
  background-color: #c49b2a;
}

.endereco-info p {
  margin: 0.25rem 0;
  color: #1a1a1a;
}

.endereco-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #d4af37 !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem !important;
}

.endereco-rua {
  font-size: 1.1rem;
  font-weight: 600;
}

.endereco-bairro,
.endereco-cep,
.endereco-complemento {
  color: #666 !important;
  font-size: 0.95rem;
}

/* Botão Novo Endereço */
.add-address-area {
  margin-top: 1.5rem;
  text-align: center;
}

.btn-novo-endereco {
  padding: 0.8rem 2rem;
  background-color: #fff;
  color: #d4af37;
  border: 2px dashed #d4af37;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-novo-endereco:hover {
  background-color: #fffef5;
  border-style: solid;
}

/* Formulário de novo endereço */
.novo-endereco-form {
  margin-top: 2rem;
  padding: 2rem;
  border: 2px solid #d4af37;
  border-radius: 12px;
  background-color: #fffef5;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.novo-endereco-form h3 {
  margin: 0;
  color: #1a1a1a;
  font-size: 1.3rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #1a1a1a;
}

.form-group input,
.form-group select {
  padding: 0.8rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #d4af37;
}

.form-group input:read-only {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.form-actions-row {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.btn-cancelar {
  padding: 0.8rem 2rem;
  background-color: #fff;
  color: #666;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancelar:hover:not(:disabled) {
  background-color: #f5f5f5;
  border-color: #cccccc;
}

.btn-salvar-endereco {
  padding: 0.8rem 2rem;
  background-color: #d4af37;
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-salvar-endereco:hover:not(:disabled) {
  background-color: #c49b2a;
}

.btn-cancelar:disabled,
.btn-salvar-endereco:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Actions */
.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.btn-voltar {
  padding: 0.8rem 2rem;
  background-color: transparent;
  color: #666666;
  text-decoration: none;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s;
  display: inline-block;
}

.btn-voltar:hover {
  background-color: #f5f5f5;
  border-color: #cccccc;
}

.error-message {
  color: #e74c3c;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  text-align: center;
}

@media (max-width: 1024px) {
  .enderecos-lista {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .endereco h2 {
    font-size: 1.4rem;
  }

  .enderecos-lista {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions-row {
    flex-direction: column;
  }

  .btn-cancelar,
  .btn-salvar-endereco {
    width: 100%;
    text-align: center;
  }
}
</style>