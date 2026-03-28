import API from "./axios";

export const createTicket = (data) => API.post("/tickets", data);
export const getMyTickets = () => API.get("/tickets/my-tickets");
export const getTicketById = (id) => API.get(`/tickets/${id}`);
