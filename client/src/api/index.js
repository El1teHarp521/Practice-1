import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: { "Content-Type": "application/json" }
});
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) {
                localStorage.clear();
                return Promise.reject(error);
            }

            try {
                const response = await axios.post("http://localhost:3000/api/auth/refresh", {}, {
                    headers: { "x-refresh-token": refreshToken }
                });

                const { accessToken: newAccess, refreshToken: newRefresh } = response.data;

                // Сохраняем новые токены
                localStorage.setItem("accessToken", newAccess);
                localStorage.setItem("refreshToken", newRefresh);
                originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                return apiClient(originalRequest);

            } catch (refreshError) {
                localStorage.clear();
                window.location.reload();
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

// --- Экспортируем методы API ---
export const api = {
    // Авторизация
    register: (data) => apiClient.post("/auth/register", data).then(res => res.data),
    login: async (data) => {
        const res = await apiClient.post("/auth/login", data);
        if (res.data.accessToken && res.data.refreshToken) {
            localStorage.setItem("accessToken", res.data.accessToken);
            localStorage.setItem("refreshToken", res.data.refreshToken);
        }
        return res.data;
    },
    logout: () => {
        localStorage.clear();
    },
    getMe: () => apiClient.get("/auth/me").then(res => res.data),

    // Товары
    getProducts: () => apiClient.get("/products").then(res => res.data),
    createProduct: (data) => apiClient.post("/products", data).then(res => res.data),
    getProductById: (id) => apiClient.get(`/products/${id}`).then(res => res.data),
    updateProduct: (id, data) => apiClient.put(`/products/${id}`, data).then(res => res.data),
    deleteProduct: (id) => apiClient.delete(`/products/${id}`).then(res => res.data),
};