import base64 from "react-native-base64";
import apiClient from "../apiClient";

export const arrayBufferToBase64 = (buffer) => {
    let binary = "";
    let bytes = new Uint8Array(buffer);
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
