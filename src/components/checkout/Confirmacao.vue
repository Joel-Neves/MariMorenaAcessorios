<template>
  <div class="confirmacao">
    <h2>Confirmação do Pedido</h2>

    <div class="resumo-pedido">
      <h3>Resumo do Pedido</h3>

      <div class="itens-pedido">
        <div v-for="item in itensSacola" :key="item.id" class="item-resumo">
          <div class="item-info">
            <img :src="item.imagens[0].url" :alt="item.nome" class="item-imagem" />
            <div class="item-detalhes">
              <h4>{{ item.nome }}</h4>
              <p>{{ item.categoria }}</p>
              <p>Quantidade: {{ item.quantidade }}</p>
            </div>
          </div>
          <div class="item-preco">
            R$ {{ formatarPreco(item.preco * item.quantidade) }}
          </div>
        </div>
      </div>

      <div class="total-pedido">
        <div class="linha-total">
          <span>Subtotal:</span>
          <span>R$ {{ formatarPreco(valorTotal) }}</span>
        </div>
        <div class="linha-total">
          <span>Frete:</span>
          <span>R$ {{ formatarPreco(frete) }}</span>
        </div>
        <div class="linha-total total-final">
          <span>Total:</span>
          <span>R$ {{ formatarPreco(totalComFrete) }}</span>
        </div>
      </div>
    </div>

    <div class="endereco-entrega">
      <h3>Endereço de Entrega</h3>
      <div class="endereco-info">
        <p>{{ endereco.rua }}, {{ endereco.numero }}</p>
        <p v-if="endereco.complemento">{{ endereco.complemento }}</p>
        <p>{{ endereco.bairro }}, {{ endereco.cidade }} - {{ endereco.estado }}</p>
        <p>CEP: {{ endereco.cep }}</p>
      </div>
    </div>

    <div class="forma-pagamento">
      <h3>Forma de Pagamento</h3>
      <div class="pagamento-info">
        <div v-if="pagamento.metodo === 'cartao'" class="cartao-info">
          <i class="fas fa-credit-card"></i>
          <span>Cartão de Crédito</span>
          <p>Entraremos em contato em até 24 horas</p>
        </div>
        <div v-else-if="pagamento.metodo === 'pix'" class="pix-info">
          <i class="fas fa-qrcode"></i>
          <span>PIX</span>
          <p>Pagamento instantâneo</p>
        </div>
        <div v-else-if="pagamento.metodo === 'boleto'" class="boleto-info">
          <i class="fas fa-barcode"></i>
          <span>Boleto Bancário</span>
          <p>Prazo de compensação: até 3 dias úteis</p>
        </div>
      </div>
    </div>

    <div v-if="pagamento.metodo === 'pix'" class="pix-qrcode">
      <h3>QR Code para Pagamento</h3>
      <div class="qrcode-placeholder">
        <i class="fas fa-qrcode"></i>
        <p>QR Code seria gerado aqui</p>
        <small>QR Code Pix</small>
        <h2><strong>chave pix:</strong><br>marimorena.ac@gmail.com</h2>
      </div>
    </div>

    <div class="acoes-confirmacao">
      <button @click="voltar" class="btn-voltar">Voltar</button>
      <button @click="finalizarPedido" :disabled="loading" class="btn-finalizar">
        <span v-if="loading">Processando...</span>
        <span v-else>Finalizar Pedido</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSacolaStore } from '@/stores/sacolaStore';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { pedidoService } from '@/services/pedidoService';
import { authService } from '@/services/authService';
import { produtoService } from '@/services/produtoService';

const router = useRouter();
const sacolaStore = useSacolaStore();
const checkoutStore = useCheckoutStore();

const loading = ref(false);

const itensSacola = computed(() => sacolaStore.itens);
const valorTotal = computed(() => sacolaStore.valorTotal);
const frete = computed(() => valorTotal.value >= 100 ? 0 : 15); 
const totalComFrete = computed(() => valorTotal.value + frete.value);

const endereco = computed(() => checkoutStore.endereco);
const pagamento = computed(() => checkoutStore.pagamento);

const formatarPreco = (preco) => {
  return preco.toFixed(2).replace('.', ',');
};

const voltar = () => {
  router.push('/checkout/pagamento');
};

const finalizarPedido = async () => {
  if (!endereco.value || !pagamento.value) {
    alert('Dados de endereço ou pagamento incompletos');
    return;
  }

  loading.value = true;

  try {
    const user = authService.getCurrentUser();
    if (!user) {
      alert('Você precisa estar logado para finalizar o pedido');
      router.push('/perfil');
      return;
    }

    const pedido = {
      usuarioId: user.uid,
      itens: itensSacola.value.map(item => ({
        produtoId: item.id,
        quantidade: item.quantidade
      })),
      endereco: endereco.value,
      pagamento: {
        metodo: pagamento.value.metodo
      },
      total: totalComFrete.value,
      frete: frete.value,
      status: 'pendente',
      dataCriacao: new Date().toISOString().split("T")[0]
    };


    const pedidoCriado = await pedidoService.criar(pedido);

    // Diminuir estoque dos produtos
    try {
      for (const item of itensSacola.value) {
        const produto = await produtoService.buscarPorId(item.id);
        const novoEstoque = produto.estoque - item.quantidade;
        await produtoService.atualizar(item.id, { estoque: novoEstoque });
      }
    } catch (estoqueError) {
      console.error('Erro ao atualizar estoque:', estoqueError);
      alert('Pedido criado, mas houve erro ao atualizar o estoque. Entre em contato com o suporte.');
    }

    checkoutStore.setPedido(pedidoCriado);
    sacolaStore.limparSacola();

    alert('Pedido realizado com sucesso!');
    router.push('/perfil/meus-pedidos');
  } catch (error) {
    console.error('Erro ao finalizar pedido:', error);
    alert('Erro ao finalizar pedido. Tente novamente.');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.confirmacao {
  max-width: 800px;
  margin: 0 auto;
}

.confirmacao h2 {
  color: #1a1a1a;
  font-size: 1.8rem;
  margin-bottom: 2rem;
  text-align: center;
}

.resumo-pedido,
.endereco-entrega,
.forma-pagamento,
.pix-qrcode {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #e0e0e0;
}

.resumo-pedido h3,
.endereco-entrega h3,
.forma-pagamento h3,
.pix-qrcode h3 {
  color: #1a1a1a;
  font-size: 1.3rem;
  margin-bottom: 1rem;
}

.itens-pedido {
  margin-bottom: 2rem;
}

.item-resumo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.item-resumo:last-child {
  border-bottom: none;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.item-imagem {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

.item-detalhes h4 {
  margin: 0 0 0.5rem 0;
  color: #1a1a1a;
  font-size: 1rem;
}

.item-detalhes p {
  margin: 0.2rem 0;
  color: #666666;
  font-size: 0.9rem;
}

.item-preco {
  font-weight: bold;
  color: #d4af37;
}

.total-pedido {
  border-top: 2px solid #e0e0e0;
  padding-top: 1rem;
}

.linha-total {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #666666;
}

.linha-total.total-final {
  font-size: 1.2rem;
  font-weight: bold;
  color: #1a1a1a;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.endereco-info,
.pagamento-info {
  color: #1a1a1a;
}

.endereco-info p,
.pagamento-info p {
  margin: 0.5rem 0;
}

.cartao-info,
.pix-info,
.boleto-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cartao-info i,
.pix-info i,
.boleto-info i {
  font-size: 1.5rem;
  color: #d4af37;
}

.pix-qrcode {
  text-align: center;
}

.qrcode-placeholder {
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 8px;
  border: 2px dashed #d4af37;
}

.qrcode-placeholder i {
  font-size: 3rem;
  color: #d4af37;
  margin-bottom: 1rem;
}

.qrcode-placeholder p {
  color: #1a1a1a;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.qrcode-placeholder small {
  color: #666666;
}

.acoes-confirmacao {
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

.btn-finalizar {
  padding: 0.8rem 2rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-finalizar:hover:not(:disabled) {
  background-color: #218838;
}

.btn-finalizar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .item-resumo {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .acoes-confirmacao {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
