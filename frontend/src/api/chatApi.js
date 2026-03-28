import API from "./axios";

export const sendMessage = (data) => API.post("/chat", data);
export const getMessages = (ticketId) => API.get(`/chat/${ticketId}`);
export const markAsRead = (ticketId) => API.put(`/chat/${ticketId}/read`);
