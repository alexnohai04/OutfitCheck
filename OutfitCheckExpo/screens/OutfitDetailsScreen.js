import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    Alert,
    StyleSheet,
    TouchableOpacity
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
            <TouchableOpacity
                style={globalStyles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.titleRow}>
                <Text style={styles.title}>{outfit.name}</Text>
                <Icon
                    name={outfit.visible ? "lock-open-outline" : "lock-closed-outline"}
                    size={20}
                    color={'#666'}
                    style={{ marginLeft: 8 }}
                />
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
        marginTop: 10,
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
});

export default OutfitDetailsScreen;