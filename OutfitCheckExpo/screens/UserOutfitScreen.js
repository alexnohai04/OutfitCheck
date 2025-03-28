import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../UserContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import globalStyles from '../styles/globalStyles';
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";
import { Swipeable } from 'react-native-gesture-handler';
import { processClothingItems } from "../utils/imageUtils";
import Icon from "react-native-vector-icons/Ionicons";

const UserOutfitsScreen = () => {
    const [outfits, setOutfits] = useState([]);
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const { userId } = useContext(UserContext);

    useEffect(() => {
        const fetchOutfits = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(`${API_URLS.GET_OUTFITS_BY_USER}/${userId}`);
                console.log("📥 API Response:", response);

                if (response.status === 200) {
                    const updatedOutfits = await Promise.all(response.data.map(async (outfit) => {
                        const processedItems = await processClothingItems(outfit.clothingItems);
                        return { ...outfit, clothingItems: processedItems };
                    }));
                    setOutfits(updatedOutfits);
                } else {
                    Alert.alert("Error", response.data.message || "Could not load clothing items.");
                }
            } catch (error) {
                Alert.alert("Error", "An issue occurred while loading outfits.");
                console.error("❌ Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOutfits();
    }, [userId]);

    const deleteOutfit = async (outfitId) => {
        try {
            const response = await apiClient.delete(API_URLS.DELETE_OUTFIT(outfitId));
            if (response.status === 200) {
                setOutfits(prevOutfits => prevOutfits.filter(outfit => outfit.id !== outfitId));
                Alert.alert("Success", "Outfit deleted successfully!");
            } else {
                Alert.alert("Error", "Failed to delete outfit.");
            }
        } catch (error) {
            console.error("❌ Error deleting outfit:", error);
            Alert.alert("Error", "Could not delete outfit.");
        }
    };

    const confirmDelete = (outfitId) => {
        Alert.alert(
            "Are you sure?",
            "Do you really want to delete this outfit?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Yes", onPress: () => deleteOutfit(outfitId) }
            ]
        );
    };
    if (loading) {
        return (
            <View style={globalStyles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
        );
    }


    const renderRightActions = (outfitId) => (
        <TouchableOpacity style={globalStyles.deleteButton} onPress={() => confirmDelete(outfitId)}>
            <Text style={globalStyles.deleteText}>Delete</Text>
        </TouchableOpacity>
    );

    const renderItem = ({ item }) => (
        <Swipeable renderRightActions={() => renderRightActions(item.id)}>
            <View style={[globalStyles.outfitContainer, styles.outfitBox]}>
                <Text style={globalStyles.title}>{item.name}</Text>
                {Array.isArray(item.clothingItems) && item.clothingItems.length > 0 ? (
                    <FlatList
                        data={item.clothingItems}
                        keyExtractor={(clothingItem) => clothingItem.id?.toString() || Math.random().toString()}
                        horizontal
                        renderItem={({ item: clothingItem }) => (
                            clothingItem.base64Image ? (
                                <Image source={{ uri: clothingItem.base64Image }} style={styles.outfitImage} />
                            ) : null
                        )}
                    />
                ) : null}
                <TouchableOpacity
                    style={globalStyles.button}
                    onPress={() => {
                        console.log("🔎 Sent Outfit ID:", item.id);
                        navigation.navigate('OutfitDetails', { outfitId: item.id });
                    }}
                >
                    <Text style={globalStyles.buttonText}>Show Outfit</Text>
                </TouchableOpacity>
            </View>
        </Swipeable>
    );

    return (
        <SafeAreaView style={globalStyles.container}>

            <Text style={globalStyles.title}>Your Outfits</Text>
            <TouchableOpacity
                style={globalStyles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

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

const styles = StyleSheet.create({
    outfitBox: {
        padding: 15,
        backgroundColor: '#1E1E1E',
        borderRadius: 10,
        marginVertical: 5,
        marginHorizontal: 15
    },

    outfitImage: {
        width: 80,
        height: 80,
        marginRight: 10,
        borderRadius: 5,
    },
});

export default UserOutfitsScreen;
