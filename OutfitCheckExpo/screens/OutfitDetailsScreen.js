import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import globalStyles from '../styles/globalStyles';
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";

const OutfitDetailsScreen = () => {
    const route = useRoute();
    const { outfitId } = route.params;
    const [outfit, setOutfit] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOutfitDetails = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(`${API_URLS.GET_OUTFIT_DETAILS}/${outfitId}`);
                if (response.status === 200) {
                    setOutfit(response.data);
                } else {
                    Alert.alert("Eroare", "Nu s-au putut încărca detaliile outfit-ului.");
                }
            } catch (error) {
                Alert.alert("Eroare", "A apărut o problemă la încărcarea detaliilor outfit-ului.");
                console.error("❌ Eroare:", error);
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

    if (!outfit) {
        return (
            <SafeAreaView style={globalStyles.container}>
                <Text style={globalStyles.title}>Outfit-ul nu a fost găsit.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={globalStyles.container}>
            <Text style={globalStyles.title}>{outfit.name}</Text>
            <FlatList
                data={outfit.creator.clothingItems}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={{ alignItems: 'center', marginBottom: 15 }}>
                        <Image source={{ uri: item.imageUrl.replace('file://', '') }} style={{ width: 150, height: 150, borderRadius: 10 }} />
                        <Text style={globalStyles.outfitName}>{item.category.name}</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

export default OutfitDetailsScreen;
