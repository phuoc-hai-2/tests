import API from "./axios";

export const getProductReviews = (productId) =>
  API.get(`/reviews/product/${productId}`);
export const createReview = (data) =>
  API.post("/reviews", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateReview = (id, data) =>
  API.put(`/reviews/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteReview = (id) => API.delete(`/reviews/${id}`);
