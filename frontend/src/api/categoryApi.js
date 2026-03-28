import API from "./axios";

export const getCategories = () => API.get("/categories");
