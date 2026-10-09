import api from "./api";

export const getCart = async () => {
  const { data } = await api.get("/cart");
  return data;
};

export const addToCart = async (payload) => {
  const { data } = await api.post("/cart/add", payload);
  return data;
};

export const updateCartItem = async (payload) => {
  const { data } = await api.put("/cart/update", payload);
  return data;
};

export const removeCartItem = async (product_id) => {
  const { data } = await api.delete("/cart/remove", { data: { product_id } });
  return data;
};

