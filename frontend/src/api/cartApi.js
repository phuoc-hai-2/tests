import API from "./axios";

export const getCart = () => API.get("/cart");
export const addToCart = (data) => API.post("/cart", data);
export const updateCartItem = (itemId, quantity) =>
  API.put(`/cart/${itemId}`, { quantity });
export const removeCartItem = (itemId) => API.delete(`/cart/${itemId}`);
export const clearCart = () => API.delete("/cart");
