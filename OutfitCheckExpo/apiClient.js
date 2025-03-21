import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URLS from "./apiConfig";
import {Alert} from "react-native";
import {UserContext} from "./UserContext";

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
// Handle 401 errors (expired or invalid token)
apiClient.interceptors.response.use(
    (response) => response, // Pass through successful responses
    async (error) => {
        if (error.response?.status === 401) {
            console.error("🔴 JWT expired or invalid. Logging out...");

            // Remove token from storage
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("userId");

            // Show alert to the user
            Alert.alert("Session Expired", "Please log in again.", [
                { text: "OK", onPress: () => {} },
            ]);

            // Logout user in context
            const { logoutUser } = UserContext._currentValue;
            if (logoutUser) {
                logoutUser();
            }
        }
        return Promise.reject(error);
    }
);
export default apiClient;
