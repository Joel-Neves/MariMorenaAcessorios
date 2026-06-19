import axiosInstance from './api';

const mapPedido = (pedido) => ({
  id: pedido.id,
  clienteId: pedido.clientId,
  enderecoId: pedido.addressId || null,
  itens: (pedido.orderItems || []).map(item => ({
    produtoId: item.productId,
    quantidade: item.quantity
  })),
  valorTotal: pedido.amount,
  frete: pedido.freight,
  status: pedido.orderStatus,
  createdAt: pedido.createdAt
});

export const pedidoService = {
  async listarTodos() {
    try {
      const response = await axiosInstance.get('/orders');
      return response.data.map(mapPedido);
    } catch (error) {
      throw new Error('Não foi possível carregar os pedidos');
    }
  },

  async buscarPorId(id) {
    try {
      const response = await axiosInstance.get(`/orders/${id}`);
      return mapPedido(response.data);
    } catch (error) {
      throw new Error('Não foi possível buscar o pedido');
    }
  },

  async buscarPorUsuario(clientId) {
    try {
      const response = await axiosInstance.get(`/orders/client/${clientId}`);
      return response.data.map(mapPedido);
    } catch (error) {
      throw new Error('Não foi possível buscar os pedidos');
    }
  },

  async criar(pedido) {
    try {
      const response = await axiosInstance.post('/orders', pedido);
      return mapPedido(response.data);
    } catch (error) {
      throw new Error('Não foi possível criar o pedido');
    }
  },

  async atualizar(id, dadosAtualizados) {
    try {
      const response = await axiosInstance.put(`/orders/${id}`, dadosAtualizados);
      return mapPedido(response.data);
    } catch (error) {
      throw new Error('Não foi possível atualizar o pedido');
    }
  },
  async atualizarStatus(id, status) {
    try {
      const response = await axiosInstance.patch(`/orders/${id}/status?status=${status}`);
      return mapPedido(response.data);
    } catch (error) {
      throw new Error('Não foi possível atualizar o status do pedido');
    }
  },

  async deletar(id) {
    try {
      const response = await axiosInstance.delete(`/orders/${id}`);
      return mapPedido(response.data);
    } catch (error) {
      throw new Error('Não foi possível deletar o pedido');
    }
  }
};
