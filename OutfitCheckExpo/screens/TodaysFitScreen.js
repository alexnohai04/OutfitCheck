// Updated TodaysFitScreen with third card preloaded and fixed hook usage
import React, { useContext, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserContext } from "../UserContext";
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";
import { processClothingItems } from "../utils/imageUtils";
import globalStyles from "../styles/globalStyles";
import OutfitPreview from "../reusable/OutfitPreview";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedGestureHandler,
    withSpring,
    runOnJS,
    interpolate,
    Extrapolate,
} from "react-native-reanimated";
import { PanGestureHandler, GestureHandlerRootView } from "react-native-gesture-handler";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

const TodaysFitScreen = () => {
    const { userId } = useContext(UserContext);
    const [outfits, setOutfits] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    const translateX = useSharedValue(0);
    const rotation = useSharedValue(0);
    const isSwiping = useSharedValue(false);

    useEffect(() => {
        const fetchOutfits = async () => {
            try {
                const response = await apiClient.get(`${API_URLS.GET_OUTFITS_BY_USER}/${userId}`);
                if (response.status === 200 && Array.isArray(response.data)) {
                    const shuffled = response.data.sort(() => Math.random() - 0.5);
                    const processed = await Promise.all(
                        shuffled.map(async (outfit) => ({
                            ...outfit,
                            clothingItems: await processClothingItems(outfit.clothingItems),
                        }))
                    );
                    setOutfits(processed);
                }
            } catch (error) {
                console.error("❌ Error fetching outfits:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOutfits();
    }, [userId]);

    useEffect(() => {
        translateX.value = 0;
        rotation.value = 0;
    }, [currentIndex]);

    const handleSwipe = async (direction) => {
        const outfit = outfits[currentIndex];
        if (direction === "right") {
            try {
                const today = new Date().toISOString().split("T")[0];
                await apiClient.post(API_URLS.LOG_OUTFIT, {
                    outfitId: outfit.id,
                    date: today,
                    userId,
                });
                Toast.show({ type: "success", text1: "Outfit logged to calendar!" });
                navigation.navigate("CalendarScreen");
            } catch (error) {
                Toast.show({ type: "error", text1: "You've already logged an outfit today." });
            }
        }
        setCurrentIndex((prev) => prev + 1);
    };

    const gestureHandler = useAnimatedGestureHandler({
        onStart: () => { isSwiping.value = true; },
        onActive: (event) => {
            translateX.value = event.translationX;
            rotation.value = event.translationX / 20;
        },
        onEnd: (event) => {
            if (event.translationX > SWIPE_THRESHOLD) {
                translateX.value = withSpring(SCREEN_WIDTH * 1.2, { velocity: event.velocityX }, (finished) => {
                    if (finished) runOnJS(handleSwipe)("right");
                });
            } else if (event.translationX < -SWIPE_THRESHOLD) {
                translateX.value = withSpring(-SCREEN_WIDTH * 1.2, { velocity: event.velocityX }, (finished) => {
                    if (finished) runOnJS(handleSwipe)("left");
                });
            } else {
                translateX.value = withSpring(0);
                rotation.value = withSpring(0);
            }
            isSwiping.value = false;
        },
    });

    const getCardStyle = (indexOffset) => useAnimatedStyle(() => {
        if (indexOffset === 0) {
            return {
                transform: [
                    { translateX: translateX.value },
                    { rotate: `${rotation.value}deg` },
                ],
                zIndex: 10,
            };
        }
        const scale = interpolate(
            Math.abs(translateX.value),
            [0, SWIPE_THRESHOLD],
            [0.95 + indexOffset * 0.02, 1 + indexOffset * 0.01],
            Extrapolate.CLAMP
        );
        const translateY = interpolate(
            Math.abs(translateX.value),
            [0, SWIPE_THRESHOLD],
            [5 * indexOffset, 0],
            Extrapolate.CLAMP
        );
        const opacity = interpolate(
            Math.abs(translateX.value),
            [0, SWIPE_THRESHOLD],
            [0.6 + indexOffset * 0.1, 1],
            Extrapolate.CLAMP
        );
        return { transform: [{ scale }, { translateY }], opacity, zIndex: 10 - indexOffset };
    });

    const currentCardStyle = getCardStyle(0);
    const nextCardStyle = getCardStyle(1);
    const thirdCardStyle = getCardStyle(2);

    const likeStyle = useAnimatedStyle(() => ({
        opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD / 2], [0, 1], Extrapolate.CLAMP),
    }));
    const dislikeStyle = useAnimatedStyle(() => ({
        opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD / 2, 0], [1, 0], Extrapolate.CLAMP),
    }));

    const currentOutfit = outfits[currentIndex];
    const nextOutfit = outfits[currentIndex + 1];
    const thirdOutfit = outfits[currentIndex + 2];

    if (loading) {
        return <SafeAreaView style={globalStyles.container}><ActivityIndicator size="large" color="#FF6B6B" /></SafeAreaView>;
    }

    if (!currentOutfit?.clothingItems) {
        return <SafeAreaView style={globalStyles.container}><Text style={globalStyles.title}>No more outfits!</Text></SafeAreaView>;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={globalStyles.container}>
                <View style={styles.header}><Text style={globalStyles.title}>Today's Fit</Text></View>
                <View style={styles.stackContainer}>
                    {thirdOutfit?.clothingItems && (
                        <Animated.View style={[styles.card, thirdCardStyle]}>
                            <OutfitPreview clothingItems={thirdOutfit.clothingItems} size="large" enableTooltip />
                        </Animated.View>
                    )}
                    {nextOutfit?.clothingItems && (
                        <Animated.View style={[styles.card, nextCardStyle]}>
                            <OutfitPreview clothingItems={nextOutfit.clothingItems} size="large" enableTooltip />
                        </Animated.View>
                    )}
                    {currentOutfit?.clothingItems && (
                        <PanGestureHandler onGestureEvent={gestureHandler}>
                            <Animated.View style={[styles.card, currentCardStyle]}>
                                <Animated.View style={[styles.emojiOverlay, styles.rightEmoji, dislikeStyle]}>
                                    <FontAwesome name="thumbs-down" size={42} color="#FF6B6B" />
                                    <Text style={[styles.emojiText, { color: "#FF6B6B" }]}>Dislike</Text>
                                </Animated.View>
                                <Animated.View style={[styles.emojiOverlay, styles.leftEmoji, likeStyle]}>
                                    <FontAwesome name="thumbs-up" size={42} color="#32CD32" />
                                    <Text style={[styles.emojiText, { color: "#32CD32" }]}>Like</Text>
                                </Animated.View>
                                <OutfitPreview clothingItems={currentOutfit.clothingItems} size="large" enableTooltip />
                            </Animated.View>
                        </PanGestureHandler>
                    )}
                </View>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    header: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        marginTop: 20,
    },
    stackContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        position: 'relative',
    },
    card: {
        width: SCREEN_WIDTH * 0.8,
        height: SCREEN_WIDTH * 1.4,
        borderRadius: 16,
        backgroundColor: "#2E2E2E",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 8,
        backfaceVisibility: 'hidden',
        overflow: 'hidden',
    },
    emojiOverlay: {
        position: "absolute",
        top: 40,
        alignItems: "center",
        zIndex: 5,
        opacity: 0,
    },
    emojiText: {
        marginTop: 4,
        fontSize: 16,
        fontWeight: "bold",
    },
    leftEmoji: { left: 30 },
    rightEmoji: { right: 30 },
});

export default TodaysFitScreen;