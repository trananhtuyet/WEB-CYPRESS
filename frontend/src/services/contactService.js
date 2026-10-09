import api from "./api";

export const getAdminContacts = async () => {
  const response = await api.get("/contacts");
  return response.data;
};

export const getCustomerContacts = async ({ email, phone }) => {
  const response = await api.get("/contacts/lookup", {
    params: { email, phone },
  });
  return response.data;
};

export const createContact = async (payload) => {
  const response = await api.post("/contacts", payload);
  return response.data;
};

export const addCustomerReply = async (contactId, text) => {
  const response = await api.post(`/contacts/${contactId}/customer-replies`, { text });
  return response.data;
};

export const addAdminReply = async (contactId, text) => {
  const response = await api.post(`/contacts/${contactId}/replies`, { text });
  return response.data;
};

export const updateContactStatus = async (contactId, status) => {
  const response = await api.patch(`/contacts/${contactId}/status`, { status });
  return response.data;
};
