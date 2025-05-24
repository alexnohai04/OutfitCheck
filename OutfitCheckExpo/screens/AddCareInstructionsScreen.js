import React, {useContext, useState} from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    Dimensions,
    ScrollView,
    SafeAreaView,
    ActivityIndicator
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useNavigation, useRoute } from "@react-navigation/native";
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";
import { SYMBOL_ICONS } from "../constants/symbolIcons";
import Toast from "react-native-toast-message";
import {UserContext} from "../UserContext";
const CATEGORY_MAP = {
    Washing: [
        "Machine wash 30C",
        "Machine wash 40C",
        "Machine wash 50C",
        "Machine wash 60C",
        "Hand wash",
        "Do not wash"
    ],
    Drying: [
        "Tumble dry allowed",
        "Do not tumble dry"
    ],
    Ironing: [
        "Iron at low temperature",
        "Iron at medium temperature",
        "Iron at high temperature",
        "Do not iron"
    ],
    Bleaching: [
        "Bleach allowed",
        "Do not bleach"
    ]
};

const SYMBOLS = Object.values(CATEGORY_MAP).flat();

const AddCareInstructionsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const clothingData = route.params;
    const { userId } = useContext(UserContext);

    const [selectedSymbols, setSelectedSymbols] = useState([]);
    const [labelImage, setLabelImage] = useState(null);
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);

    const toggleSymbol = (symbol) => {
        const updatedSymbols = [...selectedSymbols];

        const category = Object.keys(CATEGORY_MAP).find(cat =>
            CATEGORY_MAP[cat].includes(symbol)
        );

        if (!category) {
            // fallback pentru simboluri necunoscute
            if (updatedSymbols.includes(symbol)) {
                setSelectedSymbols(updatedSymbols.filter(s => s !== symbol));
            } else {
                setSelectedSymbols([...updatedSymbols, symbol]);
            }
            return;
        }

        const symbolsInCategory = CATEGORY_MAP[category];
        const alreadySelected = updatedSymbols.includes(symbol);
        const filtered = updatedSymbols.filter(s => !symbolsInCategory.includes(s));

        if (!alreadySelected) {
            filtered.push(symbol);
        }

        setSelectedSymbols(filtered);
    };

    const resizeImage = async (uri) => {
        try {
            const result = await ImageManipulator.manipulateAsync(
                uri,
                [{ resize: { width: 800 } }],
                { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG, base64: true }
            );
            return result.base64;
        } catch (err) {
            console.error("Error resizing image:", err);
            return null;
        }
    };

    const pickLabelImage = async () => {
        const result = await ImagePicker.launchCameraAsync({
            base64: false,
            quality: 0.7
        });

        if (!result.canceled && result.assets?.[0]) {
            const resizedBase64 = await resizeImage(result.assets[0].uri);
            if (resizedBase64) {
                setLabelImage(resizedBase64);
                await sendToOpenAI(resizedBase64);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Resize failed',
                    text2: 'Could not prepare image.',
                    position: 'bottom',
                });
            }
        }
    };

    const sendToOpenAI = async (base64Image) => {
        try {
            setLoadingAnalysis(true);
            const res = await apiClient.post(API_URLS.ANALYZE_LABEL, {
                imageBase64: `data:image/jpeg;base64,${base64Image}`
            });

            if (res.data?.symbols && res.data.symbols.length > 0) {
                setSelectedSymbols(res.data.symbols);
                Toast.show({
                    type: 'success',
                    text1: 'Symbols detected',
                    text2: 'We’ve auto-selected the care instructions from your label.',
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'No symbols detected',
                    text2: 'Try again with a clearer image.',
                });
            }
        } catch (err) {
            Toast.show({
                type: 'error',
                text1: 'Error analyzing label',
                text2: 'Please try again later.',
                position: 'bottom',
            });
        } finally {
            setLoadingAnalysis(false);
        }
    };

    const handleSave = async () => {
        try {
            console.log("Selected Symbols:", selectedSymbols);

            console.log("Payload being sent:", {
                userId: userId,
                ...clothingData,
                careSymbols: selectedSymbols

            });

            const response = await apiClient.post(API_URLS.ADD_CLOTHING, {
                userId: userId,
                ...clothingData,
                careSymbols: selectedSymbols,
            });
            if (response.status === 200 || response.status === 201) {
                navigation.replace("Home", { screen: "Wardrobe" });
            } else {
                Alert.alert("Error", "Failed to save clothing item.");
            }
        } catch (error) {
            Alert.alert("Error", "An issue occurred while saving.");
        }
    };
    const renderSymbolGrid = () => {
        return Object.entries(CATEGORY_MAP).map(([categoryName, symbols]) => (
            <View key={categoryName} style={{ marginBottom: 20, width: "100%" }}>
                <Text style={styles.subtitle}>{categoryName}</Text>
                <View style={styles.symbolGridWrap}>
                    {symbols.map((symbol) => {
                        const Icon = SYMBOL_ICONS[symbol];
                        const isSelected = selectedSymbols.includes(symbol);
                        return (
                            <TouchableOpacity
                                key={symbol}
                                style={[styles.gridItem, isSelected && styles.selectedSymbol]}
                                onPress={() => toggleSymbol(symbol)}
                            >
                                {Icon && (
                                    <Image source={Icon} style={styles.iconImage} resizeMode="contain" />
                                )}
                                <Text style={styles.gridText}>{symbol}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        ));
    };


    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <SafeAreaView style={styles.scrollWrap}>
                    <View style={styles.innerContainer}>
                        <View style={styles.headerRow}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <Ionicons name="chevron-back" size={24} color="#fff" />
                            </TouchableOpacity>
                            <Text style={styles.title}>Care Instructions</Text>
                            <Text style={styles.stepText}>2/2</Text>
                        </View>

                        <TouchableOpacity style={styles.imagePicker} onPress={pickLabelImage} disabled={loadingAnalysis}>
                            {loadingAnalysis ? (
                                <ActivityIndicator size="large" color="#FF6B6B" />
                            ) : labelImage ? (
                                <Image source={{ uri: `data:image/jpeg;base64,${labelImage}` }} style={styles.labelImage} />
                            ) : (
                                <Text style={styles.plusText}>+ Scan Label</Text>
                            )}
                        </TouchableOpacity>

                        <ScrollView style={styles.gridScroll} contentContainerStyle={{ alignItems: "center" }}>
                            {renderSymbolGrid()}
                        </ScrollView>
                    </View>

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Save Item</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#2C2C2C",
    },
    scrollWrap: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
    },
    innerContainer: {
        width: "90%",
        height: "90%",
        alignItems: "center",
        backgroundColor: "#1E1E1E",
        paddingVertical: 20,
        borderRadius: 15,
        paddingHorizontal: 15,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 10,
    },
    backButton: {
        padding: 4,
    },
    stepText: {
        color: "#aaa",
        fontSize: 14,
        fontWeight: "500",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFFFFF",
        textAlign: "center",
    },
    imagePicker: {
        width: 250,
        height: 150,
        marginBottom: 20,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#3A3A3A",
        borderRadius: 18,
        borderStyle: "dashed",
    },
    plusText: {
        color: "#FFF",
        fontSize: 24
    },
    labelImage: {
        width: "100%",
        height: "100%",
        borderRadius: 15
    },
    subtitle: {
        fontSize: 14,
        color: "#aaa",
        marginBottom: 10,
        alignSelf: "flex-start"
    },
    gridScroll: {
        width: "100%",
    },
    symbolGridWrap: {
        flexDirection: "row",
        flexWrap: "wrap",
        //justifyContent: "center",
    },
    gridItem: {
        width: Dimensions.get("window").width / 3 - 40,
        alignItems: "center",
        padding: 10,
        backgroundColor: "#3A3A3A",
        borderRadius: 10,
        margin: 8,
    },
    selectedSymbol: {
        backgroundColor: "#FF6B6B",
    },
    iconImage: {
        width: 48,
        height: 48,
        marginBottom: 4,
    },
    gridText: {
        color: "#fff",
        fontSize: 10,
        textAlign: "center",
    },
    saveButton: {
        backgroundColor: "#FF6B6B",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        width: "90%",
        alignItems: "center",
        margin: 10
    },
    saveButtonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
    },
    categoryTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 6,
        alignSelf: "flex-start",
    },

});

export default AddCareInstructionsScreen;
