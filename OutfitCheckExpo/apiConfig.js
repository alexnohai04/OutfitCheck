import Constants from "expo-constants";

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
    BASE: API_BASE, // ✅ Adaugă BASE URL pentru a fi folosit în apiClient.js
    LOGIN: `${API_BASE}/users/login`,
    REGISTER: `${API_BASE}/users/register`,
    ADD_CLOTHING: `${API_BASE}/api/clothing/add`,
    GET_CLOTHING_CATEGORIES: `${API_BASE}/api/categories/all`,
    GET_CLOTHING_ITEMS_BY_USER: `${API_BASE}/api/clothing/user`
};

export default API_URLS;
