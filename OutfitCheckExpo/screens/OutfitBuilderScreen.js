import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    PanResponder,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Reanimated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Animated } from "react-native";
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";
import globalStyles from "../styles/globalStyles";
import { UserContext } from "../UserContext";
import { useNavigation } from "@react-navigation/native";
import base64 from "react-native-base64";
import OutfitPreview from "../reusable/OutfitPreview";
import Toast from "react-native-toast-message";

const { height } = Dimensions.get("window");

const arrayBufferToBase64 = (buffer) => {
    let binary = "";
    let bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return base64.encode(binary);
};

const OutfitBuilderScreen = () => {
    const [wardrobe, setWardrobe] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [outfitName, setOutfitName] = useState("");
    const [loading, setLoading] = useState(true);
    const [nameError, setNameError] = useState(false);

    const navigation = useNavigation();
    const { userId } = useContext(UserContext);

    const panelPosition = useSharedValue(height * 0.5);
    const isDragging = useRef(false);

    const CATEGORY_ORDER = ["Headwear", "Topwear", "Bottomwear", "Footwear", "FullBodywear"];
    const CATEGORY_IDS = {
        Headwear: 4,
        Topwear: 1,
        Bottomwear: 2,
        Footwear: 3,
        FullBodywear: 5,
    };


    const shakeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const fetchClothingItems = async () => {
            try {
                const response = await apiClient.get(`${API_URLS.GET_CLOTHING_ITEMS_BY_USER}/${userId}`);
                const updatedItems = await Promise.all(
                    response.data.map(async (item) => {
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
                setWardrobe(updatedItems);
            } catch (error) {
                Toast.show({
                    type: "error",
                    text1: "Failed to load wardrobe",
                    text2: "Please try again later.",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchClothingItems();
    }, [userId]);

    const toggleItemSelection = (item) => {
        setSelectedItems((prevItems) => {
            if (prevItems.some((i) => i.id === item.id)) {
                return prevItems.filter((i) => i.id !== item.id);
            }

            if (item.category.id === CATEGORY_IDS.Topwear) {
                const tops = prevItems.filter((i) => i.category.id === CATEGORY_IDS.Topwear);
                if (tops.length < 2) return [...prevItems, item];
                return [...tops.slice(1), item, ...prevItems.filter((i) => i.category.id !== CATEGORY_IDS.Topwear)];
            }

            return [...prevItems.filter((i) => i.category.id !== item.category.id), item];
        });
    };

    const triggerShake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 6, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -6, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
        ]).start();
    };

    const saveOutfit = async () => {
        if (selectedItems.length === 0) {
            Toast.show({
                type: "error",
                text1: "No items selected",
                text2: "Please select at least one clothing item.",
                position: "top",
            });
            return;
        }

        if (!outfitName || outfitName.trim() === "") {
            setNameError(true);
            triggerShake();
            return;
        }

        setNameError(false);
        const newOutfit = {
            name: outfitName.trim(),
            creatorId: userId,
            items: selectedItems.map((i) => i.id),
        };

        try {
            await apiClient.post(API_URLS.CREATE_OUTFIT, newOutfit);
            Toast.show({
                type: "success",
                text1: "Outfit saved!",
                text2: "You can now view it in My Outfits.",
            });
            navigation.navigate("UserOutfits");
        } catch (error) {
            console.error("❌ Error saving outfit:", error);
            Toast.show({
                type: "error",
                text1: "Failed to save outfit",
                text2: "Please try again later.",
            });
        }
    };

    const animatedStyle = useAnimatedStyle(() => ({
        top: withSpring(panelPosition.value, { damping: 20, stiffness: 150 }),
    }));

    const outfitListScale = useAnimatedStyle(() => {
        const scaleFactor = panelPosition.value > height * 0.6 ? 1.2 : 1.0;
        const translateY = panelPosition.value > height * 0.6 ? 30 : 0;
        const marginTop = panelPosition.value > height * 0.6 ? 40 : 10;

        return {
            transform: [{ scale: withSpring(scaleFactor) }, { translateY: withSpring(translateY) }],
            marginTop: withSpring(marginTop),
        };
    });

    const panResponder = useMemo(() => {
        return PanResponder.create({
            onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 10,
            onPanResponderGrant: (_, gesture) => {
                const touchY = gesture.y0;
                if (touchY > panelPosition.value - 30 && touchY < panelPosition.value + 30) {
                    isDragging.current = true;
                }
            },
            onPanResponderMove: (_, gesture) => {
                if (isDragging.current) {
                    panelPosition.value = Math.max(height * 0.5, Math.min(height * 0.7, panelPosition.value + gesture.dy));
                }
            },
            onPanResponderRelease: () => {
                isDragging.current = false;
                panelPosition.value = panelPosition.value > height * 0.6 ? height * 0.7 : height * 0.5;
            },
        });
    }, []);

    if (loading) {
        return (
            <View style={globalStyles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={styles.outfitContainer}>
                <Animated.View style={[{ transform: [{ translateX: shakeAnim }] }]}>
                    <TextInput
                        style={[
                            styles.input,
                            nameError && { borderColor: "#ff0000", borderWidth: 1 },
                        ]}
                        value={outfitName}
                        onChangeText={setOutfitName}
                        placeholder="Name your outfit..."
                        placeholderTextColor="#888"
                    />
                </Animated.View>

                {selectedItems.length > 0 && (
                    <Reanimated.View style={[styles.outfitListContainer, outfitListScale]}>
                        <OutfitPreview clothingItems={selectedItems} />
                    </Reanimated.View>
                )}

            </View>

            <Reanimated.View
                style={[styles.panelContainer, animatedStyle]}
                {...panResponder.panHandlers}
            >
                <TouchableOpacity style={styles.panelHandle} />
                <Text style={globalStyles.title}>Select clothing items</Text>

                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
                    nestedScrollEnabled={true}
                >
                    {CATEGORY_ORDER.map(category => (
                        <View key={category} style={styles.sectionContainer}>
                            <Text style={styles.sectionHeader}>{category}</Text>
                            <FlatList
                                data={wardrobe.filter(item => item.category.id === CATEGORY_IDS[category])}
                                keyExtractor={(item) => item.id.toString()}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => toggleItemSelection(item)}
                                        style={[
                                            styles.clothingItem,
                                            selectedItems.some((i) => i.id === item.id) && styles.selectedItem,
                                        ]}
                                    >
                                        <Image source={{ uri: item.base64Image }} style={styles.image} />
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    ))}

                    <TouchableOpacity style={globalStyles.button} onPress={saveOutfit}>
                        <Text style={globalStyles.buttonText}>Save Outfit</Text>
                    </TouchableOpacity>
                </ScrollView>
            </Reanimated.View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeContainer: { flex: 1, backgroundColor: "#2C2C2C" },
    outfitContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        paddingVertical: 20,
    },
    input: {
        width: "50%",
        padding: 8,
        marginBottom: 5,
        borderWidth: 1,
        borderColor: "#444",
        borderRadius: 8,
        backgroundColor: "#3A3A3A",
        color: "#FFFFFF",
        textAlign: "center",
        fontSize: 18,

    },
    outfitListContainer: {
        marginTop: 20,
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        width: "60%",
        maxHeight:"50%"
    },
    panelContainer: {
        position: "absolute",
        width: "100%",
        height: height * 0.6,
        backgroundColor: "#1E1E1E",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        flex: 1,
    },
    sectionContainer: { marginBottom: 10 },
    sectionHeader: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFFFFF",
        paddingVertical: 10,
        backgroundColor: "#333",
        textAlign: "center",
    },
    clothingItem: {
        margin: 5,
        alignItems: "center",
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#333",
    },
    selectedItem: {
        borderColor: "#FF6B6B",
        borderWidth: 2,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 10,
    },
    panelHandle: {
        width: 60,
        height: 6,
        backgroundColor: "#888",
        borderRadius: 3,
        alignSelf: "center",
        marginBottom: 10,
    },
});

export default OutfitBuilderScreen;