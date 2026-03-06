import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: { "Content-Type": "application/json" }
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const api = {
    // Авторизация
    register: (data) => apiClient.post("/auth/register", data).then(res => res.data),
    login: async (data) => {
        const res = await apiClient.post("/auth/login", data);
        if (res.data.accessToken) {
            localStorage.setItem("token", res.data.accessToken);
        }
        return res.data;
    },
    logout: () => localStorage.removeItem("token"),

    // Товары
    getProducts: () => apiClient.get("/products").then(res => res.data),
    createProduct: (data) => apiClient.post("/products", data).then(res => res.data),
    
    getProductById: (id) => apiClient.get(`/products/${id}`).then(res => res.data),
    updateProduct: (id, data) => apiClient.put(`/products/${id}`, data).then(res => res.data),
    deleteProduct: (id) => apiClient.delete(`/products/${id}`).then(res => res.data),
};