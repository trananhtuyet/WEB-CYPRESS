const contactService = require("../services/contactService");
const asyncHandler = require("../utils/asyncHandler");

const getContacts = asyncHandler(async (req, res) => {
  const contacts = await contactService.getAllThreads();
  res.json(contacts);
});

const getCustomerContacts = asyncHandler(async (req, res) => {
  const contacts = await contactService.getCustomerThreads(req.query);
  res.json(contacts);
});

const createContact = asyncHandler(async (req, res) => {
  const contact = await contactService.createThread(req.body);
  res.status(201).json(contact);
});

const addCustomerReply = asyncHandler(async (req, res) => {
  const contact = await contactService.addCustomerMessage(req.params.id, req.body.text);
  res.status(201).json(contact);
});

const addAdminReply = asyncHandler(async (req, res) => {
  const contact = await contactService.addAdminMessage(req.params.id, req.body.text);
  res.status(201).json(contact);
});

const updateContactStatus = asyncHandler(async (req, res) => {
  const contact = await contactService.updateThreadStatus(req.params.id, req.body.status);
  res.json(contact);
});

module.exports = {
  addAdminReply,
  addCustomerReply,
  createContact,
  getContacts,
  getCustomerContacts,
  updateContactStatus,
};
