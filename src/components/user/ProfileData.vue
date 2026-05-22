<template>
  <div class="my-data">
    <h2>My Data</h2>
    <form @submit.prevent="salvarData" v-if="userData" class="data-form">
      <div class="form-group">
        <label for="name">Name:</label>
        <input type="text" id="name" v-model="userData.displayName" required placeholder="Digite seu name" />
      </div>
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="userData.email" disabled readonly />
        <small class="readonly-note">O email não pode ser alterado.</small>
      </div>
      <div class="form-group">
        <label for="telefone">Telefone:</label>
        <input type="tel" id="telefone" v-model="userData.phone" placeholder="Digite seu telefone" />
      </div>
      <h3>Endereço</h3>
      <div class="form-group">
        <label for="cep">CEP:</label>
          <input type="text" id="cep" v-model="userData.address.zipCode" @input="buscarCep" maxlength="8" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="rua">Rua:</label>
          <input type="text" id="rua" v-model="userData.address.street" placeholder="Name da rua" />
        </div>
        <div class="form-group">
          <label for="numero">Número:</label>
          <input type="text" id="numero" v-model="userData.address.number" placeholder="123" />
        </div>
      </div>
      <div class="form-group">
        <label for="complemento">Complemento:</label>
        <input type="text" id="complemento" v-model="userData.address.complement"
          placeholder="Apartamento, bloco, etc." />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="bairro">Bairro:</label>
          <input type="text" id="bairro" v-model="userData.address.neighborhood" placeholder="Name do bairro" />
        </div>
        <div class="form-group">
          <label for="city">Cidade:</label>
          <input type="text" id="city" v-model="userData.address.city" placeholder="Name da city" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="estado">Estado:</label>
          <select id="estado" v-model="userData.address.state">
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
          <label for="pais">País:</label>
          <input type="text" id="pais" v-model="userData.address.country" value="Brasil" readonly />
        </div>
      </div>
      <button type="submit" :disabled="loading" class="btn-salvar">
        {{ loading ? 'Salvando...' : 'Salvar Alterações' }}
      </button>
      <p v-if="error" class="error-message">{{ error }}</p>
      <p v-if="success" class="success-message">{{ success }}</p>
    </form>
    <div v-else-if="loading" class="loading">Carregando data...</div>
    <div v-else class="error">Erro ao carregar data. Tente novamente.</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, numeric, minLength, maxLength } from '@vuelidate/validators';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { buscarEnderecoViaCep } from '@/services/cepService';

const userData = ref({
  displayName: '',
  email: '',
  phone: '',
  address: {
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    country: 'Brasil' 
  }
});
const loading = ref(false);
const error = ref('');
const success = ref('');
const cepTimeout = ref(null); 

const rules = computed(() => ({
  displayName: { required, minLength: minLength(8), maxLength: maxLength(100) },
  phone: { required, numeric, minLength: minLength(10), maxLength: maxLength(15) },
  address: {
    zipCode: { required, numeric, minLength: minLength(8), maxLength: maxLength(8) },
    street: { required, minLength: minLength(3) },
    number: { required, numeric, minLength: minLength(2), maxLength: maxLength(5) },
    neighborhood: { required, minLength: minLength(2) },
    city: { required, minLength: minLength(2) },
    state: { required }
  }
}));

const v$ = useVuelidate(rules, userData);

onMounted(async () => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    error.value = 'Usuário não autenticado.';
    return;
  }

  loading.value = true;
  try {
    const data = await userService.buscarPorId(currentUser.id);

    userData.value = {
      ...userData.value, 
      ...data,
      email: data.email || currentUser.email,
      displayName: data.name || currentUser.name || '',
      phone: data.phone || currentUser.phone || '',
      address: {
        ...userData.value.address,
        ...data.address
      }
    };

  } catch (err) {
    error.value = 'Erro ao carregar data do usuário. Recarregue a página.';
    console.error("Erro ao carregar data:", err);
  } finally {
    loading.value = false;
  }
});

const buscarCep = () => {
  clearTimeout(cepTimeout.value);

  let cepLimpo = userData.value.address.zipCode.replace(/\D/g, '');
  userData.value.address.zipCode = cepLimpo;

  if (cepLimpo.length === 8) {
    cepTimeout.value = setTimeout(async () => {
      error.value = '';
      try {
        loading.value = true;
        const endereco = await buscarEnderecoViaCep(cepLimpo);

        userData.value.address.street = endereco.logradouro;
        userData.value.address.neighborhood = endereco.bairro;
        userData.value.address.city = endereco.localidade; 
        userData.value.address.state = endereco.uf;

      } catch (err) {
        userData.value.address.street = '';
        userData.value.address.neighborhood = '';
        userData.value.address.city = '';
        userData.value.address.state = '';
        error.value = 'CEP não encontrado ou inválido.';
      } finally {
        loading.value = false;
      }
    }, 500);
  }
};

const salvarData = async () => {
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

    const updatedData = {
      name: userData.value.displayName,
      phone: userData.value.phone,
      address: userData.value.address
    };

    await userService.atualizar(currentUser.id, updatedData);

    success.value = 'Data atualizados com sucesso!';

    setTimeout(() => {
      success.value = '';
    }, 3000);

  } catch (err) {
    error.value = 'Erro ao salvar data. Verifique sua conexão e tente novamente.';
    console.error("Erro ao salvar data:", err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.my-data {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.data-form {
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
}
</style>
