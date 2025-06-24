import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    Alert,
    StyleSheet,
    TouchableOpacity, Modal, TouchableWithoutFeedback
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import globalStyles from "../styles/globalStyles";
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";
import { processClothingItems } from "../utils/imageUtils";
import OutfitPreview from "../reusable/OutfitPreview";
import Icon from "react-native-vector-icons/Ionicons";
import Toast from "react-native-toast-message";

const OutfitDetailsScreen = () => {
    const route = useRoute();
    const { outfitId } = route.params;
    const [outfit, setOutfit] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [allCategories, setAllCategories] = useState([]);
    const [tempSelectedCategoryIds, setTempSelectedCategoryIds] = useState([]);




    useEffect(() => {
        const fetchOutfitDetails = async () => {
            if (!outfitId) {
                Alert.alert("Error", "Invalid outfit ID.");
                return;
            }


            try {
                const response = await apiClient.get(`${API_URLS.GET_OUTFIT_DETAILS}/${outfitId}`);

                if (response.status === 200 && response.data) {
                    const processedItems = await processClothingItems(response.data.clothingItems);
                    setOutfit({ ...response.data, clothingItems: processedItems });
                    console.log(response.data)
                } else {
                    Alert.alert("Error", "Failed to load outfit details.");
                }
            } catch (error) {
                console.error("❌ Error fetching outfit details:", error);
                Alert.alert("Error", "There was a problem loading the outfit details.");
            } finally {
                setLoading(false);
            }
        };

        fetchOutfitDetails();
    }, [outfitId]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await apiClient.get(API_URLS.GET_OUTFIT_CATEGORIES);
                setAllCategories(res.data);
            } catch (e) {
                console.error("Failed to fetch categories", e);
            }
        };
        fetchCategories();
    }, []);


    const confirmDelete = () => {
        Alert.alert(
            "Delete outfit",
            "Are you sure you want to delete the outfit?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteOutfit(outfitId)
                }
            ]
        );
    };

    const deleteOutfit = async () => {
        try {
            await apiClient.delete(API_URLS.DELETE_OUTFIT(outfitId));
            navigation.goBack();
            Toast.show({
                type: 'success',
                text1: 'Outfit deleted',
                text2: 'The outfit was removed from your wardrobe.',
                position: 'top',
            });
        } catch (err) {
            console.error("Error deleting outfit:", err);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Could not delete the outfit.',
                position: 'top',
            });
        }
    };
    const updateOutfitCategories = async (newCategoryIds) => {
        try {
            const response = await apiClient.put(
                `${API_URLS.UPDATE_OUTFIT_CATEGORIES(outfitId)}`,
                { categoryIds: newCategoryIds }
            );
            if (response.status === 200) {
                setOutfit(prev => ({
                    ...response.data,
                    clothingItems: prev.clothingItems  // păstrează hainele procesate
                }));
                 // actualizează outfitul cu noile categorii
                Toast.show({ type: "success", text1: "Categories updated" });
            }
        } catch (error) {
            console.error("Failed to update outfit categories", error);
            Toast.show({ type: "error", text1: "Update failed" });
        }
    };


    const toggleVisibility = async () => {
        try {
            const updatedOutfit = { ...outfit, visible: !outfit.visible };
            const response = await apiClient.put(API_URLS.UPDATE_OUTFIT(outfitId), updatedOutfit);

            if (response.status === 200) {
                setOutfit(updatedOutfit);
                Toast.show({
                    type: 'success',
                    text1: 'Visibility updated',
                    text2: `Outfit is now ${updatedOutfit.visible ? 'Public' : 'Private'}.`,
                    position: 'top',
                });
            } else {
                throw new Error("Failed to update visibility");
            }
        } catch (err) {
            console.error("Error updating visibility:", err);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Could not update outfit visibility.',
                position: 'top',
            });
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={globalStyles.container}>
                <ActivityIndicator size="large" color="#FF6B6B" />
            </SafeAreaView>
        );
    }

    if (!outfit || !Array.isArray(outfit.clothingItems)) {
        return (
            <SafeAreaView style={globalStyles.container}>
                <Text style={globalStyles.title}>Outfit not found.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={globalStyles.container}>
            {/*<TouchableOpacity*/}
            {/*    style={globalStyles.backButton}*/}
            {/*    onPress={() => navigation.goBack()}*/}
            {/*>*/}
            {/*    <Icon name="arrow-back" size={24} color="#fff" />*/}
            {/*</TouchableOpacity>*/}

            <View style={styles.titleRow}>
                <Text style={styles.title}>{outfit.name}</Text>
                <Icon
                    name={outfit.visible ? "lock-open-outline" : "lock-closed-outline"}
                    size={20}
                    color={'#666'}
                    style={{ marginLeft: 8 }}
                />
            </View>

            <View style={styles.categoryTagsRow}>
                {outfit.categories && outfit.categories.map((cat) => (
                    <View key={cat.id} style={styles.categoryTag}>
                        <Text style={styles.categoryTagText}>{cat.name}</Text>
                    </View>
                ))}

                {/* 🔹 Buton "+" */}
                <TouchableOpacity
                    onPress={() => {
                        setTempSelectedCategoryIds(outfit.categories?.map(c => c.id) || []);
                        setCategoryModalVisible(true);
                    }}

                    style={[styles.categoryTag, styles.addCategoryTag]}
                >
                    <Text style={styles.categoryTagText}>+</Text>
                </TouchableOpacity>
            </View>


            <View style={styles.previewContainer}>
                <OutfitPreview clothingItems={outfit.clothingItems} size="large" enableTooltip />
            </View>

            <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.actionButton, styles.publicButton]} onPress={toggleVisibility}>
                    <Text style={globalStyles.buttonText}>
                        {outfit.visible ? 'Make Private' : 'Make Public'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={confirmDelete}>
                    <Icon
                        name="trash-outline"
                        size={18}
                        color="#fff"
                        style={{ marginRight: 6 }}
                    />
                    <Text style={globalStyles.buttonText}>Delete</Text>
                </TouchableOpacity>

            </View>

            <Modal
                visible={categoryModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setCategoryModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setCategoryModalVisible(false)}>
                <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalCard}>
                                <Text style={styles.modalTitle}>Select Categories</Text>

                                <View style={styles.categoryList}>
                                    {allCategories.map((cat) => {
                                        const isSelected = outfit.categories?.some(c => c.id === cat.id);
                                        return (
                                            <TouchableOpacity
                                                key={cat.id}
                                                style={[
                                                    styles.categoryOption,
                                                    tempSelectedCategoryIds.includes(cat.id) && styles.categoryOptionSelected
                                                ]}
                                                onPress={() => {
                                                    setTempSelectedCategoryIds(prev => {
                                                        if (prev.includes(cat.id)) {
                                                            return prev.filter(id => id !== cat.id);
                                                        } else {
                                                            return [...prev, cat.id];
                                                        }
                                                    });
                                                }}
                                            >
                                                <Text style={styles.categoryOptionText}>
                                                    {tempSelectedCategoryIds.includes(cat.id) ? '✓ ' : ''}{cat.name}
                                                </Text>
                                            </TouchableOpacity>

                                        );
                                    })}
                                </View>

                                <TouchableOpacity
                                    onPress={async () => {
                                        await updateOutfitCategories(tempSelectedCategoryIds);
                                        setCategoryModalVisible(false);
                                    }}
                                    style={[styles.modalCloseButton, { backgroundColor: "#FF6B6B", marginTop: 12 }]}
                                >
                                    <Text style={[styles.modalCloseText, { fontWeight: 'bold' }]}>Save</Text>
                                </TouchableOpacity>

                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>


        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    previewContainer: {
        marginTop: 20,
        alignItems: 'center',
        width: '80%',
        height: '80%',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        //marginTop: 5,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginTop: 20,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        minWidth: 130,
    },
    publicButton: {
        backgroundColor: '#666',
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#1E1E1E",
        padding: 20,
        borderRadius: 16,
        width: "80%",
    },
    modalTitle: {
        color: "#fff",
        fontSize: 18,
        marginBottom: 12,
        textAlign: "center",
        fontWeight:"bold"
    },
    modalItem: {
        paddingVertical: 12,
        borderBottomColor: "#333",
        borderBottomWidth: 1,
    },
    modalItemText: {
        color: "#fff",
        fontSize: 16
    },
    categoryTagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 8,
        gap: 8
    },
    categoryTag: {
        backgroundColor: '#333',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 20,
    },
    categoryTagText: {
        color: '#fff',
        fontSize: 12,
    },

    addCategoryTag: {
        backgroundColor: '#555', // un contrast mic
    },



    modalCard: {
        width: "85%",
        backgroundColor: "#2C2C2E",
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },

    categoryList: {
        width: "100%",
        marginVertical: 10,
    },

    categoryOption: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: "#3A3A3C",
        marginVertical: 5,
    },

    categoryOptionSelected: {
        backgroundColor: "#FF6B6B",
    },

    categoryOptionText: {
        color: "#fff",
        fontSize: 15,
    },

    modalCloseButton: {
        marginTop: 15,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#444",
        borderRadius: 10,
    },

    modalCloseText: {
        color: "#fff",
        fontWeight: "500"
    },


});

export default OutfitDetailsScreen;