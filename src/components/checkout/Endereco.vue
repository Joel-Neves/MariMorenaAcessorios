<template>
  <div class="endereco">
    <h2>Selecionar Endereço de Entrega</h2>

    <div v-if="carregando" class="loading">Carregando endereços...</div>

    <div v-else-if="enderecos.length === 0" class="sem-enderecos">
      <p>Nenhum endereço cadastrado.</p>
      <p>Cadastre um endereço em <router-link to="/perfil">Meus Dados</router-link> antes de finalizar a compra.</p>
    </div>

    <div v-else class="enderecos-lista">
      <div
        v-for="(end, index) in enderecos.slice(0, 3)"
        :key="end.id || index"
        class="endereco-card"
      >
        <div class="endereco-info">
          <p class="endereco-rua">{{ end.rua }}, {{ end.numero }}</p>
          <p class="endereco-bairro">{{ end.bairro }} - {{ end.cidade }}/{{ end.estado }}</p>
          <p class="endereco-cep">CEP: {{ end.cep }}</p>
          <p v-if="end.complemento" class="endereco-complemento">Complemento: {{ end.complemento }}</p>
        </div>
        <button type="button" class="btn-selecionar" @click="usarEndereco(end)">
          Entregar neste endereço
        </button>
      </div>
    </div>

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

const router = useRouter();
const checkoutStore = useCheckoutStore();

const enderecos = ref([]);
const carregando = ref(true);
const mensagemErro = ref('');

onMounted(async () => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    carregando.value = false;
    return;
  }

  try {
    const enderecosEncontrados = await enderecoService.buscarPorUsuario(currentUser.id);
    enderecos.value = Array.isArray(enderecosEncontrados) ? enderecosEncontrados : [];
  } catch (err) {
    console.error("Erro ao carregar endereços:", err);
    mensagemErro.value = 'Erro ao carregar endereços. Tente novamente.';
  } finally {
    carregando.value = false;
  }
});

const usarEndereco = (endereco) => {
  checkoutStore.setEndereco({ ...endereco });
  router.push('/checkout/pagamento');
};
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

.sem-enderecos a {
  color: #d4af37;
  font-weight: 600;
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
  transition: border-color 0.3s;
  min-width: 0;
}

.endereco-card:hover {
  border-color: #d4af37;
}

.endereco-info p {
  margin: 0.25rem 0;
  color: #1a1a1a;
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

.btn-selecionar {
  padding: 0.8rem 2rem;
  background-color: #d4af37;
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
}

.btn-selecionar:hover {
  background-color: #c49b2a;
}

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
}
</style>