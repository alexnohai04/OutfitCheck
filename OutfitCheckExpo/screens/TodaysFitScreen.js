// Updated TodaysFitScreen with card-local shared values to eliminate flicker on swipe transition

import React, { useContext, useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    TouchableOpacity,
    TouchableWithoutFeedback, Modal
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserContext } from "../UserContext";
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";
import { processClothingItems } from "../utils/imageUtils";
import globalStyles from "../styles/globalStyles";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import {FontAwesome, Ionicons} from '@expo/vector-icons';
import Animated, {
    useAnimatedStyle,
    interpolate,
    Extrapolate,
} from "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import GenerateFormView from "./GenerateFormView";
import OutfitSwiper from "./OuftitSwiper";
import ModeSelectorModal from "../reusable/ModeSelectorModal";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

const TodaysFitScreen = () => {
    const { userId } = useContext(UserContext);
    const [outfits, setOutfits] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [prevOutfit, setPrevOutfit] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
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

    const [generatedVersion, setGeneratedVersion] = useState(0); // 🆕


    const [currentGeneratedIndex, setCurrentGeneratedIndex] = useState(0);

    const modeOptions = [
        { id: 'shuffle', label: 'Shuffle through your fits', icon: 'shuffle-outline' },
        { id: 'generate', label: 'Generate Fit', icon: 'sparkles-outline' },
    ];



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

    const handleGeneratedSwipe = (direction) => {
        if (direction === 'right' || direction === 'left') {
            setCurrentGeneratedIndex((prev) => {
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
            const today = new Date().toISOString().split('T')[0];
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
                        fetchOutfits={async () => {
                            const response = await apiClient.get(`${API_URLS.GET_OUTFITS_BY_USER}/${userId}`);
                            return Promise.all(response.data.map(async outfit => ({
                                ...outfit,
                                clothingItems: await processClothingItems(outfit.clothingItems),
                            })));
                        }}
                        onSwipe={logSwipe}
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
        backgroundColor: '#1E1E1E',
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

});

export default TodaysFitScreen;
