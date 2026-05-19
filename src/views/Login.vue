<template>
  <div class="login-container">
    <div class="login-form">
      <h2>Entrar</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="email" :class="{ 'error': v$.email.$error }" @blur="v$.email.$touch()"
            placeholder="Digite seu email" />
          <small v-if="v$.email.$error" class="error-text">
            <p v-for="error of v$.email.$errors" :key="error.$uid">
              {{ error.$message }}
            </p>
          </small>
        </div>
        <div class="form-group">
          <label for="password">Senha:</label>
          <input type="password" id="password" v-model="password" :class="{ 'error': v$.password.$error }"
            @blur="v$.password.$touch()" placeholder="Digite sua senha" />
          <small v-if="v$.password.$error" class="error-text">
            <p v-for="error of v$.password.$errors" :key="error.$uid">
              {{ error.$message }}
            </p>
          </small>
        </div>
        <button type="submit" :disabled="loading" class="btn-login">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
      <div class="links">
        <router-link to="/register">Não tem conta? Cadastre-se</router-link>
        <router-link to="/reset-password">Esqueceu a senha?</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services/authService';
import { useVuelidate } from '@vuelidate/core';
import { required, email as emailValidator, minLength, helpers } from '@vuelidate/validators';

const router = useRouter();
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const rules = {
  email: { required, email: emailValidator },
  password: {
    required,
    minLength: minLength(8),
    hasUpper: helpers.regex(/(?=.*[A-Z])/),
    hasNumber: helpers.regex(/(?=.*[0-9])/)
  }
};

const v$ = useVuelidate(rules, { email, password });

const handleLogin = async () => {
  v$.value.$touch();
  if (v$.value.$invalid) return;

  loading.value = true;
  error.value = '';
  try {
    const user = await authService.login(email.value, password.value);

    if (!user?.email) {
      throw new Error('Dados do usuário inválidos');
    }

    if (user.userRole === 'ADMIN') {
      router.push('/admin/dashboard');
    } else {
      router.push('/');
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 2rem;
}

.login-form {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-form h2 {
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

.form-group input.error {
  border-color: #d9534f;
}

.error-text {
  color: #d9534f;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.btn-login {
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

.btn-login:hover:not(:disabled) {
  background-color: #b8941f;
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #d9534f;
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.links {
  text-align: center;
  margin-top: 1.5rem;
}

.links a {
  display: block;
  color: #007bff;
  text-decoration: none;
  margin-bottom: 0.5rem;
}

.links a:hover {
  text-decoration: underline;
}
</style>
