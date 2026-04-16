<template>
  <div class="register-container">
    <div class="register-form">
      <h2>Cadastrar-se</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="displayName">Nome:</label>
          <input type="text" id="displayName" v-model="displayName" :class="{ 'is-invalid': v$.displayName.$error }"
            @blur="v$.displayName.$touch()"
            placeholder="Digite seu nome" />
          <div v-if="v$.displayName.$error" class="error-message">
            <div v-for="error in v$.displayName.$errors" :key="error.$uid">{{ error.$message }}</div>
          </div>
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="email" :class="{ 'is-invalid': v$.email.$error }"
          @blur="v$.email.$touch()"  
          placeholder="Digite seu email" />
          <div v-if="v$.email.$error" class="error-message">
            <div v-for="error in v$.email.$errors" :key="error.$uid">{{ error.$message }}</div>
          </div>
        </div>
        <div class="form-group">
          <label for="password">Senha:</label>
          <input type="password" id="password" v-model="password" :class="{ 'is-invalid': v$.password.$error }"
          @blur="v$.password.$touch()"  
          placeholder="Digite sua senha (mín. 6 caracteres)" />
          <div v-if="v$.password.$error" class="error-message">
            <div v-for="error in v$.password.$errors" :key="error.$uid">{{ error.$message }}</div>
          </div>
        </div>
        <div class="form-group">
          <label for="telefone">Telefone:</label>
          <input type="tel" id="telefone" v-model="telefone" :class="{ 'is-invalid': v$.telefone.$error }"
          @blur="v$.telefone.$touch()"  
          placeholder="Digite seu telefone" />
          <div v-if="v$.telefone.$error" class="error-message">
            <div v-for="error in v$.telefone.$errors" :key="error.$uid">{{ error.$message }}</div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="photoUrl">Escolha uma photoUrl:</label>
            <input type="file" id="photoUrl" @change="handlephotoUrlUpload" accept="image/*" />
          </div>
        </div>
        <button type="submit" :disabled="loading" class="btn-register">
          {{ loading ? 'Cadastrando...' : 'Cadastrar' }}
        </button>
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
      <div class="links">
        <router-link to="/login">Já tem conta? Faça login</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { required, email as emailValidator, minLength, numeric, maxLength } from '@vuelidate/validators';
import { authService } from '@/services/authService';

const router = useRouter();
const displayName = ref('');
const email = ref('');
const password = ref('');
const telefone = ref('');
const loading = ref(false);
const error = ref('');

const rules = {
  displayName: { required },
  email: { required, email: emailValidator },
  password: { required, minLength: minLength(6) },
  telefone: { required, numeric, minLength: minLength(10), maxLength: maxLength(15) }
};
const arquivo = ref([]);

const handlephotoUrlUpload = (event) => {
  const file = event.target.files[0];
  arquivo.value = file ? [file] : [];
};

const v$ = useVuelidate(rules, { displayName, email, password, telefone });

const handleRegister = async () => {
  const isFormCorrect = await v$.value.$validate();
  if (!isFormCorrect) return;

  loading.value = true;
  error.value = '';

  try {
    const arquivoFoto = arquivo.value[0] || null;

    const userData = {
      nome: displayName.value,
      email: email.value,
      telefone: telefone.value
    };

    await authService.registrar(email.value, password.value, displayName.value, arquivoFoto, userData);

    router.push('/');
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 2rem;
}

.register-form {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
}

.register-form h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #1a1a1a;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #d4af37;
}

.btn-register {
  width: 100%;
  padding: 0.75rem;
  background-color: #d4af37;
  color: #1a1a1a;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-register:hover:not(:disabled) {
  background-color: #b8941f;
}

.btn-register:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #d9534f;
  text-align: left;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.is-invalid {
  border-color: #d9534f;
}

.links {
  text-align: center;
  margin-top: 1.5rem;
}

.links a {
  color: #007bff;
  text-decoration: none;
}

.links a:hover {
  text-decoration: underline;
}

</style>
