import axios from "axios";

const API_URl = "http://localhost:5216/api";
const apiClient = axios.create({
    baseURL: API_URl,
});

apiClient.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

apiClient.interceptors.response.use(
    (response) => {
        console.log("API RESPONSE:", response.data);
        return response.data;
    },
    (error) => {
        const status = error.response?.status;
        const data = error.response?.data;
        console.error("API ERROR:", {
            status,
            message: data?.message || data?.Message,
            url: error.config?.url,
        });
        let message = data?.message || data?.Message || data?.title || (status ? `Error ${status}` : "Unknown Error occurred ");

        // AUTH ERROR
        if (status === 401 || status === 403) {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("role");
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            window.location.replace("/login");
            message = "Unauthorized";
        } 

        // SERVER ERROR
        if (status === 500) {
            message = data?.Message || data?.message || data?.title || "Server Error. Please try again later.";
        }

        // VALIDATION ERROR (400)
        if (status === 400) {
            const rawErrors = data?.errors || data?.Errors;
            if (rawErrors) {
                if (Array.isArray(rawErrors)) {
                    message = rawErrors.join(", ");
                } else if (typeof rawErrors === "object") {
                    message = Object.values(rawErrors).flat().join(", ");
                } else {
                    message = String(rawErrors);
                }
            } else {
                message = data?.Message || data?.message || data?.title || "Validation error";
            }
        }
        return Promise.reject(message);
    },
);

export default apiClient;
