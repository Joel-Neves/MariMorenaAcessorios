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
      <h3>Endereço</h3>
      <div class="form-group">
        <label for="zipCode">CEP:</label>
          <input type="text" id="zipCode" v-model="formData.address.zipCode" @input="buscarCep" maxlength="8" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="street">Rua:</label>
          <input type="text" id="street" v-model="formData.address.street" placeholder="Nome da rua" />
        </div>
        <div class="form-group">
          <label for="number">Número:</label>
          <input type="text" id="number" v-model="formData.address.number" placeholder="123" maxlength="5" />
        </div>
      </div>
      <div class="form-group">
        <label for="complement">Complemento:</label>
        <input type="text" id="complement" v-model="formData.address.complement"
          placeholder="Apartamento, bloco, etc." />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="neighborhood">Bairro:</label>
          <input type="text" id="neighborhood" v-model="formData.address.neighborhood" placeholder="Nome do bairro" />
        </div>
        <div class="form-group">
          <label for="city">Cidade:</label>
          <input type="text" id="city" v-model="formData.address.city" placeholder="Nome da cidade" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="state">Estado:</label>
          <select id="state" v-model="formData.address.state">
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
          <label for="country">País:</label>
          <input type="text" id="country" v-model="formData.address.country" value="Brasil" readonly />
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
  name: { required, minLength: minLength(8), maxLength: maxLength(100) },
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

const v$ = useVuelidate(rules, formData);

onMounted(async () => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    error.value = 'Usuário não autenticado.';
    return;
  }

  loading.value = true;
  try{
    const data = await usuarioService.buscarPorId(currentUser.id);

    formData.name = data.name || currentUser.name || '';
    formData.email = data.email || currentUser.email;
    formData.phone = data.phone || currentUser.phone || '';
  } catch (err) {
    error.value = 'Erro ao carregar dados do usuário. Recarregue a página.';
    console.error("Erro ao carregar dados:", err);
  } finally {
    loading.value = false;
  }

  try {
    const endereco = await enderecoService.buscarPorUsuario(currentUser.id);

   
    formData.address.zipCode = endereco?.zipCode || '';
    formData.address.street = endereco?.street || '';
    formData.address.number = endereco?.number || '';
    formData.address.complement = endereco?.complement || '';
    formData.address.neighborhood = endereco?.neighborhood || '';
    formData.address.city = endereco?.city || '';
    formData.address.state = endereco?.state || '';


  } catch (err) {
    error.value = 'Erro ao carregar dados do usuário. Recarregue a página.';
    console.error("Erro ao carregar dados:", err);
  } finally {
    loading.value = false;
  }
});

const buscarCep = () => {
  clearTimeout(cepTimeout.value);

  let cepLimpo = formData.address.zipCode.replace(/\D/g, '');
  formData.address.zipCode = cepLimpo;

  if (cepLimpo.length === 8) {
    cepTimeout.value = setTimeout(async () => {
      error.value = '';
      try {
        loading.value = true;
        const endereco = await buscarEnderecoViaCep(cepLimpo);

        formData.address.street = endereco.street;
        formData.address.neighborhood = endereco.neighborhood;
        formData.address.city = endereco.city;
        formData.address.state = endereco.state;

      } catch (err) {
        formData.address.street = '';
        formData.address.neighborhood = '';
        formData.address.city = '';
        formData.address.state = '';
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

  let enderecoExistente = null;
  try {
    enderecoExistente = await enderecoService.buscarPorUsuario(currentUser.id);
  } catch (err) {
    if (err.response && err.response.status !== 404) {
      error.value = 'Erro ao verificar endereço existente. Tente novamente.';
      console.error("Erro ao verificar endereço:", err);
      loading.value = false;
      return;
    }
  }

  try {

    const updatedData = {
      name: formData.name,
      phone: formData.phone,
    };
    await usuarioService.atualizar(currentUser.id, updatedData);

    
    const enderecoData = {
      zipCode: formData.address.zipCode,
      street: formData.address.street,
      number: formData.address.number,
      complement: formData.address.complement,
      neighborhood: formData.address.neighborhood,
      city: formData.address.city,
      state: formData.address.state,
      country: formData.address.country,
      clientId: currentUser.id
    };
    
    if (enderecoExistente){
      await enderecoService.atualizar(enderecoExistente.id, enderecoData);
    } else {
      await enderecoService.criar(enderecoData);
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
