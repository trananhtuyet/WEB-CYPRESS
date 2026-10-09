import api from "./api";

export const getUsers = async () => {
  const { data } = await api.get("/users");
  return data;
};

export const getUserById = async (id) => {
  const { data } = await api.get(`/users/${id}`);
  return data;
};

export const updateProfile = async (payload) => {
  const { data } = await api.put("/users/me", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};
