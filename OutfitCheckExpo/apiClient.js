import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URLS from "./apiConfig";

const getAuthHeader = async () => {
    const token = await AsyncStorage.getItem("jwt_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const apiClient = axios.create({
    baseURL: API_URLS.BASE,
    headers: { "Content-Type": "application/json" }
});

apiClient.interceptors.request.use(
    async (config) => {
        // Excludem `login` și `register` de la adăugarea JWT-ului
        if (config.url.includes("/users/login") || config.url.includes("/users/register")) {
            return config; // ✅ Nu adăugăm header-ul Authorization
        }

        const authHeader = await getAuthHeader();
        config.headers = { ...config.headers, ...authHeader };
        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;
