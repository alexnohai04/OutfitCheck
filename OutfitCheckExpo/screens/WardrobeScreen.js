// screens/WardrobeScreen.js

import React, {useState, useEffect, useContext, useCallback} from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    Image,
    Alert,
    Modal, TouchableWithoutFeedback
} from "react-native";
import {useFocusEffect, useNavigation} from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";
import { UserContext } from "../UserContext";
import { processClothingItems } from "../utils/imageUtils";
import OutfitPreview from "../reusable/OutfitPreview";
import { Swipeable } from "react-native-gesture-handler";
import globalStyles from "../styles/globalStyles";
import Toast from "react-native-toast-message";
import { SYMBOL_ICONS } from "../constants/symbolIcons";

const WardrobeScreen = () => {
    const navigation = useNavigation();
    const { userId } = useContext(UserContext);
    const [outfits, setOutfits] = useState([]);
    const [clothingItems, setClothingItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [mode, setMode] = useState("outfits"); // "outfits" or "clothes"
    const [modeModalVisible, setModeModalVisible] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (mode === "outfits") {
                const response = await apiClient.get(`${API_URLS.GET_OUTFITS_BY_USER}/${userId}`);
                const processedOutfits = await Promise.all(
                    response.data.map(async (outfit) => {
                        const processedItems = await processClothingItems(outfit.clothingItems);
                        return { ...outfit, clothingItems: processedItems };
                    })
                );
                setOutfits(processedOutfits.sort((a, b) => b.id - a.id));
            } else {
                const response = await apiClient.get(`${API_URLS.GET_CLOTHING_ITEMS_BY_USER}/${userId}`);
                if (response.status === 200) {
                    const updatedItems = await processClothingItems(response.data);
                    setClothingItems(updatedItems.sort((a, b) => b.id - a.id));
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [userId, mode])
    );

    const outfitCategories = ["All", ...new Set(outfits.map(item => item.category?.name).filter(Boolean))];
    const clothingCategories = ["All", ...new Set(clothingItems.map(item => item.category.name))];
    const categories = mode === "outfits" ? outfitCategories : clothingCategories;

    const filteredOutfits = selectedCategory === "All"
        ? outfits
        : outfits.filter(item => item.category?.name === selectedCategory);

    const filteredClothes = selectedCategory === "All"
        ? clothingItems
        : clothingItems.filter(item => item.category.name === selectedCategory);

    const dataWithAddButton = mode === "outfits"
        ? [{ isAddButton: true }, ...filteredOutfits]
        : filteredClothes;

    const renderOutfitItem = ({ item }) => {
        if (item.isAddButton) {
            return (
                <TouchableOpacity
                    style={styles.gridItem}
                    onPress={() => navigation.navigate("OutfitBuilder")}
                >
                    <View style={styles.outfitPreviewWrapper}>
                        <View style={styles.outfitPreviewContainer}>
                            <Ionicons name="add" size={40} color="#FFF" />
                        </View>
                    </View>
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                style={styles.gridItem}
                onPress={() => navigation.navigate('OutfitDetails', { outfitId: item.id })}
            >
                <OutfitPreview clothingItems={item.clothingItems} compact />
            </TouchableOpacity>
        );
    };

    const renderClothingItem = ({ item }) => (
        <Swipeable renderRightActions={() => renderRightActions(item.id)}>
            <View style={styles.clothingItemContainer}>
                {item.base64Image ? (
                    <Image source={{ uri: item.base64Image }} style={styles.image} />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Text style={styles.imagePlaceholderText}>No Image</Text>
                    </View>
                )}
                <View style={styles.infoContainer}>
                    <Text style={styles.itemText}>Colors: {item.colors.join(', ')}</Text>
                    <Text style={styles.itemText}>Material: {item.material}</Text>
                    <Text style={styles.itemText}>Category: {item.category.name}</Text>
                    <Text style={styles.itemText}>Brand: {item.brand}</Text>

                    {item.careSymbols && item.careSymbols.length > 0 && (
                        <View style={styles.careIconsContainer}>
                            {item.careSymbols.map((symbol) => {
                                const icon = SYMBOL_ICONS[symbol];
                                return icon ? (
                                    <Image
                                        key={symbol}
                                        source={icon}
                                        style={styles.careIcon}
                                        resizeMode="contain"
                                    />
                                ) : null;
                            })}
                        </View>
                    )}
                </View>
            </View>
        </Swipeable>
    );
    const renderRightActions = (itemId) => (
        <TouchableOpacity style={globalStyles.deleteButton} onPress={() => confirmDelete(itemId)}>
            <Text style={globalStyles.deleteText}>Delete</Text>
        </TouchableOpacity>
    );

    const confirmDelete = (itemId) => {
        Alert.alert(
            "Are you sure?",
            "Do you really want to delete this clothing item?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Yes", onPress: () => deleteClothingItem(itemId) }
            ]
        );
    };

    const deleteClothingItem = async (itemId) => {
        try {
            const response = await apiClient.delete(API_URLS.DELETE_CLOTHING_ITEM(itemId));
            if (response.status === 200) {
                setClothingItems(prevItems => prevItems.filter(item => item.id !== itemId));
                Toast.show({
                    type: 'success',
                    text1: 'Clothing item deleted',
                    text2: 'The clothing item was removed from your wardrobe.',
                    position: 'top',
                });
            } else {
                Alert.alert("Error", "Failed to delete clothing item.");
            }
        } catch (error) {
            Alert.alert("Error", "Could not delete clothing item.");
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity onPress={() => setModeModalVisible(true)}>
            <View style={styles.titleWrapper}>
                <Text style={styles.title}>{mode === "outfits" ? "Your Outfits" : "Your Clothes"}</Text>

                    <Ionicons name="chevron-down" size={20} color="#FFF" style={styles.arrowIcon} />

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
                                <Text style={styles.modalTitle}>Select Your Mode:</Text>
                                <View style={styles.modeOptionsContainer}>
                                    <TouchableOpacity
                                        style={[styles.modeOptionBox, mode === "outfits" && styles.modeSelected]}
                                        onPress={() => {
                                            setMode("outfits");
                                            setModeModalVisible(false);
                                        }}
                                    >
                                        <Ionicons name="layers-outline" size={24} color="#FFF" style={styles.modeIcon} />
                                        <Text style={styles.modeLabel}>Your Outfits</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.modeOptionBox, mode === "clothes" && styles.modeSelected]}
                                        onPress={() => {
                                            setMode("clothes");
                                            setModeModalVisible(false);
                                        }}
                                    >
                                        <Ionicons name="shirt-outline" size={24} color="#FFF" style={styles.modeIcon} />
                                        <Text style={styles.modeLabel}>Your Clothes</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>


            <View style={styles.buttonsContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryScroll}
                >
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category}
                            style={[
                                styles.categoryButton,
                                selectedCategory === category && styles.categoryButtonSelected
                            ]}
                            onPress={() => setSelectedCategory(category)}
                        >
                            <Text style={styles.categoryText}>{category}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                key={mode}
                data={dataWithAddButton}
                keyExtractor={(item, index) => item.id?.toString() || `add-${index}`}
                renderItem={mode === "outfits" ? renderOutfitItem : renderClothingItem}
                numColumns={mode === "outfits" ? 3 : 1}
                columnWrapperStyle={mode === "outfits" ? styles.row : null}
                contentContainerStyle={styles.listContainer}
            />
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
    titleWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        gap: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
        textAlign: "center",
    },
    arrowIcon: {
        marginTop: 2,
    },
    listContainer: {
        paddingBottom: 100,
        paddingHorizontal: 10,
    },
    row: {
        flex: 1,
        //justifyContent: "space-between",
    },
    gridItem: {
        width: "30%",
        margin: 5,
        alignItems: "flex-start",
        justifyContent: "center",
    },
    outfitPreviewWrapper: {
        width: '100%',
        borderWidth: 2,
        borderColor: "#3A3A3A",
        borderRadius: 16,
        borderStyle: "dashed",
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 290,
    },
    outfitPreviewContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#1E1E1E",
    },
    buttonsContainer: {
        height: 50,
        marginBottom: 10,
    },
    categoryScroll: {
        flexGrow: 0,
        padding: 5,
    },
    categoryButton: {
        minWidth: 80,
        height: 40,
        paddingHorizontal: 16,
        backgroundColor: "#564c4c",
        borderRadius: 8,
        marginHorizontal: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    categoryButtonSelected: {
        backgroundColor: "#FF6B6B",
    },
    categoryText: {
        color: "#FFFFFF",
        fontSize: 16,
    },
    clothingItemContainer: {
        flexDirection: "row",
        backgroundColor: "#3A3A3A",
        padding: 15,
        borderRadius: 10,
        marginVertical: 5,
        marginHorizontal: 15,
        alignItems: "center",
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 15,
    },
    imagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 15,
        backgroundColor: "#444",
        justifyContent: "center",
        alignItems: "center",
    },
    imagePlaceholderText: {
        color: "#A0A0A0",
        fontSize: 14,
    },
    infoContainer: {
        flex: 1,
    },
    itemText: {
        fontSize: 16,
        color: "#FFFFFF",
        marginBottom: 5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1E1E1E',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    modeButton: {
        paddingVertical: 12,
    },
    modeText: {
        color: '#FF6B6B',
        fontSize: 16,
        fontWeight: '600',
    },

    modalContentEnhanced: {
        backgroundColor: '#1E1E1E',
        paddingVertical: 24,
        paddingHorizontal: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        alignItems: 'center',
    },
    modeOptionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 16,
    },
    modeOptionBox: {
        flex: 1,
        borderColor: '#444',
        borderWidth: 2,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2C2C2C',
    },
    modeSelected: {
        borderColor: '#FF6B6B',
    },
    modeLabel: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 8,
    },
    modeIcon: {
        marginBottom: 4,
    },
    careIconsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 10,
        gap: 6,
    },

    careIcon: {
        width: 24,
        height: 24,
    },
});

export default WardrobeScreen;
