import api from "./api";

export const checkoutOrder = async (payload) => {
  const { data } = await api.post("/orders", payload);
  return data;
};

export const getUserOrders = async () => {
  const { data } = await api.get("/orders/user");
  return data;
};

export const getAdminOrders = async () => {
  const { data } = await api.get("/orders/admin");
  return data;
};

export const updateOrderStatus = async (id, status) => {
  const { data } = await api.put(`/orders/${id}/status`, { status });
  return data;
};

export const updateOrder = async (id, payload) => {
  const { data } = await api.put(`/orders/${id}`, payload);
  return data;
};
