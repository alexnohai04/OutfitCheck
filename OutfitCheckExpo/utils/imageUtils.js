import base64 from "react-native-base64";
import apiClient from "../apiClient";

export const arrayBufferToBase64 = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return base64.encode(binary);
};

export const processClothingItems = async (items) => {
    return await Promise.all(
        items.map(async (item) => {
            let base64Image = null;

            if (item.imageUrl) {
                try {
                    const imageResponse = await apiClient.get(item.imageUrl, {
                        responseType: "arraybuffer",
                    });

                    base64Image = `data:image/webp;base64,${arrayBufferToBase64(imageResponse.data)}`;
                } catch (imageError) {
                    console.error(`Error loading image for item ${item.id}:`, imageError);
                }
            }

            return { ...item, base64Image };
        })
    );
};

export const fetchProfileImageBase64 = async (userId) => {
    try {
        const response = await apiClient.get(`/users/profile-picture/${userId}`, {
            responseType: "arraybuffer"
        });

        return `data:image/webp;base64,${arrayBufferToBase64(response.data)}`;
    } catch (error) {
        console.error(`❌ Error fetching profile image for user ${userId}:`, error);
        return null;
    }
};

export const processPostImage = async (imageUrl) => {
    try {
        const response = await apiClient.get(imageUrl, {
            responseType: "arraybuffer"
        });

        return `data:image/webp;base64,${arrayBufferToBase64(response.data)}`;
    } catch (error) {
        console.error("❌ Failed to load post image:", error);
        return null;
    }
};
