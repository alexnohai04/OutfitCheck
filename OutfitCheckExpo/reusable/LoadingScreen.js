// screens/LoadingScreen.js
import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";
import * as ImageManipulator from "expo-image-manipulator";

const LoadingScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { imageUri } = route.params;

    useEffect(() => {
        const processAndUpload = async () => {
            try {
                const original = await ImageManipulator.manipulateAsync(imageUri, []);
                const { width, height } = original;
                const size = Math.min(width, height);

                const cropRegion = {
                    originX: (width - size) / 2,
                    originY: (height - size) / 2,
                    width: size,
                    height: size
                };

                const result = await ImageManipulator.manipulateAsync(
                    imageUri,
                    [
                        { crop: cropRegion },
                        { resize: { width: 1080, height: 1080 } }
                    ],
                    { compress: 0.8, format: ImageManipulator.SaveFormat.WEBP }
                );

                const formData = new FormData();
                formData.append("file", {
                    uri: result.uri,
                    name: "clothing.webp",
                    type: "image/webp",
                });

                const response = await apiClient.post(API_URLS.UPLOAD_CLOTHING_IMAGE, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                const {
                    fileName,
                    suggestedCategory,
                    topColors,
                    brand,
                    subCategory,
                    articleType,
                    baseColour,
                    season,
                    usage
                } = response.data;

                navigation.replace("AddClothingItem", {
                    imageUrl: "/uploads/clothing/" + fileName,
                    suggestedCategory,
                    topColors,
                    brand,
                    subCategory,
                    articleType,
                    baseColour,
                    season,
                    usage
                });

            } catch (error) {
                console.error("Error during processing/uploading:", error);
                navigation.goBack();
            }
        };

        processAndUpload();
    }, []);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#FF6B6B" />
            <Text style={styles.text}>Hang on while we process your item...</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1c1c1c",
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        marginTop: 20,
        color: "#FFFFFF",
        fontSize: 16,
    },
});

export default LoadingScreen;
