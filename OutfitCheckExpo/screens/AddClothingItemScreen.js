import React, { useState, useEffect, useContext } from "react";
import {
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImageManipulator from "expo-image-manipulator";
import API_URLS from "../apiConfig";
import { UserContext } from "../UserContext";
import apiClient from "../apiClient";

const AddClothingItemScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { imageUri } = route.params || {};
    const { userId } = useContext(UserContext);

    const [color, setColor] = useState("");
    const [material, setMaterial] = useState("");
    const [category, setCategory] = useState(null);
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await apiClient.get(API_URLS.GET_CLOTHING_CATEGORIES);
                const data = response.data;

                const formattedCategories = data.map((category) => ({
                    label: category.name,
                    value: category.id
                }));

                setItems(formattedCategories);
            } catch (error) {
                console.error("Error loading categories:", error.response?.data || error.message);
                Alert.alert("Error", "Unable to load categories.");
            }
        };

        fetchCategories();
    }, []);

    const handleSave = async () => {
        if (!imageUri) {
            Alert.alert("Error", "No image available! Please take a photo.");
            return;
        }
        if (!color || !material || !category) {
            Alert.alert("Error", "Please fill in all fields!");
            return;
        }

        setLoading(true);

        try {
            // 🔹 Obține dimensiunile imaginii originale
            const original = await ImageManipulator.manipulateAsync(imageUri, []);
            const { width, height } = original;

            // 🔹 Determină dimensiunea pătrată maximă și zona de crop centrată
            const size = Math.min(width, height);
            const cropRegion = {
                originX: (width - size) / 2,
                originY: (height - size) / 2,
                width: size,
                height: size
            };

            // 🔹 Crop centrat + resize la 1080x1080
            const squareImage = await ImageManipulator.manipulateAsync(
                imageUri,
                [
                    { crop: cropRegion },
                    { resize: { width: 1080, height: 1080 } }
                ],
                { compress: 0.8, format: ImageManipulator.SaveFormat.WEBP }
            );

            let formData = new FormData();
            formData.append("userId", userId);
            formData.append("categoryId", category);
            formData.append("color", color);
            formData.append("material", material);
            formData.append("file", {
                uri: squareImage.uri,
                name: "clothing.webp",
                type: "image/webp",
            });

            console.log("📦 Sending cropped & resized image to backend:", formData);

            const response = await apiClient.post(API_URLS.ADD_CLOTHING, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 201 || response.status === 200) {
                Alert.alert("Success", "Clothing item saved successfully!");
                navigation.navigate("ClothingItems");
            } else {
                Alert.alert("Error", response.data.message || "Failed to save item. Please try again.");
            }
        } catch (error) {
            console.error("Error saving item:", error.response?.data || error.message);
            Alert.alert("Error", "An issue occurred while saving. Check your server connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
                style={styles.container}
            >
                <View style={styles.innerContainer}>
                    <Text style={styles.title}>Add Clothing Item</Text>

                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.image} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Text style={styles.imagePlaceholderText}>No image</Text>
                        </View>
                    )}

                    <TextInput
                        placeholder="Color"
                        placeholderTextColor="#A0A0A0"
                        value={color}
                        onChangeText={setColor}
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Material"
                        placeholderTextColor="#A0A0A0"
                        value={material}
                        onChangeText={setMaterial}
                        style={styles.input}
                    />

                    <Text style={styles.label}>Category:</Text>
                    {loading ? (
                        <ActivityIndicator size="large" color="#FF6B6B" />
                    ) : (
                        <DropDownPicker
                            open={open}
                            value={category}
                            items={items}
                            setOpen={setOpen}
                            setValue={setCategory}
                            setItems={setItems}
                            containerStyle={styles.dropdownContainer}
                            style={styles.dropdown}
                            dropDownContainerStyle={styles.dropdownList}
                            placeholder="Select a category"
                            placeholderStyle={styles.placeholderText}
                            textStyle={styles.dropdownText}
                            labelStyle={styles.dropdownLabel}
                            zIndex={1000}
                            zIndexInverse={3000}
                            onOpen={Keyboard.dismiss}
                        />
                    )}

                    <TouchableOpacity onPress={handleSave} style={styles.button}>
                        <Text style={styles.buttonText}>Save Item</Text>
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
        alignItems: "center",
        backgroundColor: "#1E1E1E",
        paddingVertical: 20,
        borderRadius: 15,
        paddingHorizontal: 15,
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
        marginVertical: 10,
        width: "100%",
        alignItems: "center",
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default AddClothingItemScreen;
