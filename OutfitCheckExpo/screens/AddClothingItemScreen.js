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
import { UserContext } from "../UserContext";
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";
import { processClothingItemAfterBgRemoval } from "../utils/imageUtils";
import Toast from "react-native-toast-message";
import namer from "color-namer";
import {Ionicons} from "@expo/vector-icons";

const AddClothingItemScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { imageUrl, suggestedCategory, topColors = [], brand: suggestedBrand = "" } = route.params || {};
    const [previewBase64, setPreviewBase64] = useState(null);
    const [colors, setColors] = useState([]);
    const [newColorInput, setNewColorInput] = useState("");
    const [material, setMaterial] = useState("");
    const [category, setCategory] = useState(null);
    const [brand, setBrand] = useState(suggestedBrand);
    const [open, setOpen] = useState(false);
    const [link, setLink] = useState("");
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const getContrastingTextColor = (hex) => {
        const cleanHex = hex.replace("#", "");
        const r = parseInt(cleanHex.slice(0, 2), 16);
        const g = parseInt(cleanHex.slice(2, 4), 16);
        const b = parseInt(cleanHex.slice(4, 6), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
        return luminance > 186 ? "#000" : "#fff";
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await apiClient.get(API_URLS.GET_CLOTHING_CATEGORIES);
                const data = response.data;
                const formatted = data.map((category) => ({
                    label: category.name,
                    value: category.id,
                }));
                setItems(formatted);
            } catch (error) {
                Alert.alert("Error", "Unable to load categories.");
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchImage = async () => {
            if (imageUrl) {
                const base64 = await processClothingItemAfterBgRemoval(imageUrl);
                setPreviewBase64(base64);
            }
        };
        fetchImage();
    }, [imageUrl]);

    useEffect(() => {
        if (topColors.length > 0 && colors.length === 0) {
            const translated = topColors.map(c => {
                const name = namer(c.hex).ntc[0].name;
                return { name, hex: c.hex };
            });
            setColors(translated);
        }

        if (suggestedCategory && items.length > 0 && !category) {
            const matched = items.find(cat => cat.label.toLowerCase() === suggestedCategory.toLowerCase());
            if (matched) setCategory(matched.value);
        }
    }, [topColors, suggestedCategory, items]);

    const removeColor = (colorName) => {
        setColors(prev => prev.filter(c => c.name !== colorName));
    };

    const addNewColor = () => {
        const trimmed = newColorInput.trim();
        if (trimmed && !colors.find(c => c.name === trimmed)) {
            setColors(prev => [...prev, { name: trimmed, hex: "#999999" }]); // hex default
            setNewColorInput("");
        }
    };

    const handleNext = () => {
        if (!imageUrl) return Alert.alert("Error", "No image available!");
        if (colors.length === 0 || !category) {
            return Toast.show({
                type: 'error',
                text1: 'Please fill all the fields!',
                position: 'top',
            });
        }

        if (link?.trim()) {
            try {
                const parsed = new URL(link);
                if (!["http:", "https:"].includes(parsed.protocol)) {
                    return Toast.show({
                        type: 'error',
                        text1: 'Invalid link. Only http and https are allowed.',
                        position: 'top',
                    });
                }
            } catch {
                return Toast.show({
                    type: 'error',
                    text1: 'Please enter a valid URL.',
                    position: 'top',
                });
            }
        }

        navigation.navigate("AddCareInstructionsScreen", {
            categoryId: category,
            colors: colors.map(c => c.name),
            material,
            brand,
            imageUrl,
            link
        });
    };
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
                style={styles.container}
            >
                <View style={styles.innerContainer}>
                    <View style={styles.headerRow}>
                        <View style={styles.sideSpacer} />
                        <Text style={styles.title}>Add clothing item</Text>
                        <Text style={styles.stepText}>1/2</Text>
                    </View>
                    {previewBase64 ? (
                        <Image source={{ uri: previewBase64 }} style={styles.image} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Text style={styles.imagePlaceholderText}>Loading image...</Text>
                        </View>
                    )}

                    <Text style={{ color: "#aaa", fontSize: 12, marginTop: -10, marginBottom: 10 }}>
                        Detected colors:
                    </Text>
                    <View style={styles.colorListWrap}>
                        {colors.map((color, idx) => (
                            <View key={idx} style={[styles.colorBadge, { backgroundColor: color.hex }]}>
                                <Text style={[styles.badgeText, { color: getContrastingTextColor(color.hex) }]}>
                                    {color.name}
                                </Text>
                                <TouchableOpacity onPress={() => removeColor(color.name)}>
                                    <Text style={[styles.badgeClose, { color: getContrastingTextColor(color.hex) }]}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    <View style={styles.addColorRow}>
                        <TextInput
                            placeholder="Add color"
                            placeholderTextColor="#A0A0A0"
                            value={newColorInput}
                            onChangeText={setNewColorInput}
                            style={styles.colorInput}
                        />
                        <TouchableOpacity onPress={addNewColor} style={styles.addBtn}>
                            <Text style={styles.addBtnText}>+</Text>
                        </TouchableOpacity>
                    </View>

                    {suggestedCategory && (
                        <Text style={{ color: "#aaa", fontSize: 12, marginTop: -10, marginBottom: 10 }}>
                            Suggested category: {suggestedCategory}
                        </Text>
                    )}

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
                            iconColor="#aaa"
                        />
                    )}

                    {brand && (
                        <Text style={{ color: "#aaa", fontSize: 12, marginTop: -10, marginBottom: 10 }}>
                            Suggested brand: {brand}
                        </Text>
                    )}
                        <TextInput
                            placeholder="Brand (optional)"
                            //placeholderTextColor="#A0A0A0"
                            value={brand}
                            onChangeText={setBrand}
                            style={styles.input}
                        />

                    <TextInput
                        placeholder="Material (optional)"
                        //placeholderTextColor="#A0A0A0"
                        value={material}
                        onChangeText={setMaterial}
                        style={styles.input}
                    />
                    <TextInput
                        value={link}
                        onChangeText={setLink}
                        placeholder="Product link (optional)"
                        style={styles.input}
                    />

                </View>

                <TouchableOpacity onPress={handleNext} style={styles.button}>
                    <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
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
        height: "83%",
        alignItems: "center",
        backgroundColor: "#1E1E1E",
        paddingVertical: 20,
        borderRadius: 15,
        paddingHorizontal: 15,
       // marginTop: 10
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFFFFF",
        position: "absolute",
        left: 0,
        right: 0,
        textAlign: "center",
    },
    sideSpacer: {
        width: 50, // egal cu stepText pentru echilibru
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
    colorList: {
        width: "100%",
        marginBottom: 10,
    },
    colorItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    colorBox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        marginRight: 8,
        borderWidth: 1,
        borderColor: "#fff",
    },
    colorText: {
        color: "#fff",
        flex: 1,
    },
    removeBtn: {
        color: "#444",
        fontSize: 16,
        marginLeft: 10,
    },
    addColorRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        width: "100%",
    },
    colorInput: {
        flex: 1,
        padding: 12,
        borderWidth: 1,
        borderColor: "#444",
        borderRadius: 10,
        backgroundColor: "#3A3A3A",
        color: "#FFFFFF",
    },
    addBtn: {
        marginLeft: 10,
        backgroundColor: "#FF6B6B",
        borderRadius: 8,
        padding: 10,
    },
    addBtnText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18,
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
        width: "90%",
        alignItems: "center",
        margin:10
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
    },
    colorListWrap: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 16,
        width: "100%",
    },
    colorBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 6,
        backgroundColor: "#777",
    },
    badgeText: {
        color: "#fff",
        fontWeight: "600",
        marginRight: 6,
    },
    badgeClose: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 14,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        marginVertical: 10,
        position: "relative",
    },

    stepText: {
        color: "#aaa",
        fontSize: 14,
        fontWeight: "500",
    },

});

export default AddClothingItemScreen;
