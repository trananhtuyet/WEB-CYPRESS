import api from "./api";

export const getActiveVouchers = async () => {
  const { data } = await api.get("/vouchers/active");
  return data;
};

export const getAdminVouchers = async () => {
  const { data } = await api.get("/vouchers");
  return data;
};

export const createVoucher = async (payload) => {
  const { data } = await api.post("/vouchers", payload);
  return data;
};

export const updateVoucher = async (id, payload) => {
  const { data } = await api.put(`/vouchers/${id}`, payload);
  return data;
};

export const deleteVoucher = async (id) => {
  const { data } = await api.delete(`/vouchers/${id}`);
  return data;
};
