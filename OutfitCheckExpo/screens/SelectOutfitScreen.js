import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView
} from 'react-native';
import { UserContext } from '../UserContext';
import apiClient from '../apiClient';
import API_URLS from '../apiConfig';
import globalStyles from '../styles/globalStyles';
import { processClothingItems } from "../utils/imageUtils";
import OutfitPreview from '../reusable/OutfitPreview';
import Toast from 'react-native-toast-message';

const SelectOutfitScreen = ({ date, onClose, onOutfitLogged }) => {
    const { userId } = useContext(UserContext);
    const [outfits, setOutfits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOutfits = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(`${API_URLS.GET_OUTFITS_BY_USER}/${userId}`);
                const updatedOutfits = await Promise.all(response.data.map(async (outfit) => {
                    const processedItems = await processClothingItems(outfit.clothingItems);
                    return { ...outfit, clothingItems: processedItems };
                }));
                setOutfits(updatedOutfits);
            } catch (error) {
                console.error("❌ Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOutfits();
    }, [userId]);

    const handleLogOutfit = async (outfitId) => {
        try {
            // 1. Dacă avem date, logăm outfit-ul în calendar
            if (date) {
                await apiClient.post(API_URLS.LOG_OUTFIT, {
                    outfitId,
                    date,
                    userId
                });

                Toast.show({
                    type: 'success',
                    text1: 'Outfit logged',
                    text2: 'Your outfit was saved successfully.',
                });
            }

            // 2. În orice caz, trimitem outfitul selectat înapoi
            if (onOutfitLogged) {
                onOutfitLogged(date, { outfitId }); // sau doar { outfitId } dacă vrei
            }

        } catch (err) {
            console.error("❌ Failed to log outfit:", err);
            Toast.show({
                type: 'error',
                text1: 'Failed',
                text2: 'Could not log your outfit.',
            });
        }
    };


    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.gridItem}
            onPress={() => handleLogOutfit(item.id)}
            activeOpacity={0.8}
        >
            <OutfitPreview clothingItems={item.clothingItems} compact />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={globalStyles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#FF6B6B" />
            ) : (
                <FlatList
                    data={outfits}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    numColumns={3}
                    columnWrapperStyle={styles.row}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    row: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    gridItem: {
        width: '33.33%',
        minHeight: 290,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    closeButton: {
        marginTop: 12,
        paddingVertical: 8,
        backgroundColor: '#444',
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 20,
    },
    closeText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    }
});

export default SelectOutfitScreen;