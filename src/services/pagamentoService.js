import axiosInstance from "./api";

export const pagamentoService = {
  async criar(pagamento) {
    try {
        const response = await axiosInstance.post("/payments", pagamento);
        return response.data;
    } catch (error) {
        console.error("Erro ao processar pagamento:", error);
        throw error;
    }
  },
  async buscarPorPedido(pagamentoId) {
    try {
        const response = await axiosInstance.get(`/payments/${pagamentoId}`);
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar pagamento por pedido:", error);
        throw error;
    }
    }
};