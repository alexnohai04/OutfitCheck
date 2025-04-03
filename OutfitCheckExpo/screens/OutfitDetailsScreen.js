import React, { useEffect, useState } from "react";
import {View, Text, ActivityIndicator, Alert, StyleSheet, TouchableOpacity} from "react-native";
import {useNavigation, useRoute} from "@react-navigation/native";
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


    const deleteOutfit = async (date) => {
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

            <Text style={globalStyles.title}>{outfit.name}</Text>

            <View style={styles.previewContainer}>
                    <OutfitPreview clothingItems={outfit.clothingItems} size="large" />
            </View>
                <TouchableOpacity style={styles.deleteButton} onPress={confirmDelete}>
                    <Text style={globalStyles.deleteText}>Delete</Text>
                </TouchableOpacity>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    previewContainer: {
        marginTop: 20,
        alignItems: 'center',
        width: '80%',
        height: '80%'
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
        width: 90,
        height: 20,
        borderRadius: 10,
        //flex: 1,
        margin: 20
    },

});

export default OutfitDetailsScreen;
