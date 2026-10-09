const { Op } = require("sequelize");
const { ContactMessage, ContactThread } = require("../models");
const ApiError = require("../utils/ApiError");

const includeMessages = {
  model: ContactMessage,
  as: "messages",
};

const normalizeThread = (thread) => {
  const value = thread.toJSON ? thread.toJSON() : thread;
  const messages = [...(value.messages || [])].sort(
    (first, second) => new Date(first.created_at).getTime() - new Date(second.created_at).getTime()
  );
  const firstCustomerMessage = messages.find((message) => message.sender === "customer");
  const adminMessages = messages.filter((message) => message.sender === "admin");
  const latestAdminMessage = adminMessages[adminMessages.length - 1];
  const customerReplies = messages
    .filter((message) => message.sender === "customer" && message.id !== firstCustomerMessage?.id)
    .map((message) => ({
      id: message.id,
      text: message.text,
      createdAt: new Date(message.created_at).getTime(),
    }));

  return {
    id: value.id,
    name: value.name,
    phone: value.phone,
    email: value.email,
    topic: value.topic,
    status: value.status,
    message: firstCustomerMessage?.text || "",
    createdAt: new Date(value.created_at).getTime(),
    customerReplies,
    replies: adminMessages.map((message) => ({
      id: message.id,
      text: message.text,
      createdAt: new Date(message.created_at).getTime(),
    })),
    reply: latestAdminMessage?.text || "",
    repliedAt: latestAdminMessage ? new Date(latestAdminMessage.created_at).getTime() : null,
    messages: messages.map((message) => ({
      id: message.id,
      sender: message.sender,
      text: message.text,
      createdAt: new Date(message.created_at).getTime(),
    })),
  };
};

const getThreadById = async (id) => {
  const thread = await ContactThread.findByPk(id, { include: [includeMessages] });

  if (!thread) {
    throw new ApiError(404, "Contact thread not found");
  }

  return thread;
};

const getAllThreads = async () => {
  const threads = await ContactThread.findAll({
    include: [includeMessages],
    order: [["created_at", "DESC"]],
  });

  return threads.map(normalizeThread);
};

const getCustomerThreads = async ({ email, phone }) => {
  const filters = [];
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanPhone = String(phone || "").trim();

  if (cleanEmail) {
    filters.push({ email: cleanEmail });
  }

  if (cleanPhone) {
    filters.push({ phone: cleanPhone });
  }

  if (!filters.length) {
    return [];
  }

  const threads = await ContactThread.findAll({
    where: { [Op.or]: filters },
    include: [includeMessages],
    order: [["created_at", "DESC"]],
  });

  return threads.map(normalizeThread);
};

const createThread = async (payload) => {
  const name = String(payload.name || "").trim();
  const phone = String(payload.phone || "").trim();
  const email = String(payload.email || "").trim().toLowerCase() || null;
  const topic = String(payload.topic || "").trim();
  const message = String(payload.message || "").trim();

  if (!name || !phone || !topic || !message) {
    throw new ApiError(400, "Name, phone, topic and message are required");
  }

  const thread = await ContactThread.create({ name, phone, email, topic, status: "new" });
  await ContactMessage.create({
    contact_id: thread.id,
    sender: "customer",
    text: message,
  });

  return normalizeThread(await getThreadById(thread.id));
};

const addCustomerMessage = async (id, text) => {
  const messageText = String(text || "").trim();

  if (!messageText) {
    throw new ApiError(400, "Message text is required");
  }

  const thread = await getThreadById(id);
  await ContactMessage.create({
    contact_id: thread.id,
    sender: "customer",
    text: messageText,
  });
  await thread.update({ status: "new" });

  return normalizeThread(await getThreadById(thread.id));
};

const addAdminMessage = async (id, text) => {
  const messageText = String(text || "").trim();

  if (!messageText) {
    throw new ApiError(400, "Reply text is required");
  }

  const thread = await getThreadById(id);
  await ContactMessage.create({
    contact_id: thread.id,
    sender: "admin",
    text: messageText,
  });
  await thread.update({ status: "replied" });

  return normalizeThread(await getThreadById(thread.id));
};

const updateThreadStatus = async (id, status) => {
  if (!["new", "replied", "closed"].includes(status)) {
    throw new ApiError(400, "Invalid contact status");
  }

  const thread = await getThreadById(id);
  await thread.update({ status });

  return normalizeThread(await getThreadById(thread.id));
};

module.exports = {
  addAdminMessage,
  addCustomerMessage,
  createThread,
  getAllThreads,
  getCustomerThreads,
  updateThreadStatus,
};
