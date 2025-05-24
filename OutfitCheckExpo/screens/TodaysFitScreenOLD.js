// Updated TodaysFitScreen with card-local shared values to eliminate flicker on swipe transition

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

const TodaysFitScreenOLD = () => {
    const { userId } = useContext(UserContext);
    const [outfits, setOutfits] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [prevOutfit, setPrevOutfit] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    const cardTranslateX = useSharedValue(0);
    const cardRotation = useSharedValue(0);

    useEffect(() => {
        cardTranslateX.value = 0;
        cardRotation.value = 0;
        setPrevOutfit(null);
    }, [currentIndex]);

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

    const gestureHandler = useAnimatedGestureHandler({
        onActive: (e) => {
            cardTranslateX.value = e.translationX;
            cardRotation.value = e.translationX / 20;
        },
        onEnd: (e) => {
            const dir = e.translationX > 0 ? 'right' : 'left';
            if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
                const flyOut = e.translationX > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH;
                cardTranslateX.value = withSpring(
                    flyOut,
                    {},
                    () => {
                        cardTranslateX.value = flyOut * 2;
                        runOnJS(logSwipe)(dir);
                    }
                );
            } else {
                cardTranslateX.value = withSpring(0);
                cardRotation.value = withSpring(0);
            }
        }
    });

    const current = useMemo(() => outfits[currentIndex], [outfits, currentIndex]);
    const next = useMemo(() => outfits[currentIndex+1], [outfits, currentIndex]);
    const third = useMemo(() => outfits[currentIndex+2], [outfits, currentIndex]);

    const currentStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: cardTranslateX.value }, { rotate: `${cardRotation.value}deg` }], zIndex: 3
    }));
    const nextStyle = useAnimatedStyle(() => {
        const abs = Math.abs(cardTranslateX.value);
        const s = interpolate(abs, [0, SWIPE_THRESHOLD], [0.95,1], Extrapolate.CLAMP);
        const o = interpolate(abs, [0, SWIPE_THRESHOLD], [0.7,1], Extrapolate.CLAMP);
        const y = interpolate(abs, [0, SWIPE_THRESHOLD], [20,0], Extrapolate.CLAMP);
        return { transform: [{ scale: s }, { translateY: y }], opacity: o, zIndex: 2 };
    });
    const thirdStyle = useAnimatedStyle(() => {
        const abs = Math.abs(cardTranslateX.value);
        const o = interpolate(abs, [SWIPE_THRESHOLD*0.5, SWIPE_THRESHOLD], [0, 0.7], Extrapolate.CLAMP);
        const s = interpolate(abs, [0, SWIPE_THRESHOLD], [0.9, 0.95], Extrapolate.CLAMP);
        const y = interpolate(abs, [0, SWIPE_THRESHOLD], [60, 20], Extrapolate.CLAMP);
        return { transform: [{ scale: s }, { translateY: y }], opacity: o, zIndex: 1 };
    });

    if (loading) return <Loading />;
    if (!(prevOutfit || current)?.clothingItems) return <NoMore />;

    return (
        <GestureHandlerRootView style={{flex:1}}>
            <SafeAreaView style={globalStyles.container}>
                <Header title="Today's Fit" />
                <View style={styles.stackContainer}>
                    {third && third.clothingItems && <Animated.View key={currentIndex + 2} style={[styles.card, thirdStyle]}><OutfitPreview clothingItems={third.clothingItems} size="large" /></Animated.View>}
                    {next && next.clothingItems && <Animated.View key={currentIndex + 1} style={[styles.card, nextStyle]}><OutfitPreview clothingItems={next.clothingItems} size="large" /></Animated.View>}
                    {(prevOutfit || current)?.clothingItems && (
                        <PanGestureHandler onGestureEvent={gestureHandler}>
                            <Animated.View style={[styles.card, currentStyle]}>
                                <Emojis x={cardTranslateX} />
                                <OutfitPreview clothingItems={(prevOutfit || current).clothingItems} size="large"/>
                            </Animated.View>
                        </PanGestureHandler>
                    )}
                </View>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
};

const Loading = () => <SafeAreaView style={globalStyles.container}><ActivityIndicator size="large" color="#FF6B6B"/></SafeAreaView>;
const NoMore = () => <SafeAreaView style={globalStyles.container}><Text style={globalStyles.title}>No more outfits!</Text></SafeAreaView>;
const Header = ({title}) => <View style={styles.header}><Text style={globalStyles.title}>{title}</Text></View>;
const Emojis = ({x}) => {
    const ok = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [0, SWIPE_THRESHOLD/2], [0,1], Extrapolate.CLAMP) }));
    const no = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [-SWIPE_THRESHOLD/2,0], [1,0], Extrapolate.CLAMP) }));
    return (
        <>
            <Animated.View style={[styles.emojiOverlay, styles.leftEmoji, ok]}><FontAwesome name="thumbs-up" size={42} color="#32CD32"/><Text style={[styles.emojiText,{color:'#32CD32'}]}>Like</Text></Animated.View>
            <Animated.View style={[styles.emojiOverlay, styles.rightEmoji, no]}><FontAwesome name="thumbs-down" size={42} color="#FF6B6B"/><Text style={[styles.emojiText,{color:'#FF6B6B'}]}>Dislike</Text></Animated.View>
        </>
    );
};

const styles = StyleSheet.create({
    header: { width:'100%', flexDirection:'row', justifyContent:'center', alignItems:'center', paddingHorizontal:20, marginTop:20 },
    stackContainer: { flex:1, justifyContent:'center', alignItems:'center' },
    card: { width: SCREEN_WIDTH*0.8, height: SCREEN_WIDTH*1.4, borderRadius:16, backgroundColor:'#2E2E2E', alignItems:'center', justifyContent:'center', position:'absolute', shadowColor:'#000', shadowOpacity:0.25, shadowRadius:10, shadowOffset:{width:0,height:5}, elevation:8 },
    emojiOverlay: { position:'absolute', top:40, alignItems:'center', zIndex:5, opacity:0 },
    emojiText: { marginTop:4, fontSize:16, fontWeight:'bold' },
    leftEmoji: { left:30 },
    rightEmoji: { right:30 },
});

export default TodaysFitScreenOLD;