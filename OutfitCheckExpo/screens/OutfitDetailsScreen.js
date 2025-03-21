import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import globalStyles from "../styles/globalStyles";
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";
import { processClothingItems } from "../utils/imageUtils";

const CATEGORY_ORDER = ["Hat", "Top", "Pants", "Shoes"];
const CATEGORY_IDS = {
    Hat: 4,
    Top: 1,
    Pants: 2,
    Shoes: 3,
};

const OutfitDetailsScreen = () => {
    const route = useRoute();
    const { outfitId } = route.params;
    const [outfit, setOutfit] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOutfitDetails = async () => {
            if (!outfitId) {
                Alert.alert("Error", "Invalid outfit ID.");
                return;
            }

            setLoading(true);
            console.log(`📡 Fetching outfit details for ID: ${outfitId}`);

            try {
                const response = await apiClient.get(`${API_URLS.GET_OUTFIT_DETAILS}/${outfitId}`);
                console.log("✅ API Response:", response.data);

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
            <Text style={globalStyles.title}>{outfit.name}</Text>

            <FlatList
                data={CATEGORY_ORDER.flatMap(category => {
                    const items = outfit.clothingItems.filter(item => item.category?.id === CATEGORY_IDS[category]);
                    return category === "Top" && items.length > 0 ? [items] : items;
                })}
                keyExtractor={(item, index) => (Array.isArray(item) ? `top-group-${index}` : item.id?.toString() || `unknown-${index}`)}
                renderItem={({ item }) => {
                    if (!item) return null;

                    const isHatOrShoes = !Array.isArray(item) && (item.category?.id === CATEGORY_IDS.Hat || item.category?.id === CATEGORY_IDS.Shoes);
                    const imageStyle = isHatOrShoes
                        ? { width: styles.image.width * 0.5, height: styles.image.height * 0.5 }
                        : styles.image;

                    return Array.isArray(item) ? (
                        <View style={{ flexDirection: "row", justifyContent: "center" }}>
                            {item.map((topItem) => (
                                <View key={topItem.id} style={styles.outfitItem}>
                                    <Image source={{ uri: topItem.base64Image }} style={styles.image} />
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.outfitItemContainer}>
                            <View style={styles.outfitItem}>
                                <Image source={{ uri: item.base64Image }} style={imageStyle} />
                            </View>
                        </View>
                    );
                }}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    outfitItemContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    outfitItem: {
        padding: 15,
        backgroundColor: "#333",
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 5,
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 10,
    },
});

export default OutfitDetailsScreen;