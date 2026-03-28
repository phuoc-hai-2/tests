import API from "./axios";

export const getProfile = () => API.get("/users/profile");
export const updateProfile = (data) =>
  API.put("/users/profile", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
