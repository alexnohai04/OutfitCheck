import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../UserContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import globalStyles from '../styles/globalStyles';
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";

const UserOutfitsScreen = () => {
    const [outfits, setOutfits] = useState([]);
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const { userId } = useContext(UserContext);

    useEffect(() => {
        // Fetch outfits from API
        const fetchOutfits = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(`${API_URLS.GET_OUTFITS_BY_USER}/${userId}`);
                console.log("📥 Răspuns API:", response);

                if (response.status === 200) {
                    setOutfits(response.data);
                } else {
                    Alert.alert("Eroare", response.data.message || "Nu s-au putut încărca articolele vestimentare.");
                }
            } catch (error) {
                Alert.alert("Eroare", "A apărut o problemă la încărcarea hainelor.");
                console.error("❌ Eroare:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOutfits();
    }, [userId]);

    const renderItem = ({ item }) => (
        <View style={[globalStyles.outfitContainer, { padding: 15, backgroundColor: '#3A3A3A', borderRadius: 10, marginVertical: 10 }]}>
            <Text style={globalStyles.title}>{item.name}</Text>
            {Array.isArray(item.clothingItems) && item.clothingItems.length > 0 ? (
                <FlatList
                    data={item.clothingItems}
                    keyExtractor={(clothingItem) => clothingItem.id?.toString() || Math.random().toString()}
                    horizontal
                    renderItem={({ item: clothingItem }) => (
                        clothingItem.imageUrl ? (
                            <Image source={{ uri: clothingItem.imageUrl.replace('file://', '') }} style={[globalStyles.outfitImage, { width: 80, height: 80, marginRight: 10 }]} />
                        ) : null
                    )}
                />
            ) : null}
            <TouchableOpacity
                style={globalStyles.button}
                onPress={() => navigation.navigate('OutfitDetails', { outfitId: item.id })}
            >
                <Text style={globalStyles.buttonText}>Vezi detalii</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={globalStyles.container}>
            <Text style={globalStyles.title}>Outfit-urile tale</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#FF6B6B" />
            ) : (
                <FlatList
                    data={outfits}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                />
            )}
        </SafeAreaView>
    );
};

export default UserOutfitsScreen;
