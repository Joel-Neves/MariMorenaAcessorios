<template>
  <div class="meus-dados">
    <h2>Meus Dados</h2>
    <form @submit.prevent="salvarDados" v-if="formData" class="dados-form">
      <div class="form-group">
        <label for="nome">Nome:</label>
        <input type="text" id="nome" v-model="formData.name" required placeholder="Digite seu nome" maxlength="50" />
      </div>
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="formData.email" disabled readonly />
        <small class="readonly-note">O email não pode ser alterado.</small>
      </div>
      <div class="form-group">
        <label for="phone">Telefone:</label>
        <input type="tel" id="phone" v-model="formData.phone" placeholder="Digite seu phone" maxlength="14" />
      </div>

      <h3>Endereços (máx. 3)</h3>

      <!-- Abas de endereços -->
      <div class="address-tabs">
        <button
          v-for="(addr, index) in enderecos"
          :key="index"
          type="button"
          class="tab-btn"
          :class="{ active: activeAddressIndex === index }"
          @click="activeAddressIndex = index"
        >
          {{ getEnderecoLabel(index) }}
          <span
            v-if="enderecos.length > 1"
            class="remove-tab"
            title="Remover endereço"
            @click.stop="removerEndereco(index)"
          >&times;</span>
        </button>
        <button
          v-if="enderecos.length < 3"
          type="button"
          class="tab-btn add-tab-btn"
          @click="adicionarEndereco"
        >
          + Novo Endereço
        </button>
      </div>

      <!-- Formulário do endereço ativo -->
      <div class="address-form" v-if="activeAddress">
        <div class="form-group">
          <label :for="'zipCode-' + activeAddressIndex">CEP:</label>
          <input
            type="text"
            :id="'zipCode-' + activeAddressIndex"
            v-model="activeAddress.zipCode"
            @input="buscarCep(activeAddressIndex)"
            maxlength="8"
          />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label :for="'street-' + activeAddressIndex">Rua:</label>
            <input type="text" :id="'street-' + activeAddressIndex" v-model="activeAddress.street" placeholder="Nome da rua" />
          </div>
          <div class="form-group">
            <label :for="'number-' + activeAddressIndex">Número:</label>
            <input type="text" :id="'number-' + activeAddressIndex" v-model="activeAddress.number" placeholder="123" maxlength="5" />
          </div>
        </div>
        <div class="form-group">
          <label :for="'complement-' + activeAddressIndex">Complemento:</label>
          <input type="text" :id="'complement-' + activeAddressIndex" v-model="activeAddress.complement"
            placeholder="Apartamento, bloco, etc." />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label :for="'neighborhood-' + activeAddressIndex">Bairro:</label>
            <input type="text" :id="'neighborhood-' + activeAddressIndex" v-model="activeAddress.neighborhood" placeholder="Nome do bairro" />
          </div>
          <div class="form-group">
            <label :for="'city-' + activeAddressIndex">Cidade:</label>
            <input type="text" :id="'city-' + activeAddressIndex" v-model="activeAddress.city" placeholder="Nome da cidade" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label :for="'state-' + activeAddressIndex">Estado:</label>
            <select :id="'state-' + activeAddressIndex" v-model="activeAddress.state">
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
            <label :for="'country-' + activeAddressIndex">País:</label>
            <input type="text" :id="'country-' + activeAddressIndex" v-model="activeAddress.country" value="Brasil" readonly />
          </div>
        </div>
      </div>

      <button type="submit" :disabled="loading" class="btn-salvar">
        {{ loading ? 'Salvando...' : 'Salvar Alterações' }}
      </button>
      <p v-if="error" class="error-message">{{ error }}</p>
      <p v-if="success" class="success-message">{{ success }}</p>
    </form>
    <div v-else-if="loading" class="loading">Carregando dados...</div>
    <div v-else class="error">Erro ao carregar dados. Tente novamente.</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, numeric, minLength, maxLength } from '@vuelidate/validators';
import { authService } from '@/services/authService';
import { usuarioService } from '@/services/usuarioService';
import { enderecoService } from '@/services/enderecoService';
import { buscarEnderecoViaCep } from '@/services/cepService';

const formData = reactive({
  name: '',
  email: '',
  phone: '',
});
const enderecos = reactive([]);
const activeAddressIndex = ref(0);
const loading = ref(false);
const error = ref('');
const success = ref('');
const cepTimeout = ref({});

const rules = computed(() => ({
  name: { required, minLength: minLength(8), maxLength: maxLength(100) },
  phone: { required, numeric, minLength: minLength(10), maxLength: maxLength(15) },
}));

const v$ = useVuelidate(rules, formData);

/**
 * Retorna o endereço ativo com base no índice selecionado.
 */
const activeAddress = computed(() => {
  if (enderecos.length === 0) return null;
  return enderecos[activeAddressIndex.value] || enderecos[0];
});

/**
 * Gera um label para a aba do endereço.
 */
function getEnderecoLabel(index) {
  const addr = enderecos[index];
  if (!addr) return `Endereço ${index + 1}`;
  const label = addr.label || `Endereço ${index + 1}`;
  return label;
}

/**
 * Cria um objeto de endereço vazio.
 */
function criarEnderecoVazio() {
  return {
    id: null,
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
}

/**
 * Adiciona um novo endereço à lista (máx. 3).
 */
function adicionarEndereco() {
  if (enderecos.length >= 3) return;
  enderecos.push(criarEnderecoVazio());
  activeAddressIndex.value = enderecos.length - 1;
}

/**
 * Remove um endereço da lista.
 */
function removerEndereco(index) {
  if (enderecos.length <= 1) return;
  enderecos.splice(index, 1);
  if (activeAddressIndex.value >= enderecos.length) {
    activeAddressIndex.value = enderecos.length - 1;
  }
}

onMounted(async () => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    error.value = 'Usuário não autenticado.';
    return;
  }

  loading.value = true;
  try {
    const data = await usuarioService.buscarPorId(currentUser.id);

    formData.name = data.name || currentUser.name || '';
    formData.email = data.email || currentUser.email;
    formData.phone = data.phone || currentUser.phone || '';
  } catch (err) {
    error.value = 'Erro ao carregar dados do usuário. Recarregue a página.';
    console.error("Erro ao carregar dados:", err);
  }

  try {
    const enderecosData = await enderecoService.buscarPorUsuario(currentUser.id);
    // enderecosData já é um array graças à modificação no service
    if (enderecosData && enderecosData.length > 0) {
      enderecosData.forEach((addr) => {
        enderecos.push({
          id: addr.id || null,
          zipCode: addr.zipCode || '',
          street: addr.street || '',
          number: addr.number || '',
          complement: addr.complement || '',
          neighborhood: addr.neighborhood || '',
          city: addr.city || '',
          state: addr.state || '',
          country: addr.country || 'Brasil',
          label: addr.label || '',
        });
      });
    } else {
      // Se não tem endereço, cria um vazio
      enderecos.push(criarEnderecoVazio());
    }
  } catch (err) {
    error.value = 'Erro ao carregar dados do usuário. Recarregue a página.';
    console.error("Erro ao carregar dados:", err);
  } finally {
    loading.value = false;
  }
});

const buscarCep = (index) => {
  const addr = enderecos[index];
  if (!addr) return;

  clearTimeout(cepTimeout.value[index]);

  let cepLimpo = addr.zipCode.replace(/\D/g, '');
  addr.zipCode = cepLimpo;

  if (cepLimpo.length === 8) {
    cepTimeout.value[index] = setTimeout(async () => {
      error.value = '';
      try {
        loading.value = true;
        const endereco = await buscarEnderecoViaCep(cepLimpo);

        addr.street = endereco.street;
        addr.neighborhood = endereco.neighborhood;
        addr.city = endereco.city;
        addr.state = endereco.state;

      } catch (err) {
        addr.street = '';
        addr.neighborhood = '';
        addr.city = '';
        addr.state = '';
        error.value = 'CEP não encontrado ou inválido.';
      } finally {
        loading.value = false;
      }
    }, 500);
  }
};

const salvarDados = async () => {
  const isFormValid = await v$.value.$validate();
  if (!isFormValid) {
    error.value = 'Por favor, corrija os erros no formulário.';
    return;
  }

  const currentUser = authService.getCurrentUser();
  if (!currentUser) return;

  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    // Atualiza dados do usuário
    const updatedData = {
      name: formData.name,
      phone: formData.phone,
    };
    await usuarioService.atualizar(currentUser.id, updatedData);

    // Obtém endereços existentes no backend para sincronizar
    const enderecosExistentes = await enderecoService.buscarPorUsuario(currentUser.id);
    const idsExistentes = enderecosExistentes.map((e) => e.id).filter(Boolean);

    // IDs que serão mantidos após o salvamento
    const idsManter = [];

    for (const addr of enderecos) {
      const enderecoData = {
        zipCode: addr.zipCode,
        street: addr.street,
        number: addr.number,
        complement: addr.complement,
        neighborhood: addr.neighborhood,
        city: addr.city,
        state: addr.state,
        country: addr.country,
        label: addr.label,
        clientId: currentUser.id,
      };

      if (addr.id) {
        // Atualiza endereço existente
        await enderecoService.atualizar(addr.id, enderecoData);
        idsManter.push(addr.id);
      } else {
        // Cria novo endereço
        const created = await enderecoService.criar(enderecoData);
        if (created && created.id) {
          addr.id = created.id;
          idsManter.push(created.id);
        }
      }
    }

    // Remove endereços que foram deletados da lista (não estão mais sendo mantidos)
    for (const existingId of idsExistentes) {
      if (!idsManter.includes(existingId)) {
        try {
          await enderecoService.deletar(existingId);
        } catch (deleteErr) {
          console.error('Erro ao deletar endereço removido:', deleteErr);
        }
      }
    }

    success.value = 'Dados atualizados com sucesso!';
    setTimeout(() => {
      success.value = '';
    }, 3000);
  } catch (err) {
    error.value = 'Erro ao salvar dados. Verifique sua conexão e tente novamente.';
    console.error("Erro ao salvar dados:", err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.meus-dados {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.dados-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.readonly-note {
  font-size: 0.8rem;
  color: #666;
}

/* Abas de endereço */
.address-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.tab-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.tab-btn:hover {
  border-color: #d4af37;
}

.tab-btn.active {
  background-color: #d4af37;
  color: #1a1a1a;
  border-color: #d4af37;
  font-weight: 600;
}

.add-tab-btn {
  border-style: dashed;
  color: #888;
}

.add-tab-btn:hover {
  color: #1a1a1a;
  border-color: #d4af37;
}

.remove-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(0,0,0,0.1);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s;
}

.remove-tab:hover {
  background: #d9534f;
  color: #fff;
}

.address-form {
  padding: 1.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.btn-salvar {
  padding: 0.8rem 2rem;
  background-color: #d4af37;
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  align-self: flex-start;
}

.btn-salvar:hover:not(:disabled) {
  background-color: #c49b2a;
}

.btn-salvar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #d9534f;
  font-size: 0.9rem;
}

.success-message {
  color: #5cb85c;
  font-size: 0.9rem;
}

.loading {
  text-align: center;
  font-size: 1.2rem;
  color: #666;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .address-tabs {
    flex-direction: column;
  }
}
</style>