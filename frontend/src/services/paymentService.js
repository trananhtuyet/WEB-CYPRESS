import api from "./api";

export const createZaloPayOrder = async (payload) => {
  const { data } = await api.post("/payments/zalopay/create", payload);
  return data;
};

export const createMockWalletOrder = async (payload) => {
  const { data } = await api.post("/payments/mock-wallet/create", payload);
  return data;
};

export const confirmMockWalletPayment = async (transactionCode) => {
  const { data } = await api.post(`/payments/mock-wallet/${transactionCode}/confirm`);
  return data;
};

export const failMockWalletPayment = async (transactionCode) => {
  const { data } = await api.post(`/payments/mock-wallet/${transactionCode}/fail`);
  return data;
};

export const getPaymentTransaction = async (transactionCode) => {
  const { data } = await api.get(`/payments/transactions/${transactionCode}`);
  return data;
};

export const confirmOrderPayment = async (orderId) => {
  const { data } = await api.post(`/payments/orders/${orderId}/confirm`);
  return data;
};
