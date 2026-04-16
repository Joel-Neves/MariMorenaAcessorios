<template>
  <div class="endereco">
    <h2>Selecionar Endereço de Entrega</h2>

    <div v-if="enderecoSalvo && !mostrarFormulario" class="endereco-salvo">
      <h3>Endereço cadastrado</h3>
      <p>{{ enderecoSalvo.rua }}, {{ enderecoSalvo.numero }}</p>
      <p>{{ enderecoSalvo.bairro }} - {{ enderecoSalvo.cidade }}/{{ enderecoSalvo.estado }}</p>
      <p>CEP: {{ enderecoSalvo.cep }}</p>
      <p v-if="enderecoSalvo.complemento">Complemento: {{ enderecoSalvo.complemento }}</p>

      <div class="form-actions">
        <router-link to="/sacola" class="btn-voltar">Voltar para Sacola</router-link>
        <button type="button" class="btn-secundario" @click="mostrarFormulario = true">Informar outro endereço</button>
        <button type="button" class="btn-proximo" @click="usarEnderecoSalvo">Usar este endereço</button>
      </div>
    </div>

    <form v-else @submit.prevent="salvarEndereco" class="endereco-form">
      <div class="form-group">
        <label for="cep">CEP:</label>
        <input type="text" id="cep" v-model="endereco.cep" @input="buscarCep" maxlength="8" :class="{ 'is-invalid': v$.endereco.cep.$error }" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="rua">Rua:</label>
          <input type="text" id="rua" v-model="endereco.rua" placeholder="Nome da rua" :class="{ 'is-invalid': v$.endereco.rua.$error }" />
        </div>
        <div class="form-group">
          <label for="numero">Número:</label>
          <input type="text" id="numero" v-model="endereco.numero" placeholder="123" :class="{ 'is-invalid': v$.endereco.numero.$error }" />
        </div>
      </div>
      <div class="form-group">
        <label for="complemento">Complemento:</label>
        <input type="text" id="complemento" v-model="endereco.complemento"
          placeholder="Apartamento, bloco, etc." />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="bairro">Bairro:</label>
          <input type="text" id="bairro" v-model="endereco.bairro" placeholder="Nome do bairro" :class="{ 'is-invalid': v$.endereco.bairro.$error }" />
        </div>
        <div class="form-group">
          <label for="cidade">Cidade:</label>
          <input type="text" id="cidade" v-model="endereco.cidade" placeholder="Nome da cidade" :class="{ 'is-invalid': v$.endereco.cidade.$error }" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="estado">Estado:</label>
          <select id="estado" v-model="endereco.estado" :class="{ 'is-invalid': v$.endereco.estado.$error }">
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
          <input type="text" id="pais" v-model="endereco.pais" value="Brasil" readonly />
        </div>
      </div>

      <div class="form-actions">
        <router-link to="/sacola" class="btn-voltar">Voltar para Sacola</router-link>
        <button v-if="enderecoSalvo" type="button" class="btn-secundario" @click="mostrarFormulario = false">Usar endereço salvo</button>
        <button type="submit" class="btn-proximo">Próximo</button>
      </div>

      <p v-if="mensagemErro" class="error-message">{{ mensagemErro }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { authService } from '@/services/authService';
import { usuarioService } from '@/services/usuarioService';
import { useVuelidate } from '@vuelidate/core';
import { required, numeric, minLength, maxLength } from '@vuelidate/validators';


const router = useRouter();
const checkoutStore = useCheckoutStore();

const endereco = ref({
  cep: '',
  rua: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  pais: 'Brasil'
});
const enderecoSalvo = ref(null);
const mostrarFormulario = ref(true);
const mensagemErro = ref('');

const rules = computed(() => ({
  endereco: {
    cep: { required, numeric, minLength: minLength(8), maxLength: maxLength(8) },
    rua: { required, minLength: minLength(3) },
    numero: { required, numeric, minLength: minLength(1), maxLength: maxLength(5) },
    bairro: { required, minLength: minLength(2) },
    cidade: { required, minLength: minLength(2) },
    estado: { required }
  }
}));

const v$ = useVuelidate(rules, { endereco });

onMounted(async () => {
  if (checkoutStore.endereco) {
    endereco.value = { ...endereco.value, ...checkoutStore.endereco };
  }

  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    return;
  }

  try {
    const data = await usuarioService.buscarPorId(currentUser.uid);
    const possuiEnderecoSalvo = data.endereco &&
      ['cep', 'rua', 'numero', 'bairro', 'cidade', 'estado'].every((campo) => !!data.endereco[campo]);

    if (possuiEnderecoSalvo) {
      enderecoSalvo.value = { ...data.endereco };
      endereco.value = { ...endereco.value, ...data.endereco };
      mostrarFormulario.value = false;
    }
  } catch (err) {
    console.error("Erro ao carregar dados do usuário:", err);
  }
});




const buscarCep = async () => {
  const cepLimpo = endereco.value.cep.replace(/\D/g, '');
  endereco.value.cep = cepLimpo;

  if (cepLimpo.length === 8) {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (!data.erro) {
        endereco.value.rua = data.logradouro;
        endereco.value.bairro = data.bairro;
        endereco.value.cidade = data.localidade;
        endereco.value.estado = data.uf;
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  }
};

const usarEnderecoSalvo = () => {
  if (!enderecoSalvo.value) {
    mostrarFormulario.value = true;
    return;
  }

  checkoutStore.setEndereco({ ...enderecoSalvo.value });
  router.push('/checkout/pagamento');
};

const salvarEndereco = async () => {
  mensagemErro.value = '';
  const valido = await v$.value.$validate();

  if (!valido) {
    mensagemErro.value = 'Preencha os campos obrigatórios do endereço para continuar.';
    return;
  }

  checkoutStore.setEndereco({ ...endereco.value });

  const currentUser = authService.getCurrentUser();
  if (currentUser) {
    try {
      await usuarioService.atualizar(currentUser.uid, { endereco: { ...endereco.value } });
      enderecoSalvo.value = { ...endereco.value };
    } catch (err) {
      console.error('Erro ao salvar endereço do usuário:', err);
    }
  }

  router.push('/checkout/pagamento');
};
</script>

<style scoped>
.endereco {
  max-width: 600px;
  margin: 0 auto;
}

.endereco h2 {
  color: #1a1a1a;
  font-size: 1.8rem;
  margin-bottom: 2rem;
  text-align: center;
}

.endereco-salvo {
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border: 1px solid #e0e0e0;
}

.endereco-salvo h3 {
  color: #1a1a1a;
  font-size: 1.4rem;
  margin-bottom: 1rem;
}

.endereco-salvo p {
  margin: 0.5rem 0;
  color: #666666;
}
.is-invalid {
  border-color: #e74c3c;
}

.btn-usar {
  margin-top: 1rem;
  padding: 0.8rem 2rem;
  background-color: #d4af37;
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-usar:hover {
  background-color: #c49b2a;
}

.endereco-form {
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

.form-actions {
  display: flex;
  justify-content: space-between;
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
}

.btn-voltar:hover {
  background-color: #f5f5f5;
  border-color: #cccccc;
}

.btn-secundario {
  padding: 0.8rem 1rem;
  background-color: #f5f5f5;
  color: #1a1a1a;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-secundario:hover {
  background-color: #eaeaea;
}

.btn-proximo {
  padding: 0.8rem 2rem;
  background-color: #d4af37;
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-proximo:hover {
  background-color: #c49b2a;
}

.error-message {
  color: #e74c3c;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
