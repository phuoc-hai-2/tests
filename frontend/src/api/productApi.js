import API from "./axios";

export const getProducts = (params) => API.get("/products", { params });
export const getProductBySlug = (slug) => API.get(`/products/${slug}`);
