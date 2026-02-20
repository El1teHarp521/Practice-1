import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: { "Content-Type": "application/json" }
});

export const api = {
    getProducts: () => apiClient.get("/products").then(res => res.data),
    createProduct: (data) => apiClient.post("/products", data).then(res => res.data),
    updateProduct: (id, data) => apiClient.patch(`/products/${id}`, data).then(res => res.data),
    deleteProduct: (id) => apiClient.delete(`/products/${id}`).then(res => res.data),
};