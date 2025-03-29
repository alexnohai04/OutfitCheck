import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
    ActivityIndicator,
    SafeAreaView
} from 'react-native';
import { UserContext } from '../UserContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import apiClient from '../apiClient';
import API_URLS from '../apiConfig';
import globalStyles from '../styles/globalStyles';
import { processClothingItems } from "../utils/imageUtils";
import OutfitPreview from '../reusable/OutfitPreview';
import Toast from 'react-native-toast-message';



const SelectOutfitScreen = () => {
    const { userId } = useContext(UserContext);
    const navigation = useNavigation();
    const route = useRoute();
    const { date, onGoBack } = route.params;

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
                Alert.alert("Eroare", "Nu s-au putut încărca outfit-urile.");
            } finally {
                setLoading(false);
            }
        };

        fetchOutfits();
    }, [userId]);

    const handleLogOutfit = async (outfitId) => {
        const selectedOutfit = outfits.find(o => o.id === outfitId);

        if (!date) {
            // 👉 Caz: selectare pentru postare
            if (onGoBack && typeof onGoBack === 'function') {
                onGoBack(outfitId);
            }
            navigation.goBack();
            return;
        }

        // 👉 Caz: logare pentru o dată
        try {
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

            if (onGoBack && typeof onGoBack === 'function') {
                onGoBack(date, {
                    outfitId: selectedOutfit.id
                });
            }
            navigation.goBack();

        } catch (err) {
            console.error(err);
            Alert.alert("Eroare", "Nu s-a putut loga outfitul.");
        }
    };



    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.gridItem}
            onPress={() => handleLogOutfit(item.id)}
            activeOpacity={0.8}
        >

            {/*<Text style={styles.outfitName}>{item.name}</Text>*/}
            <OutfitPreview clothingItems={item.clothingItems} compact />
        </TouchableOpacity>
    );



    return (
        <SafeAreaView style={globalStyles.container}>
            <Text style={globalStyles.title}>What did you wear on {date}?</Text>
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
        width: '33.33%', // 🔥 fixăm 3 pe rând
        minHeight: 290,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },

    outfitName: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 4,
        textAlign: 'center',
    },
});

export default SelectOutfitScreen;
