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
    GET_CLOTHING_ITEMS_BY_USER: `${API_BASE}/api/clothing/user`,
    DELETE_CLOTHING_ITEM: (itemId) => `${API_BASE}/api/clothing/${itemId}`,

    GET_USER_PROFILE: `${API_BASE}/users/profile`,

    UPLOAD_PROFILE_PIC: (userId) => `${API_BASE}/users/upload-profile-pic/${userId}`,
    GET_PROFILE_PIC: (userId) => `${API_BASE}/users/profile-picture/${userId}`,


    CREATE_OUTFIT: `${API_BASE}/api/outfits/create`,
    GET_OUTFITS_BY_USER: `${API_BASE}/api/outfits/user`,
    GET_PUBLIC_OUTFITS_BY_USER: `${API_BASE}/api/outfits/user_public`,
    GET_OUTFIT_DETAILS: `${API_BASE}/api/outfits`,
    DELETE_OUTFIT: (outfitId) => `${API_BASE}/api/outfits/${outfitId}`,

    GET_LOGGED_OUTFITS_BY_USER: `${API_BASE}/api/logged-outfits/by-user`,
    LOG_OUTFIT: `${API_BASE}/api/logged-outfits`,
    DELETE_LOGGED_OUTFIT: (userId, date) => `${API_BASE}/api/logged-outfits/${userId}/${date}`,

    ADD_POST: `${API_BASE}/api/posts`, // POST (multipart/form-data)
    GET_ALL_POSTS: (currentUserId) => `${API_BASE}/api/posts?currentUserId=${currentUserId}`, // GET
    TOGGLE_LIKE: (postId, userId) => `${API_BASE}/api/posts/${postId}/like?userId=${userId}`, // POST
    DELETE_POST: (postId) => `${API_BASE}/api/posts/${postId}`,

    FOLLOW_USER: (userId) => `${API_BASE}/api/users/${userId}/follow`, // POST
    UNFOLLOW_USER: (userId) => `${API_BASE}/api/users/${userId}/unfollow`, // POST
    IS_FOLLOWING: (userId) => `${API_BASE}/api/users/${userId}/is-following`, // GET

    GET_POSTS_BY_USER: (userId, currentUserId) =>
        `${API_BASE}/api/posts?userId=${userId}&currentUserId=${currentUserId}`,

    UPLOAD_CLOTHING_IMAGE: `${API_BASE}/api/clothing/upload-temp-image`,
    ANALYZE_LABEL:`${API_BASE}/api/openai/analyze-label`,

    UPDATE_OUTFIT: (outfitId) =>`${API_BASE}/api/outfits/${outfitId}/toggle-visibility`
};

export default API_URLS;
