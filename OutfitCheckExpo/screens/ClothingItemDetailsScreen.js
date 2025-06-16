import React, { useRef, useEffect, useState } from "react";
import {
    SafeAreaView,
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Animated,
    PanResponder,
    Dimensions,
    FlatList
} from "react-native";
import Toast from 'react-native-toast-message';
import { SYMBOL_ICONS } from "../constants/symbolIcons";
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";
import OutfitPreview from "../reusable/OutfitPreview";
import { processClothingItems } from "../utils/imageUtils";
import { fetchBrandLogo } from "../utils/logoService";
import {Ionicons} from "@expo/vector-icons";
import { formatLastUsedDate, getDonationSuggestion } from '../utils/dateUtils';


const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.6;
const CLOSED_OFFSET = SCREEN_HEIGHT * 0.4;
const DRAG_THRESHOLD = 50;


const ClothingItemDetailsScreen = ({ route, navigation }) => {
    const { item } = route.params;
    const [logoUrl, setLogoUrl] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [outfits, setOutfits] = useState([]);
    // Local copy if you want to update after delete or wash
    const [clothingItem, setClothingItem] = useState(item);
    const [lastUsed, setLastUsed] = useState(null);


    // Fetch brand logo
    useEffect(() => {
        (async () => {
            const url = await fetchBrandLogo(item.brand);
            setLogoUrl(url);
        })();
    }, [item.brand]);

    // Delete function
    const deleteClothingItem = async (itemId) => {
        try {
            const response = await apiClient.delete(API_URLS.DELETE_CLOTHING_ITEM(itemId));
            if (response.status === 200) {
                Toast.show({ type: 'success', text1: 'Item deleted' });
                navigation.goBack();
            }
        } catch (error) {
            console.error("Error deleting clothing item", error);
            Toast.show({ type: 'error', text1: 'Delete failed' });
        }
    };

    // Wash function
    const washClothingItem = async (itemId) => {
        if (clothingItem.inLaundry) {
            Toast.show({ type: 'info', text1: 'Item already in laundry' });
            return;
        }
        try {
            const response = await apiClient.patch(API_URLS.TOGGLE_LAUNDRY(itemId), { inLaundry: true });
            if (response.status === 200) {
                setClothingItem(prev => ({ ...prev, inLaundry: true }));
                Toast.show({ type: 'success', text1: 'Item sent to laundry' });
            }
        } catch (error) {
            console.error("Error sending clothing item to laundry", error);
            Toast.show({ type: 'error', text1: 'Wash failed' });
        }
    };

    // Animation values
    const initialImageHeight = SCREEN_HEIGHT * 0.35;
    const minimizedScale = (SCREEN_HEIGHT * 0.22) / initialImageHeight;
    const imageScale = useRef(new Animated.Value(1)).current;
    const imageTranslateY = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(CLOSED_OFFSET)).current;

    const openSheet = () => {
        Animated.parallel([
            Animated.spring(translateY, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
            Animated.timing(imageScale, { toValue: minimizedScale, duration: 300, useNativeDriver: true }),
            Animated.timing(imageTranslateY, { toValue: -(initialImageHeight * (1 - minimizedScale) / 2) - 200, duration: 300, useNativeDriver: true })
        ]).start(() => setIsOpen(true));
    };

    const closeSheet = () => {
        Animated.parallel([
            Animated.spring(translateY, { toValue: CLOSED_OFFSET, tension: 60, friction: 10, useNativeDriver: true }),
            Animated.timing(imageScale, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(imageTranslateY, { toValue: 0, duration: 300, useNativeDriver: true })
        ]).start(() => setIsOpen(false));
    };

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
            onPanResponderMove: (_, g) => {
                const offset = isOpen ? g.dy : CLOSED_OFFSET + g.dy;
                if (offset >= 0 && offset <= CLOSED_OFFSET) translateY.setValue(offset);
            },
            onPanResponderRelease: (_, g) => {
                if (g.dy < -DRAG_THRESHOLD) openSheet();
                else if (g.dy > DRAG_THRESHOLD) closeSheet();
                else (isOpen ? openSheet() : closeSheet());
            }
        })
    ).current;

    useEffect(() => {
        translateY.setValue(CLOSED_OFFSET);
        (async () => {
            try {
                const res = await apiClient.get(API_URLS.GET_OUTFITS_CONTAINING_CLOTHING_ITEM(item.id));
                const processed = await Promise.all(
                    res.data.map(async o => ({ ...o, clothingItems: await processClothingItems(o.clothingItems) }))
                );
                setOutfits(processed.sort((a,b) => b.id - a.id));

                const lastUsedRes = await apiClient.get(API_URLS.GET_LAST_USED_DATE(item.id));
                setLastUsed(lastUsedRes.data.lastUsed);
            } catch (e) { console.error(e); }
        })();
    }, []);

    const renderOutfits = () => (
        <FlatList
            data={outfits}
            keyExtractor={(it,idx) => it.id?.toString()||`add-${idx}`}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={styles.horizontalItem}
                    onPress={() => navigation.navigate('OutfitDetails',{ outfitId: item.id })}
                >
                    <OutfitPreview clothingItems={item.clothingItems} compact />
                </TouchableOpacity>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
        />
    );

    return (
        <SafeAreaView style={styles.container}>

            {/* Title row */}
            <View style={styles.titleRow}>
                <Text style={styles.screenHeader}>{clothingItem.brand} {clothingItem.articleType}</Text>
            </View>
            {/* Image center */}
            <View style={styles.imageContainerWrapper}>
                <Animated.View style={[styles.imageWrapper, { transform: [{ translateY: imageTranslateY }, { scale: imageScale }] }]}>
                    <Animated.Image source={{ uri: clothingItem.base64Image }} style={styles.imageFull} resizeMode="cover" />
                </Animated.View>
            </View>
            {/* Details sheet */}
            <Animated.View style={[styles.panelContainer, { transform: [{ translateY }] }]}>
                <View {...panResponder.panHandlers}>
                    <TouchableOpacity style={styles.panelHandle} onPress={() => isOpen?closeSheet():openSheet()} />
                </View>
                <Text style={styles.title}>Item Details</Text>
                <ScrollView contentContainerStyle={styles.detailsContainer}>
                    <View style={styles.detailsGrid}>
                        <View style={styles.detailCell}>
                            <Text style={styles.detailLabel}>Color</Text>
                            <Text style={styles.detailValue}>{clothingItem.baseColor}</Text>
                        </View>
                        <View style={styles.detailCell}>
                            <Text style={styles.detailLabel}>Brand</Text>
                            <View style={styles.brandRow}>
                                <Text style={styles.detailValue}>{clothingItem.brand||'Unknown'}</Text>
                                {logoUrl && (
                                    <Image source={{ uri: logoUrl }} style={styles.brandLogoSmall} resizeMode="contain" />
                                )}
                            </View>
                        </View>
                        <View style={styles.detailCell}>
                            <Text style={styles.detailLabel}>Style</Text>
                            <Text style={styles.detailValue}>{clothingItem.usage}</Text>
                        </View>
                        <View style={styles.detailCell}>
                            <Text style={styles.detailLabel}>Season</Text>
                            <Text style={styles.detailValue}>{clothingItem.season}</Text>
                        </View>
                    </View>
                    {clothingItem.careSymbols?.length>0 && (
                        <View style={styles.instructionsSection}>
                            <Text style={styles.sectionTitle}>Care Instructions</Text>
                            {clothingItem.careSymbols.map(sym=> (
                                <View key={sym} style={styles.careInstructionItem}>
                                    {SYMBOL_ICONS[sym] && <Image source={SYMBOL_ICONS[sym]} style={styles.careIcon} />}
                                    <Text style={styles.careText}>{sym}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={styles.instructionsSection}>
                        <Text style={styles.sectionTitle}>Used in the following outfits</Text>
                        {outfits.length===0 ? (
                            <Text style={styles.detailValue}>This item is not used in any outfits yet.</Text>
                        ) : renderOutfits()}
                    </View>


                    <View style={styles.detailCell}>
                        <Text style={styles.sectionTitle}>Last time used</Text>
                        <Text style={styles.detailValue}>
                            {lastUsed ? formatLastUsedDate(lastUsed) : 'Never'}
                        </Text>
                    </View>
                    { getDonationSuggestion(lastUsed) && (
                        <View style={{ width: '100%', marginTop: 12 }}>
                            <View style={styles.donationSuggestionContainer}>
                                <Text style={styles.donationSuggestionText}>
                                    {getDonationSuggestion(lastUsed)}
                                </Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.modalButtonsContainer}>
                        {clothingItem.inLaundry ? (
                            <View style={styles.statusContainer}>
                                <Ionicons
                                    name="water-outline"
                                    size={20}
                                    color="#89cff0"
                                    style={styles.icon}
                                />
                                <Text style={styles.modalButtonText}>
                                    Status: In Laundry
                                </Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => washClothingItem(clothingItem.id)}
                            >
                                <Ionicons
                                    name="water-outline"
                                    size={20}
                                    color="#89cff0"
                                    style={styles.icon}
                                />
                                <Text style={styles.modalButtonText}>
                                    Send to Laundry
                                </Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => deleteClothingItem(clothingItem.id)}
                        >
                            <Ionicons
                                name="trash-outline"
                                size={20}
                                color="#FF4D4D"
                                style={styles.icon}
                            />
                            <Text style={[styles.modalButtonText, styles.deleteText]}>
                                Delete Item
                            </Text>
                        </TouchableOpacity>
                    </View>




                </ScrollView>
            </Animated.View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex:1, backgroundColor:'#1E1E1E' },
    headerRow: { flexDirection:'row', justifyContent:'space-around', padding:16, backgroundColor:'#2C2C2C' },
    actionButton: { paddingVertical:8, paddingHorizontal:16, backgroundColor:'#564c4c', borderRadius:8 },
    actionText: { color:'#FFF', fontWeight:'600' },
    titleRow: { flexDirection:'row', alignItems:'center', justifyContent:'center', paddingVertical:8 },
    screenHeader: { fontSize:24, fontWeight:'700', color:'#FFF', marginLeft:8 },
    imageContainerWrapper: { flex:1, justifyContent:'center', alignItems:'center' },
    imageWrapper: { height:SCREEN_HEIGHT*0.35, width:SCREEN_WIDTH*0.8, overflow:'hidden', borderRadius:12 },
    imageFull: { width:'100%', height:'100%' },
    panelContainer: { position:'absolute', bottom:0, width:'100%', height:BOTTOM_SHEET_HEIGHT, backgroundColor:'#1E1E1E', borderTopLeftRadius:20, borderTopRightRadius:20, padding:20, shadowColor:'#000', shadowOffset:{width:0,height:-4}, shadowOpacity:0.3, shadowRadius:6, elevation:10 },
    panelHandle: { width:60, height:6, backgroundColor:'#888', borderRadius:3, alignSelf:'center', marginBottom:10 },
    title: { fontSize:20, fontWeight:'700', color:'#FFF', textAlign:'center', marginBottom:16 },
    detailsContainer: { paddingBottom:24 },
    detailsGrid: { width:'100%', flexDirection:'row', flexWrap:'wrap', marginTop:8 },
    detailCell: { width:'50%', paddingVertical:4 },
    detailLabel: { color:'#AAA', fontSize:12 },
    detailValue: { color:'#FFF', fontSize:14, fontWeight:'600' },
    brandRow: { flexDirection:'row', alignItems:'center', marginTop:4 },
    brandLogoSmall: { width:24, height:24, marginLeft:6 },
    instructionsSection: { marginTop:20 },
    sectionTitle: { fontSize:16, fontWeight:'700', color:'#FF6B6B', marginBottom:10 },
    careInstructionItem: { flexDirection:'row', alignItems:'center', marginBottom:8 },
    careIcon: { width:28, height:28, marginRight:8 },
    careText: { fontSize:14, color:'#CCC', flexShrink:1 },
    horizontalItem: { marginVertical:12, marginHorizontal:4, width:SCREEN_WIDTH/3.5, maxHeight:250 },
    modalButtonsContainer: {
        flexDirection: 'column',
        justifyContent: 'space-around',
        marginVertical: 16
    },
    modalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        // paddingHorizontal: 16,
        // backgroundColor: '#2D2D2D',
        // borderRadius: 8
    },
    modalButtonText: {
        color: '#FFF',
        fontSize: 16,
        marginLeft: 8
    },
    deleteText: {
        color: '#FF4D4D'
    },
    icon: {
        marginRight: 4
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    donationSuggestionContainer: {
        width:'100%',
        backgroundColor: '#2A1C1C', // un bej-cafeniu subtil pe fundal închis
        borderLeftWidth: 4,
        borderLeftColor: '#FF6B6B', // galben auriu
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginTop: 10,
        marginBottom: 4
    },
    donationSuggestionText: {
        color: '#FF6B6B',
        fontSize: 13,
        //fontStyle: 'italic',
        fontWeight: '500'
    }


});

export default ClothingItemDetailsScreen;
