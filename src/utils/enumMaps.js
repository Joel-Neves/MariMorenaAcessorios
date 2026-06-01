export const categoryMap = {
  RINGS: "Anéis",
  EARRINGS: "Brincos",
  NECKLACES: "Colares",
  SETS: "Conjuntos",
  BRACELETS: "Pulseiras",
  HEADBANDS: "Tiaras",
  OTHERS: "Outros",
};
export const orderStatusMap = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};
export const paymentMethodMap = {
    CREDIT_CARD: "Cartão de Crédito",
    DEBIT_CARD: "Cartão de Débito",
    PIX: "Pix",
    BOLETO: "Boleto",
    CASH: "Dinheiro",
};
export const paymentStatusMap = {
    PENDING: "Pendente",
    COMPLETED: "Concluído",
    FAILED: "Falhou",
    REFUNDED: "Reembolsado",
};
export const statusMap = {
    ACTIVE: "Ativo",
    INACTIVE: "Inativo"
};
export const userRoleMap = {
    ADMIN: "Administrador",
    CUSTOMER: "Cliente"
};

// Utility to get label from a map with normalization and fallback
export function getLabel(map, value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  const key = String(value).toUpperCase();
  return map?.[key] ?? fallback ?? value;
}

// Generic accessor for named maps
export const enumMaps = {
  categoryMap,
  orderStatusMap,
  paymentMethodMap,
  paymentStatusMap,
  statusMap,
  userRoleMap,
};

export function getEnumLabel(enumName, value, fallback = '') {
  const map = enumMaps[enumName];
  return getLabel(map, value, fallback);
}