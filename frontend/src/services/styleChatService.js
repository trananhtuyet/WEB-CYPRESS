import api from "./api";

export const askStyleAssistant = async ({ message, history = [] }) => {
  const { data } = await api.post("/style-chat", { message, history });
  return data;
};
