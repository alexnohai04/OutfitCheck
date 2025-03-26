import React, { useState, useEffect, useContext } from "react";
import {
    View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image,
    KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ActivityIndicator
} from "react-native";
import * as ImageManipulator from "expo-image-manipulator";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { UserContext } from "../UserContext";
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";
import Toast from "react-native-toast-message";
import { useRoute } from "@react-navigation/native";


const AddPostScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { imageUri: initialImageUri } = route.params || {};

    const { userId } = useContext(UserContext);

    const [caption, setCaption] = useState("");
    const [hashtags, setHashtags] = useState("");
    const [outfitId, setOutfitId] = useState(null);
    const [imageUri, setImageUri] = useState(initialImageUri || null);
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchOutfits = async () => {
            try {
                const response = await apiClient.get(`${API_URLS.GET_OUTFITS_BY_USER}/${userId}`);
                const outfits = response.data;

                const formatted = outfits.map((outfit) => ({
                    label: `Outfit #${outfit.id}`,
                    value: outfit.id
                }));

                setItems(formatted);
            } catch (error) {
                console.error("Error loading outfits:", error.response?.data || error.message);
                Alert.alert("Error", "Unable to load outfits.");
            }
        };

        fetchOutfits();
    }, [userId]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSelectOutfit = () => {
        navigation.navigate("SelectOutfit", {
            onGoBack: (selectedOutfitId) => {
                setOutfitId(selectedOutfitId);
            }
        });
    };

    const handleSubmit = async () => {
        if (!imageUri || !outfitId || !caption) {
            Alert.alert("Missing info", "Image, caption and outfit are required.");
            return;
        }

        setLoading(true);

        try {
            // 🔄 Redimensionare + compresie
            const resizedImage = await ImageManipulator.manipulateAsync(
                imageUri,
                [{ resize: { width: 1080, height: 1080 } }],
                { compress: 0.8, format: ImageManipulator.SaveFormat.WEBP }
            );

            let formData = new FormData();
            formData.append("userId", userId);
            formData.append("outfitId", outfitId);
            formData.append("caption", caption);
            formData.append("hashtags", hashtags); // raw string
            formData.append("image", {
                uri: resizedImage.uri,
                name: "post_image.webp",
                type: "image/webp",
            });

            const response = await apiClient.post(API_URLS.ADD_POST, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            if (response.status === 201 || response.status === 200) {
                Toast.show({
                    type: "success",
                    text1: "Post created",
                    text2: "Your outfit post is live!",
                    position: "top"
                });
                navigation.goBack();
            } else {
                Alert.alert("Error", response.data.message || "Something went wrong.");
            }
        } catch (error) {
            console.error("Error submitting post:", error.response?.data || error.message);
            Alert.alert("Error", "Failed to create post.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <View style={styles.innerContainer}>
                    <Text style={styles.title}>Create a New Post</Text>

                    <TouchableOpacity onPress={pickImage}>
                        {imageUri ? (
                            <Image source={{ uri: imageUri }} style={styles.image} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Text style={styles.imagePlaceholderText}>Tap to select an image</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TextInput
                        placeholder="Caption"
                        placeholderTextColor="#A0A0A0"
                        value={caption}
                        onChangeText={setCaption}
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Hashtags (comma-separated)"
                        placeholderTextColor="#A0A0A0"
                        value={hashtags}
                        onChangeText={setHashtags}
                        style={styles.input}
                    />

                    <Text style={styles.label}>Selected Outfit:</Text>
                    <TouchableOpacity onPress={handleSelectOutfit} style={styles.outfitSelector}>
                        <Text style={styles.outfitSelectorText}>
                            {outfitId ? `Outfit #${outfitId}` : "Tap to choose outfit"}
                        </Text>
                    </TouchableOpacity>


                    <TouchableOpacity onPress={handleSubmit} style={styles.button}>
                        <Text style={styles.buttonText}>Post Outfit</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#2C2C2C",
        justifyContent: "center",
        alignItems: "center",
    },
    innerContainer: {
        width: "90%",
        backgroundColor: "#1E1E1E",
        paddingVertical: 20,
        borderRadius: 15,
        paddingHorizontal: 15,
        alignItems: "center"
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 20,
        textAlign: "center",
        marginTop: Platform.OS === "ios" ? 50 : 30,
    },
    image: {
        width: 250,
        height: 250,
        marginBottom: 20,
        borderRadius: 15,
    },
    imagePlaceholder: {
        width: 250,
        height: 250,
        marginBottom: 20,
        borderRadius: 15,
        backgroundColor: "#444",
        justifyContent: "center",
        alignItems: "center",
    },
    imagePlaceholderText: {
        color: "#A0A0A0",
        fontSize: 16,
    },
    input: {
        width: "100%",
        padding: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#444",
        borderRadius: 10,
        backgroundColor: "#3A3A3A",
        color: "#FFFFFF",
    },
    label: {
        color: "#FFFFFF",
        marginBottom: 5,
        fontSize: 16,
        fontWeight: "bold",
    },
    dropdownContainer: {
        width: "100%",
        marginBottom: 20,
    },
    dropdown: {
        backgroundColor: "#3A3A3A",
        borderColor: "#444",
    },
    dropdownList: {
        backgroundColor: "#3A3A3A",
        borderColor: "#444",
    },
    placeholderText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    dropdownText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    dropdownLabel: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    button: {
        backgroundColor: "#FF6B6B",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        marginTop: 10,
        width: "100%",
        alignItems: "center",
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
    },
    outfitSelector: {
        width: "100%",
        padding: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#444",
        borderRadius: 10,
        backgroundColor: "#3A3A3A",
        alignItems: "center",
    },
    outfitSelectorText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },

});

export default AddPostScreen;
