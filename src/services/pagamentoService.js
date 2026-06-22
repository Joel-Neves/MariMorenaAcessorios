import axiosInstance from "./api";
const mapPagamento = (pagamento) => ({
    id: pagamento.id,
    pedidoId: pagamento.orderId,
    total: pagamento.amount,
    metodo: pagamento.method,
    status: pagamento.status,
});

export const pagamentoService = {
  async criar(pagamento) {
    try {
        const response = await axiosInstance.post("/payments", pagamento);
        return mapPagamento(response.data);
    } catch (error) {
        console.error("Erro ao processar pagamento:", error);
        throw error;
    }
  },
  async buscarPorId(pagamentoId) {
    try {
        const response = await axiosInstance.get(`/payments/${pagamentoId}`);
        return mapPagamento(response.data);
    } catch (error) {
        console.error("Erro ao buscar pagamento por pedido:", error);
        throw error;
    }
  }
};