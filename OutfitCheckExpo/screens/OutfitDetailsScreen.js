import React, { useEffect, useState } from "react";
import {View, Text, ActivityIndicator, Alert, StyleSheet, TouchableOpacity} from "react-native";
import {useNavigation, useRoute} from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import globalStyles from "../styles/globalStyles";
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";
import { processClothingItems } from "../utils/imageUtils";
import OutfitPreview from "../reusable/OutfitPreview";
import Icon from "react-native-vector-icons/Ionicons"; // 👈 Importăm componenta

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
});

export default OutfitDetailsScreen;
