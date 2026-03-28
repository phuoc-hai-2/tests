import API from "./axios";

export const getStats = () => API.get("/admin/dashboard/stats");
export const getRevenueChart = (months = 6) =>
  API.get("/admin/dashboard/revenue-chart", { params: { months } });
export const getUserGrowth = (months = 6) =>
  API.get("/admin/dashboard/user-growth", { params: { months } });
export const getTopProducts = () => API.get("/admin/dashboard/top-products");

export const getAdminUsers = (params) => API.get("/admin/users", { params });
export const getAdminUserDetail = (id) => API.get(`/admin/users/${id}`);
export const toggleBanUser = (id) => API.put(`/admin/users/${id}/ban`);

export const getAllOrders = (params) => API.get("/orders/all", { params });
export const getOrderById = (id) => API.get(`/orders/${id}`);
export const updateOrderStatus = (id, formData) =>
  API.put(`/orders/${id}/status`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getAdminReviews = (params) =>
  API.get("/admin/reviews", { params });
export const toggleHideReview = (id) =>
  API.put(`/admin/reviews/${id}/toggle-hide`);
export const adminDeleteReview = (id) => API.delete(`/admin/reviews/${id}`);
export const replyReview = (id, reply) =>
  API.put(`/admin/reviews/${id}/reply`, { reply });

export const getTransactions = (params) =>
  API.get("/admin/payments", { params });
export const refundOrder = (id, reason) =>
  API.put(`/admin/payments/${id}/refund`, { reason });

export const getNotifications = (params) =>
  API.get("/admin/notifications", { params });
export const markNotificationRead = (id) =>
  API.put(`/admin/notifications/${id}/read`);
export const markAllNotificationsRead = () =>
  API.put("/admin/notifications/read-all");

export const getCategories = () => API.get("/categories");
export const createCategory = (data) => API.post("/categories", data);
export const updateCategory = (id, data) => API.put(`/categories/${id}`, data);
export const deleteCategory = (id) => API.delete(`/categories/${id}`);

export const createProduct = (formData) =>
  API.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateProduct = (id, formData) =>
  API.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const getProducts = (params) => API.get("/products", { params });

export const getAllTickets = (params) => API.get("/tickets/all", { params });
export const getTicketById = (id) => API.get(`/tickets/${id}`);
export const updateTicketStatus = (id, status) =>
  API.put(`/tickets/${id}/status`, { status });
export const getChatMessages = (ticketId) => API.get(`/chat/${ticketId}`);
export const sendChatMessage = (data) => API.post("/chat", data);
