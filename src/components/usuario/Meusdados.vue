<template>
  <div class="meus-dados">
    <h2>Meus Dados</h2>
    <form @submit.prevent="salvarDados" v-if="userData" class="dados-form">
      <div class="form-group">
        <label for="nome">Nome:</label>
        <input type="text" id="nome" v-model="userData.nome" required placeholder="Digite seu nome" />
      </div>
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="userData.email" disabled readonly />
        <small class="readonly-note">O email não pode ser alterado.</small>
      </div>
      <div class="form-group">
        <label for="telefone">Telefone:</label>
        <input type="tel" id="telefone" v-model="userData.telefone" placeholder="Digite seu telefone" />
      </div>
      <h3>Endereço</h3>
      <div class="form-group">
        <label for="cep">CEP:</label>
          <input type="text" id="cep" v-model="userData.endereco.cep" @input="buscarCep" maxlength="8" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="rua">Rua:</label>
          <input type="text" id="rua" v-model="userData.endereco.rua" placeholder="Nome da rua" />
        </div>
        <div class="form-group">
          <label for="numero">Número:</label>
          <input type="text" id="numero" v-model="userData.endereco.numero" placeholder="123" />
        </div>
      </div>
      <div class="form-group">
        <label for="complemento">Complemento:</label>
        <input type="text" id="complemento" v-model="userData.endereco.complemento"
          placeholder="Apartamento, bloco, etc." />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="bairro">Bairro:</label>
          <input type="text" id="bairro" v-model="userData.endereco.bairro" placeholder="Nome do bairro" />
        </div>
        <div class="form-group">
          <label for="cidade">Cidade:</label>
          <input type="text" id="cidade" v-model="userData.endereco.cidade" placeholder="Nome da cidade" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="estado">Estado:</label>
          <select id="estado" v-model="userData.endereco.estado">
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
          <input type="text" id="pais" v-model="userData.endereco.pais" value="Brasil" readonly />
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
import { ref, onMounted, computed } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, numeric, minLength, maxLength } from '@vuelidate/validators';
import { authService } from '@/services/authService';
import { usuarioService } from '@/services/usuarioService';
import { buscarEnderecoViaCep } from '@/services/cepService';

const userData = ref({
  nome: '',
  email: '',
  telefone: '',
  endereco: {
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    pais: 'Brasil' 
  }
});
const loading = ref(false);
const error = ref('');
const success = ref('');
const cepTimeout = ref(null); 

const rules = computed(() => ({
  nome: { required, minLength: minLength(8), maxLength: maxLength(100) },
  telefone: { required, numeric, minLength: minLength(10), maxLength: maxLength(15) },
  endereco: {
    cep: { required, numeric, minLength: minLength(8), maxLength: maxLength(8) },
    rua: { required, minLength: minLength(3) },
    numero: { required, numeric, minLength: minLength(2), maxLength: maxLength(5) },
    bairro: { required, minLength: minLength(2) },
    cidade: { required, minLength: minLength(2) },
    estado: { required }
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
    const data = await usuarioService.buscarPorId(currentUser.id);

    userData.value = {
      ...userData.value, 
      ...data,
      email: data.email || currentUser.email,
      nome: data.nome || currentUser.displayName || '',
      endereco: {
        ...userData.value.endereco,
        ...data.endereco
      }
    };

  } catch (err) {
    error.value = 'Erro ao carregar dados do usuário. Recarregue a página.';
    console.error("Erro ao carregar dados:", err);
  } finally {
    loading.value = false;
  }
});

const buscarCep = () => {
  clearTimeout(cepTimeout.value);

  let cepLimpo = userData.value.endereco.cep.replace(/\D/g, '');
  userData.value.endereco.cep = cepLimpo;

  if (cepLimpo.length === 8) {
    cepTimeout.value = setTimeout(async () => {
      error.value = '';
      try {
        loading.value = true;
        const endereco = await buscarEnderecoViaCep(cepLimpo);

        userData.value.endereco.rua = endereco.logradouro;
        userData.value.endereco.bairro = endereco.bairro;
        userData.value.endereco.cidade = endereco.localidade; 
        userData.value.endereco.estado = endereco.uf;

      } catch (err) {
        userData.value.endereco.rua = '';
        userData.value.endereco.bairro = '';
        userData.value.endereco.cidade = '';
        userData.value.endereco.estado = '';
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
    if (currentUser.displayName !== userData.value.nome) {
      await authService.updateProfile({ displayName: userData.value.nome });
    }

    const updatedData = {
      nome: userData.value.nome,
      telefone: userData.value.telefone,
      endereco: userData.value.endereco
    };

    await usuarioService.atualizar(currentUser.id, updatedData);

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
