// WardrobeScreen.js complet cu useFocusEffect corect

import React, { useState, useCallback, useContext, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    Modal,
    TouchableWithoutFeedback,
    StyleSheet,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";
import { UserContext } from "../UserContext";
import { processClothingItems } from "../utils/imageUtils";
import globalStyles from "../styles/globalStyles";
import OutfitsView from "../screens/OutfitsView";
import ClothesView from "../screens/ClothesView";
import LaundryView from "./LaundryView";
import Toast from "react-native-toast-message";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
} from "react-native-reanimated";

const ModeTransition = ({ mode, onMidFade, onDone }) => {
    const opacity = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    useEffect(() => {
        opacity.value = withTiming(1, { duration: 300 }, (finished) => {
            if (finished) runOnJS(onMidFade)();
        });

        const timeout = setTimeout(() => {
            opacity.value = withTiming(0, { duration: 300 }, (finished) => {
                if (finished) runOnJS(onDone)();
            });
        }, 1600);

        return () => clearTimeout(timeout);
    }, []);

    const icon =
        mode === "outfits" ? <Ionicons name="layers-outline" size={28} color="#FFF" /> :
            mode === "clothes" ? <Ionicons name="shirt-outline" size={28} color="#FFF" /> :
                <MaterialCommunityIcons name="washing-machine" size={28} color="#FFF" />;

    const text =
        mode === "outfits" ? "Outfits Mode" :
            mode === "clothes" ? "Clothes Mode" :
                "Laundry Mode";

    return (
        <Animated.View style={[styles.transitionOverlay, animatedStyle]}>
            <View style={styles.modeTransitionBox}>
                {icon}
                <Text style={styles.modeTransitionText}>{text}</Text>
                <ActivityIndicator size="small" color="#FFF" style={{ marginLeft: 8 }} />
            </View>
        </Animated.View>
    );
};

const WardrobeScreen = () => {
    const navigation = useNavigation();
    const { userId } = useContext(UserContext);

    const [outfits, setOutfits] = useState([]);
    const [clothingItems, setClothingItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [mode, setMode] = useState("outfits");
    const [internalMode, setInternalMode] = useState("outfits");
    const [modeModalVisible, setModeModalVisible] = useState(false);
    const [transitionVisible, setTransitionVisible] = useState(false);
    const [pendingMode, setPendingMode] = useState(null);

    // Refresh data on focus if not in transition
    useFocusEffect(
        useCallback(() => {
            if (!transitionVisible && !pendingMode) {
                const fetchData = async () => {
                    try {
                        if (internalMode === "outfits") {
                            const response = await apiClient.get(`${API_URLS.GET_OUTFITS_BY_USER}/${userId}`);
                            const processed = await Promise.all(
                                response.data.map(async (outfit) => {
                                    const items = await processClothingItems(outfit.clothingItems);
                                    return { ...outfit, clothingItems: items };
                                })
                            );
                            setOutfits(processed);
                        } else if (internalMode === "clothes") {
                            const response = await apiClient.get(`${API_URLS.GET_CLOTHING_ITEMS_BY_USER}/${userId}`);
                            const updatedItems = await processClothingItems(response.data);
                            setClothingItems(updatedItems);
                        }
                    } catch (error) {
                        console.error("Error refreshing data on focus:", error);
                    }
                };

                fetchData();
            }
        }, [internalMode, transitionVisible, pendingMode, userId])
    );

    // Fetch data on mode change with animation
    useEffect(() => {
        if (transitionVisible && pendingMode) {
            const fetchData = async () => {
                try {
                    if (pendingMode === "outfits") {
                        const response = await apiClient.get(`${API_URLS.GET_OUTFITS_BY_USER}/${userId}`);
                        const processed = await Promise.all(
                            response.data.map(async (outfit) => {
                                const items = await processClothingItems(outfit.clothingItems);
                                return { ...outfit, clothingItems: items };
                            })
                        );
                        setOutfits(processed);
                    } else {
                        const response = await apiClient.get(`${API_URLS.GET_CLOTHING_ITEMS_BY_USER}/${userId}`);
                        const updatedItems = await processClothingItems(response.data);
                        setClothingItems(updatedItems);
                    }
                    setInternalMode(pendingMode);
                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            };

            fetchData();
        }
    }, [transitionVisible, pendingMode]);

    const clothingCategories = ["All", ...new Set(clothingItems.map(item => item.category.name))];

    const deleteClothingItem = async (itemId) => {
        try {
            const response = await apiClient.delete(API_URLS.DELETE_CLOTHING_ITEM(itemId));
            if (response.status === 200) {
                setClothingItems(prev => prev.filter(item => item.id !== itemId));
                Toast.show({
                    type: 'success',
                    text1: 'Item deleted',
                    text2: 'Clothing Item deleted successfully',
                });
            }
        } catch (error) {
            console.error("Error deleting clothing item", error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity onPress={() => setModeModalVisible(true)}>
                <View style={styles.header}>
                    <Text style={styles.title}>{mode === "outfits" ? "Outfits" : mode === "laundry" ? "Laundry" : "Clothes"}</Text>
                    <Ionicons name="chevron-down" size={20} color="#FFF" />
                </View>
            </TouchableOpacity>

            <Modal
                visible={modeModalVisible}
                animationType="fade"
                transparent
                onRequestClose={() => setModeModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModeModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContentEnhanced}>
                                <View style={globalStyles.dragBar} />
                                <Text style={styles.modalTitle}>Select your mode</Text>
                                <View style={styles.modeOptionsContainer}>
                                    {["outfits", "clothes", "laundry"].map((m) => (
                                        <TouchableOpacity
                                            key={m}
                                            style={[styles.modeOptionBox, mode === m && styles.modeSelected]}
                                            onPress={() => {
                                                setModeModalVisible(false);
                                                setPendingMode(m);
                                                setTransitionVisible(true);
                                            }}
                                        >
                                            {m === "outfits" && <Ionicons name="layers-outline" size={24} color="#FFF" />}
                                            {m === "clothes" && <Ionicons name="shirt-outline" size={24} color="#FFF" />}
                                            {m === "laundry" && <MaterialCommunityIcons name="washing-machine" size={24} color="#FFF" />}
                                            <Text style={styles.modeLabel}>{m.charAt(0).toUpperCase() + m.slice(1)}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {internalMode === "outfits" ? (
                <OutfitsView outfits={outfits} navigation={navigation} />
            ) : internalMode === "laundry" ? (
                <LaundryView />
            ) : (
                <ClothesView
                    clothes={clothingItems}
                    categories={clothingCategories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    onDelete={deleteClothingItem}
                />
            )}

            {transitionVisible && (
                <ModeTransition
                    mode={pendingMode}
                    onMidFade={() => setMode(pendingMode)} // schimbi titlul imediat când începe fade-ul
                    onDone={() => {
                        setPendingMode(null);
                        setTransitionVisible(false);
                    }}
                />

            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1E1E1E",
        paddingTop: 20,
        paddingHorizontal: 10,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
        gap: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
        textAlign: "center",
    },
    transitionOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#1E1E1E",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 20,
    },
    modeTransitionBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: "#1E1E1E",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#444",
    },
    modeTransitionText: {
        fontSize: 20,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContentEnhanced: {
        backgroundColor: "#1E1E1E",
        paddingVertical: 24,
        paddingHorizontal: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    modalTitle: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
    },
    modeOptionsContainer: {
        flexDirection: "column",
        gap: 16,
    },
    modeOptionBox: {
        flexDirection: "row",
        alignItems: "center",
        borderColor: "#444",
        borderWidth: 2,
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: "#2C2C2C",
        gap: 12,
    },
    modeSelected: {
        borderColor: "#FF6B6B",
    },
    modeLabel: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
});

export default WardrobeScreen;
