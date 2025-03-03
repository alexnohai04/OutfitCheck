import Constants from "expo-constants";

// Obține IP-ul corect în funcție de cum rulezi Expo
const getApiBase = () => {
    if (Constants.expoConfig?.hostUri) {
        return `http://${Constants.expoConfig.hostUri.split(':')[0]}:8080`;
    }
    if (Constants.manifest?.debuggerHost) {
        return `http://${Constants.manifest.debuggerHost.split(':')[0]}:8080`;
    }
    return "http://localhost:8080"; // Fallback pentru emulator
};

const API_BASE = getApiBase();

const API_URLS = {
    LOGIN: `${API_BASE}/users/login`,
    REGISTER: `${API_BASE}/users/register`,
    ADD_CLOTHING: `${API_BASE}/api/clothing/add`,
    GET_CLOTHING_CATEGORIES: `${API_BASE}/api/categories/all`,
};

export default API_URLS;
