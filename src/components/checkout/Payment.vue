<template>
  <div class="pagamento">
    <h2>Selecionar Forma de Pagamento</h2>

    <div class="manual-payment-notice">
      <i class="fas fa-info-circle"></i>
      <p><strong>Atenção:</strong> Todos os pagamentos serão processados manualmente após a confirmação do order. Você receberá as instruções de pagamento por e-mail.</p>
    </div>

    <form @submit.prevent="salvarPagamento" class="pagamento-form">
      <div class="metodo-pagamento">
        <h3>Método de Pagamento Preferido</h3>

        <div class="opcoes-pagamento">
          <label class="opcao-pagamento">
            <input
              type="radio"
              value="pix"
              v-model="pagamento.metodo"
              required
            />
            <div class="opcao-content">
              <i class="fas fa-qrcode"></i>
              <span>PIX</span>
            </div>
          </label>

          <label class="opcao-pagamento">
            <input
              type="radio"
              value="boleto"
              v-model="pagamento.metodo"
            />
            <div class="opcao-content">
              <i class="fas fa-barcode"></i>
              <span>Boleto Bancário</span>
            </div>
          </label>
          <label class="opcao-pagamento">
            <input
              type="radio"
              value="cartao"
              v-model="pagamento.metodo"
            />
            <div class="opcao-content">
              <i class="fas fa-barcode"></i>
              <span>Cartão</span>
            </div>
            <p style="font-size: 10px"> Sujeito ao pequeno acréscimo</p>
          </label>
        </div>
      </div>

      <div v-if="pagamento.metodo === 'pix'" class="data-pix">
        <h3>Pagamento via PIX</h3>
        <p>O pagamento será processado manualmente após a confirmação do order. Você receberá as instruções por e-mail ou Whatsapp.</p>
        <div class="pix-info">
          <i class="fas fa-info-circle"></i>
          <span>As informações de pagamento serão enviadas após a finalização do order</span>
        </div>
      </div>

      <div v-if="pagamento.metodo === 'boleto'" class="data-boleto">
        <h3>Pagamento via Boleto</h3>
        <p>O pagamento será processado manualmente após a confirmação do order. Você receberá as instruções por e-mail ou Whatsapp.</p>
        <div class="boleto-info">
          <i class="fas fa-info-circle"></i>
          <span>As informações de pagamento serão enviadas após a finalização do order</span>
        </div>
      </div>
      <div v-if="pagamento.metodo === 'cartao'" class="data-boleto">
        <h3>Pagamento via Cartão</h3>
        <p>O pagamento será processado manualmente após a confirmação do order. Você receberá as instruções por e-mail ou Whatsapp.</p>
        <div class="boleto-info">
          <i class="fas fa-info-circle"></i>
          <span>As informações de pagamento serão enviadas após a finalização do order</span>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" @click="voltar" class="btn-voltar">Voltar</button>
        <button type="submit" :disabled="!pagamento.metodo" class="btn-proximo">Revisar Order</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useCheckoutStore } from '@/stores/checkoutStore';

const router = useRouter();
const checkoutStore = useCheckoutStore();

const pagamento = reactive({
  metodo: ''
});

const salvarPagamento = () => {
  checkoutStore.setPagamento({ ...pagamento });
  router.push('/checkout/confirmacao');
};

const voltar = () => {
  router.push('/checkout/endereco');
};
</script>

<style scoped>
.pagamento {
  max-width: 600px;
  margin: 0 auto;
}

.pagamento h2 {
  color: #1a1a1a;
  font-size: 1.8rem;
  margin-bottom: 2rem;
  text-align: center;
}

.manual-payment-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 1rem;
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  color: #856404;
  margin-bottom: 2rem;
}

.manual-payment-notice i {
  color: #856404;
  font-size: 1.2rem;
  margin-top: 0.1rem;
}

.manual-payment-notice p {
  margin: 0;
  font-weight: 500;
}

.pagamento-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.metodo-pagamento h3,
.data-pix h3,
.data-boleto h3 {
  color: #1a1a1a;
  font-size: 1.3rem;
  margin-bottom: 1rem;
}

.opcoes-pagamento {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.opcao-pagamento {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.opcao-pagamento:hover {
  border-color: #d4af37;
}

.opcao-pagamento input[type="radio"] {
  display: none;
}

.opcao-pagamento input[type="radio"]:checked + .opcao-content {
  background-color: #d4af37;
  color: #1a1a1a;
}

.opcao-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #f5f5f5;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.opcao-content i {
  font-size: 1.2rem;
}

.data-pix,
.data-boleto {
  padding: 1.5rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}



.pix-info,
.boleto-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background-color: #e8f4fd;
  border-radius: 6px;
  color: #1a1a1a;
}

.pix-info i,
.boleto-info i {
  color: #007bff;
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
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-voltar:hover {
  background-color: #f5f5f5;
  border-color: #cccccc;
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


</style>
