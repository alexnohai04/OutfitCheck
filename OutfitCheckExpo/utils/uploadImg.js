export const uploadImage = async (uri) => {
    let formData = new FormData();

    let filename = uri.split('/').pop();
    let match = /\.(\w+)$/.exec(filename);
    let fileType = match ? `image/${match[1]}` : `image`;

    formData.append("file", {
        uri,
        name: filename,
        type: fileType,
    });

    try {
        const response = await fetch("http://your-backend.com/upload", {
            method: "POST",
            body: formData,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        const data = await response.json();
        console.log("✅ Imagine încărcată cu succes:", data.url);
        return data.url; // URL-ul imaginii încărcate
    } catch (error) {
        console.error("❌ Eroare la upload:", error);
        return null;
    }
};
