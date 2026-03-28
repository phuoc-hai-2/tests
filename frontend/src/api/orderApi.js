import API from "./axios";

export const createOrder = () => API.post("/orders");
export const getMyOrders = () => API.get("/orders/my-orders");
export const getOrderById = (id) => API.get(`/orders/${id}`);
