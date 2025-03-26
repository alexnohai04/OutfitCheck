import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URLS from "./apiConfig";
import { triggerLogout } from "./utils/authService"; // ✅ adăugat

const getAuthHeader = async () => {
    const token = await AsyncStorage.getItem("jwt_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const apiClient = axios.create({
    baseURL: API_URLS.BASE,
    headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(
    async (config) => {
        // Excludem `login` și `register` de la adăugarea JWT-ului
        if (
            config.url.includes("/users/login") ||
            config.url.includes("/users/register")
        ) {
            return config;
        }

        const authHeader = await getAuthHeader();
        config.headers = { ...config.headers, ...authHeader };
        return config;
    },
    (error) => Promise.reject(error)
);

// ✅ Handle 401 errors (expired or invalid token)
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            console.log("🔴 JWT expired or invalid. Logging out...");

            // ✅ Trigger logout global, fără UserContext
            triggerLogout();
        }

        return Promise.reject(error);
    }
);

export default apiClient;
