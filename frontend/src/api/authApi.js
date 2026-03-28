import API from "./axios";

export const login = (data) => API.post("/auth/login", data);
export const register = (data) => API.post("/auth/register", data);
export const forgotPassword = (email) =>
  API.post("/auth/forgot-password", { email });
export const resetPassword = (token, password) =>
  API.put(`/auth/reset-password/${token}`, { password });
export const getMe = () => API.get("/auth/me");
