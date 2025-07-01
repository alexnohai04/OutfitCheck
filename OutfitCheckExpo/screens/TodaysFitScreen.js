// Updated TodaysFitScreen with card-local shared values to eliminate flicker on swipe transition

import React, { useContext, useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    TouchableOpacity,
    Image,
    TouchableWithoutFeedback, Modal, ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserContext } from "../UserContext";
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";
import { processClothingItems } from "../utils/imageUtils";
import globalStyles from "../styles/globalStyles";
import Toast from "react-native-toast-message";
import {useFocusEffect, useNavigation} from "@react-navigation/native";
import {FontAwesome, Ionicons} from '@expo/vector-icons';

import { GestureHandlerRootView } from "react-native-gesture-handler";
import GenerateFormView from "./GenerateFormView";
import OutfitSwiper from "./OuftitSwiper";
import ModeSelectorModal from "../reusable/ModeSelectorModal";
import OutfitPreview from "../reusable/OutfitPreview";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

const TodaysFitScreen = () => {
    const { userId } = useContext(UserContext);
    const navigation = useNavigation();

    const [laundryModalVisible, setLaundryModalVisible] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);

    const [todayOutfit, setTodayOutfit] = useState(null);
    const [loadingToday, setLoadingToday] = useState(true);
    const ROMANIA_OFFSET_MS = 3 * 60 * 60 * 1000;
    const today = new Date(Date.now() + ROMANIA_OFFSET_MS)
        .toISOString()
        .split('T')[0];

    useFocusEffect(
        React.useCallback(() => {
            let isActive = true;
            setLoadingToday(true);

            const fetchToday = async () => {
                try {
                    const res = await apiClient.get(API_URLS.GET_TODAY_OUTFIT(userId, today));
                    if (isActive && res.status === 200 && res.data) {
                        const items = await processClothingItems(res.data);
                        setTodayOutfit({ clothingItems: items });
                    }
                } catch (error) {
                    if (isActive) {
                        console.warn("Error fetching today's outfit", error);
                        // Toast.show({ type: 'error', text1: 'No outfit logged today.' });
                     }
                } finally {
                    if (isActive) setLoadingToday(false);
                }
            };

            fetchToday();
            return () => {
                isActive = false;  // cleanup
            };
        }, [userId, today])
    );

    // Remove today's outfit and reset flow
    const chooseAnother = async () => {
        try {
            await apiClient.delete(API_URLS.DELETE_LOGGED_OUTFIT(userId,today));
            setTodayOutfit(null);
            Toast.show({ type: 'success', text1: 'You can choose a new outfit.' });
        } catch (error) {
            console.error('Error deleting today outfit log', error);
            Toast.show({ type: 'error', text1: 'Operation failed.' });
        }
    };

    if (loadingToday) {
        return <Loading />;
    }
    const toggleItemSelection = (id) => {
        setSelectedItems((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const washClothingItems = async (items) => {
        const toWash = items.filter(it => !it.inLaundry); // doar cele care nu sunt deja în laundry

        if (toWash.length === 0) {
            Toast.show({ type: 'confirm', text1: 'All selected items are already in laundry' });
            return;
        }

        try {
            await Promise.all(
                toWash.map(it =>
                    apiClient.patch(API_URLS.TOGGLE_LAUNDRY(it.id), { inLaundry: true })
                )
            );

            // Actualizează starea locală dacă vrei
            setTodayOutfit(prev => ({
                ...prev,
                clothingItems: prev.clothingItems.map(it =>
                    toWash.some(w => w.id === it.id)
                        ? { ...it, inLaundry: true }
                        : it
                )
            }));

            Toast.show({ type: 'confirm', text1: `${toWash.length} items sent to laundry` });
        } catch (error) {
            console.error("Error sending to laundry", error);
            Toast.show({ type: 'error', text1: 'Failed to update laundry state' });
        }
    };


    if (todayOutfit) {
        return (
            <>
                <SafeAreaView style={globalStyles.container}>
                    <Text style={styles.todayTitle}>Today's Outfit</Text>
                    <View style={styles.previewContainer}>
                        <OutfitPreview clothingItems={todayOutfit.clothingItems} size="large" enableTooltip />
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setLaundryModalVisible(true)}
                        >
                            <Ionicons
                                name="water-outline"
                                size={25}
                                color="#89cff0"
                                style={styles.icon}
                            />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.chooseButton} onPress={chooseAnother}>
                        <Ionicons name="refresh-outline" size={24} color="#FF6B6B" />
                        <Text style={styles.chooseText}>Choose another outfit</Text>
                    </TouchableOpacity>
                </SafeAreaView>

                {/* Modalul e în afara SafeAreaView, dar în același return */}
                <Modal
                    visible={laundryModalVisible}
                    animationType="fade"
                    transparent={true}
                    onRequestClose={() => setLaundryModalVisible(false)}
                >
                    <TouchableWithoutFeedback onPress={() => setLaundryModalVisible(false)}>
                        <View style={styles.laundryOverlay} />
                    </TouchableWithoutFeedback>

                    <View style={styles.laundryBottomSheet}>
                        <View style={globalStyles.dragBar} />
                        <Text style={styles.laundryTitle}>Select items</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                            {todayOutfit.clothingItems.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => toggleItemSelection(item.id)}
                                    style={[
                                        styles.laundryItemBox,
                                        selectedItems.includes(item.id) && styles.laundryItemBoxSelected
                                    ]}
                                >
                                    {item.base64Image ? (
                                        <Image source={{ uri: item.base64Image }} style={styles.laundryImageSmall} />
                                    ) : (
                                        <View style={styles.imagePlaceholder}>
                                            <Text style={styles.imagePlaceholderText}>No Image</Text>
                                        </View>
                                    )}
                                    <Text numberOfLines={1} style={styles.laundryItemText}>{item.articleType}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.laundrySendButton}
                            onPress={() => {
                                const selected = todayOutfit.clothingItems.filter(item => selectedItems.includes(item.id));
                                washClothingItems(selected);
                                setLaundryModalVisible(false);
                                setSelectedItems([]);
                            }}
                        >
                            <Text style={styles.laundrySendButtonText}>Send to Laundry</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>

            </>

    );
    }

    // Normal flow: shuffle or generate
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ShuffleOrGenerateFlow
                userId={userId}
                navigation={navigation}
            />
        </GestureHandlerRootView>
    );
};


// Extracted component for the existing shuffle/generate logic
const ShuffleOrGenerateFlow = ({ userId, navigation }) => {
    const [outfits, setOutfits] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [prevOutfit, setPrevOutfit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fitMode, setFitMode] = useState("shuffle");             // ce se vede în header
    const [internalFitMode, setInternalFitMode] = useState("shuffle"); // ce se afișează efectiv
    const [modeModalVisible, setModeModalVisible] = useState(false);
    const [transitionVisible, setTransitionVisible] = useState(false);
    const [pendingMode, setPendingMode] = useState(null);
    const [generatedOutfit, setGeneratedOutfit] = useState(null);
    const [generationContext, setGenerationContext] = useState(null);
    const [generationSeason, setGenerationSeason] = useState(null);
    const [includeHeadwear,setIncludeHeadwear] = useState(false);
    const [includeOuterwear,setIncludeOuterwear] = useState(false);
    const [topwearLayers, setTopwearLayers] = useState(1);
    const [preferFullBodywear, setPreferFullBodywear] = useState(false);

    const [generatedVersion, setGeneratedVersion] = useState(0);

    const [allCategories, setAllCategories] = useState([]);

    const ROMANIA_OFFSET_MS = 3 * 60 * 60 * 1000;
    const today = new Date(Date.now() + ROMANIA_OFFSET_MS)
        .toISOString()
        .split('T')[0];


    const [currentGeneratedIndex, setCurrentGeneratedIndex] = useState(0);
    const modeOptions = [
        { id: 'shuffle', label: 'Shuffle through your fits', icon: 'shuffle-outline' },
        { id: 'generate', label: 'Generate Fit', icon: 'sparkles-outline' },
    ];

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await apiClient.get(API_URLS.GET_OUTFIT_CATEGORIES);
                setAllCategories(res.data);
            } catch (e) {
                console.error("Failed to fetch categories", e);
            }
        };
        fetchCategories();
    }, []);

    const getCategoryIdsByNames = (names) => {
        return allCategories
            .filter(cat => names.includes(cat.name))
            .map(cat => cat.id);
    };

    // fetch user outfits
    useEffect(() => {
        const fetchOutfits = async () => {
            setLoading(true);
            try {
                const res = await apiClient.get(`${API_URLS.GET_OUTFITS_BY_USER}/${userId}`);
                if (res.status === 200) {
                    const processed = await Promise.all(
                        res.data.map(async o => ({ ...o, clothingItems: await processClothingItems(o.clothingItems) }))
                    );
                    setOutfits(processed.sort(() => Math.random() - 0.5));
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchOutfits();
    }, [userId]);

    // log shuffle swipe
    useEffect(() => {
        async function fetchOutfits() {
            try {
                const response = await apiClient.get(`${API_URLS.GET_OUTFITS_BY_USER}/${userId}`);
                if (response.status === 200 && Array.isArray(response.data)) {
                    const processed = await Promise.all(
                        response.data.sort(() => Math.random() - 0.5)
                            .map(async outfit => ({
                                ...outfit,
                                clothingItems: await processClothingItems(outfit.clothingItems),
                            }))
                    );
                    setOutfits(processed);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchOutfits();
    }, [userId]);

    const handleGeneratedSwipe = async (direction) => {
        if (direction === 'right' || direction === 'left') {
            const outfitDto = generatedOutfit[currentGeneratedIndex];
            // On right swipe, first save the generated outfit to database
            if (direction === 'right') {
                const itemIds = outfitDto.clothingItems.map(item => item.id);
                const newOutfit = {
                    name: `Generated Outfit ${new Date().toISOString().split('T')[0]}`,
                    creatorId: userId,
                    items: itemIds,
                    categoryIds: [0, ...getCategoryIdsByNames([generationSeason, generationContext])]
                };
                try {
                    const createRes = await apiClient.post(API_URLS.CREATE_OUTFIT, newOutfit);
                    const savedOutfitId = createRes.data.id;
                    await apiClient.post(API_URLS.LOG_OUTFIT, { outfitId: savedOutfitId, date: today, userId });
                    navigation.navigate('CalendarScreen');
                    Toast.show({ type: 'success', text1: 'Generated outfit saved and logged!' });
                } catch (error) {
                    console.error('Error saving/generated logging outfit', error);
                    Toast.show({ type: 'error', text1: 'Failed to save generated outfit.' });
                }
            }
            // Advance to next generated outfit
            setCurrentGeneratedIndex(prev => {
                const nextIndex = prev + 1;
                if (nextIndex >= generatedOutfit.length) {
                    Toast.show({ type: 'info', text1: 'No more generated outfits.' });
                    return prev;
                }
                return nextIndex;
            });
        }
    };

    const logSwipe = async (direction) => {
        const outfit = outfits[currentIndex];
        if (direction === 'right') {

            try {
                await apiClient.post(API_URLS.LOG_OUTFIT, { outfitId: outfit.id, date: today, userId });
                Toast.show({ type: 'success', text1: 'Outfit logged!' });
            } catch {
                Toast.show({ type: 'error', text1: 'Already logged.' });
            }
            navigation.navigate('CalendarScreen');
        }

        requestAnimationFrame(() => {
            setPrevOutfit(outfits[currentIndex + 1]);
            setCurrentIndex(i => i + 1);
        });
    };

    const handleModeSwitch = (mode) => {
        setModeModalVisible(false);

        if (mode === "generate") {
            // RESET: scoate ce-ai generat deja
            setGeneratedOutfit(null);
            setGenerationContext(null);
            setGenerationSeason(null);
            setIncludeHeadwear(false);
            setIncludeOuterwear(false);
            setTopwearLayers(1);
            setPreferFullBodywear(false);
            setCurrentGeneratedIndex(0);
            // optional: resetează versiunea ca să forţezi rerender
            setGeneratedVersion(0);
        }

        // setează modul
        setFitMode(mode);
    };



    const current = useMemo(() => outfits[currentIndex], [outfits, currentIndex]);

    if (loading) return <Loading />;
    if (!(prevOutfit || current)?.clothingItems) return <NoMore />;

    const handleRegenerate = async () => {
        console.log("🔁 Regenerating with", generationContext, generationSeason);

        if (!generationContext || !generationSeason){
            console.error("❌ Error regenerating outfit:", error);
        return;}

        try {
            const payload = {
                userId,
                context: generationContext,
                season: generationSeason,
                includeHeadwear,
                includeOuterwear,
                topwearLayers,
                preferFullBodywear
            };
            console.log("📦 Payload being sent:", payload);

            const response = await apiClient.post(API_URLS.GENERATE_OUTFIT, payload);
            await handleOutfitReceived(response.data, generationContext, generationSeason, {
                includeHeadwear,
                includeOuterwear,
                topwearLayers,
                preferFullBodywear,
            });
            Toast.show({ type: 'success', text1: 'Regenerated.' });

        } catch (error) {
            console.error("❌ Error regenerating outfit:", error);
            Toast.show({ type: 'error', text1: 'Regenerate failed.' });
        }
    };
    // Updated to include headwear
    const handleOutfitReceived = async (dtoList, context, season, preferences) => {
        try {
            setGenerationContext(context);
            setGenerationSeason(season);
            setIncludeHeadwear(preferences.includeHeadwear);
            setIncludeOuterwear(preferences.includeOuterwear);
            setTopwearLayers(preferences.topwearLayers);
            setPreferFullBodywear(preferences.preferFullBodywear);

            // Include headwearId in the flatMap
            const allIds = dtoList.flatMap(dto => [
                dto.top1Id,
                dto.top2Id,
                dto.bottomId,
                dto.footwearId,
                dto.outerwearId,
                dto.headwearId,          // added
                dto.fullBodywearId
            ]).filter(Boolean);

            const response = await apiClient.post(API_URLS.GET_CLOTHING_ITEMS_BY_IDS, allIds);
            const fullItems = await processClothingItems(response.data);

            // Group by outfit and include headwear
            const processed = dtoList.map(dto => {
                const ids = [
                    dto.top1Id,
                    dto.top2Id,
                    dto.bottomId,
                    dto.footwearId,
                    dto.outerwearId,
                    dto.headwearId,      // added
                    dto.fullBodywearId
                ].filter(Boolean);
                const items = fullItems.filter(item => ids.includes(item.id));
                return { ...dto, clothingItems: items };
            });

            setGeneratedOutfit([
                ...processed,
                { type: 'regenerate' }
            ]); // array of outfits
            setCurrentGeneratedIndex(0);
            setGeneratedVersion(prev => prev + 1);
        } catch (error) {
            console.log("❌ Error loading generated outfits:", error);
            Toast.show({ type: 'error', text1: 'Failed to load generated outfits.' });
        }
    };


    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => setModeModalVisible(true)}>
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {fitMode === "shuffle" ? "Shuffle through your fits" : "Generate Fit"}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#FFF" />
                    </View>
                </TouchableOpacity>
            </View>

            <SafeAreaView style={globalStyles.container}>

                {fitMode === "shuffle" ? (
                    <OutfitSwiper
                        userId={userId}
                        outfits={outfits}        // lista pe care ai încărcat-o deja
                        currentIndex={currentIndex}
                        onSwipe={logSwipe}       // aici poţi lăsa semnătura curentă
                    />

                ) : generatedOutfit ? (
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        {fitMode === "generate" && Array.isArray(generatedOutfit) && generatedOutfit.length > 0 ? (
                            <OutfitSwiper
                                key={generatedVersion}
                                userId={userId}
                                outfits={generatedOutfit}
                                onSwipe={handleGeneratedSwipe}
                                onRegenerate={handleRegenerate}
                            />
                        ) : null}

                    </View>
                ) : (
                    <GenerateFormView onNext={handleOutfitReceived} />
                )}


                {/* Modalul de selecție mod */}
                <ModeSelectorModal
                    visible={modeModalVisible}
                    options={modeOptions}
                    selectedId={fitMode}
                    title="Select your mode"
                    onSelect={handleModeSwitch}
                    onClose={() => setModeModalVisible(false)}
                />
            </SafeAreaView>
        </GestureHandlerRootView>

);
};


const Loading = () => <SafeAreaView style={globalStyles.container}><ActivityIndicator size="large" color="#FF6B6B"/></SafeAreaView>;
const NoMore = () => <SafeAreaView style={globalStyles.container}><Text style={globalStyles.title}>No more outfits!</Text></SafeAreaView>;
const styles = StyleSheet.create({
    //stackContainer: {  justifyContent:'center', alignItems:'center', height: '100%' },
    //card: { width: SCREEN_WIDTH*0.8, height: SCREEN_WIDTH*1.4, borderRadius:16, backgroundColor:'#2E2E2E', alignItems:'center', justifyContent:'center', position:'absolute', shadowColor:'#000', shadowOpacity:0.25, shadowRadius:10, shadowOffset:{width:0,height:5}, elevation:8 },
    //emojiOverlay: { position:'absolute', top:40, alignItems:'center', zIndex:5, opacity:0 },
    //emojiText: { marginTop:4, fontSize:16, fontWeight:'bold' },
    //leftEmoji: { left:30 },
    //rightEmoji: { right:30 },

    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: '#1c1c1c',
        paddingTop: 48,
        paddingBottom: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
        //textAlign: "center",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContentEnhanced: {
        backgroundColor: "#1E1E1E",
        paddingVertical: 24,
        paddingHorizontal: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    modalTitle: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
    },
    modeOptionsContainer: {
        flexDirection: "column",
        gap: 16,
    },
    modeOptionBox: {
        flexDirection: "row",
        alignItems: "center",
        borderColor: "#444",
        borderWidth: 2,
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: "#2C2C2C",
        gap: 12,
    },
    modeSelected: {
        borderColor: "#FF6B6B",
    },
    modeLabel: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
    todayTitle: { fontSize:24, fontWeight:'700', color:'#FFF', marginBottom:16 },
    chooseButton: { flexDirection:'row', alignItems:'center', paddingVertical:12, paddingHorizontal:20, borderRadius:8, marginTop:24 },
    chooseText: { color:'#FF6B6B', fontSize:16, fontWeight:'600' },
    previewContainer: {
        marginTop: 0,
        alignItems: 'center',
        width: '80%',
        height: '65%',
    },
    modalButton: {
        // flexDirection: 'row',
        // alignItems: 'center',
        paddingVertical: 10,
        position: "absolute",
        bottom: 5,
        right: 8
    },
    laundryModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCard: {
        width: '85%',
        backgroundColor: '#2C2C2E',
        borderRadius: 16,
        padding: 20,
    },
    laundryModalTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    itemRow: {
        padding: 12,
        backgroundColor: '#3A3A3C',
        marginBottom: 8,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemRowSelected: {
        backgroundColor: '#5ac8fa', // albastru selectat
    },
    itemText: {
        color: '#fff',
    },
    sendButton: {
        backgroundColor: '#89cff0',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    sendButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    laundryItemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#3A3A3C',
        marginBottom: 10,
        borderRadius: 12,
    },
    laundryItemCardSelected: {
        backgroundColor: '#5ac8fa',
    },
    laundryImage: {
        width: 50,
        height: 50,
        borderRadius: 10,
        marginRight: 12,
        backgroundColor: '#444',
    },
    imagePlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 10,
        backgroundColor: '#444',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    imagePlaceholderText: {
        color: '#AAA',
        fontSize: 10,
    },
    laundryOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',

    },

    laundryBottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1E1E1E',
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },


    laundryTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 14,
    },

    horizontalScroll: {
        paddingVertical: 8,
    },

    laundryItemBox: {
        width: 70,
        alignItems: 'center',
        marginRight: 12,
        backgroundColor: '#2C2C2E',
        padding: 8,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#2C2C2E',
    },

    laundryItemBoxSelected: {
        borderColor: '#89cff0',
        borderWidth: 2,
    },

    laundryImageSmall: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginBottom: 6,
       // backgroundColor: '#444',
    },

    laundryItemText: {
        color: '#fff',
        fontSize: 12,
        textAlign: 'center',
    },

    laundrySendButton: {
        backgroundColor: '#89cff0',
        marginTop: 20,
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
    },

    laundrySendButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },




});

export default TodaysFitScreen;
