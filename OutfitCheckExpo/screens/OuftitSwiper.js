import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import { GestureHandlerRootView, PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedGestureHandler,
    withSpring,
    withTiming,
    runOnJS,
    interpolate,
    Extrapolate,
    useDerivedValue,
} from "react-native-reanimated";
import OutfitPreview from "../reusable/OutfitPreview";
import { FontAwesome } from "@expo/vector-icons";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

const OutfitSwiper = ({ outfits: initialOutfits, fetchOutfits, onSwipe, onRegenerate }) => {
    const [outfits, setOutfits] = useState(initialOutfits || []);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(!initialOutfits);

    // Shared values pentru animații și stare
    const cardTranslateX = useSharedValue(0);
    const cardRotation = useSharedValue(0);
    const isSwipingInProgress = useSharedValue(0); // 0 = nu, 1 = da

    // Folosim useDerivedValue pentru a calcula valorile derivate din animații
    const swipeProgress = useDerivedValue(() => {
        return Math.min(1, Math.abs(cardTranslateX.value) / SWIPE_THRESHOLD);
    });

    // Încărcăm outfiturile inițiale
    useEffect(() => {
        if (!initialOutfits && fetchOutfits) {
            fetchOutfits()
                .then(data => setOutfits(data))
                .finally(() => setLoading(false));
        }
    }, [fetchOutfits, initialOutfits]);

    // Resetăm valorile animate când se schimbă indexul
    const resetAnimatedValues = useCallback(() => {
        // Resetăm valorile animate imediat
        cardTranslateX.value = 0;
        cardRotation.value = 0;
        isSwipingInProgress.value = 0;
    }, [cardTranslateX, cardRotation, isSwipingInProgress]);

    // Funcție pentru procesarea swipe-ului, rulată în JS thread
    const processSwipe = useCallback(async (direction) => {
        const outfit = outfits[currentIndex];

        try {
            if (onSwipe) await onSwipe(direction, outfit);

            // Actualizăm indexul
            setCurrentIndex(prevIndex => prevIndex + 1);

            // Resetăm valorile animate după un scurt delay
            // pentru a permite finalizarea tranziției
            setTimeout(resetAnimatedValues, 10);
        } catch (error) {
            console.error("Error processing swipe:", error);
            isSwipingInProgress.value = 0;
        }
    }, [currentIndex, outfits, onSwipe, resetAnimatedValues, isSwipingInProgress]);

    // Handler de gesturi optimizat
    const gestureHandler = useAnimatedGestureHandler({
        onStart: () => {
            // Nu facem nimic dacă un swipe este deja în curs
            if (isSwipingInProgress.value === 1) return;
        },
        onActive: (e) => {
            // Nu facem nimic dacă un swipe este deja în curs
            if (isSwipingInProgress.value === 1) return;

            cardTranslateX.value = e.translationX;
            cardRotation.value = e.translationX / 20;
        },
        onEnd: (e) => {
            // Nu facem nimic dacă un swipe este deja în curs
            if (isSwipingInProgress.value === 1) return;

            const dir = e.translationX > 0 ? 'right' : 'left';

            if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
                // Marcăm că un swipe este în curs
                isSwipingInProgress.value = 1;

                const flyOut = e.translationX > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH;

                // Animăm ieșirea cardului cu timing în loc de spring pentru mai multă predictibilitate
                cardTranslateX.value = withTiming(
                    flyOut,
                    { duration: 200 },
                    () => runOnJS(processSwipe)(dir)
                );
            } else {
                // Revenim la poziția inițială cu spring pentru un efect elastic
                cardTranslateX.value = withSpring(0, { damping: 15 });
                cardRotation.value = withSpring(0, { damping: 15 });
            }
        }
    });

    // Stiluri animate optimizate
    const currentStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: cardTranslateX.value },
            { rotate: `${cardRotation.value}deg` }
        ],
        zIndex: 10,
    }));

    const nextStyle = useAnimatedStyle(() => {
        // Folosim swipeProgress pentru a calcula valorile derivate
        return {
            transform: [
                { scale: interpolate(swipeProgress.value, [0, 1], [0.95, 1], Extrapolate.CLAMP) },
                { translateY: interpolate(swipeProgress.value, [0, 1], [20, 0], Extrapolate.CLAMP) }
            ],
            opacity: interpolate(swipeProgress.value, [0, 1], [0.7, 1], Extrapolate.CLAMP),
            zIndex: 4
        };
    });

    const thirdStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: interpolate(swipeProgress.value, [0, 1], [0.9, 0.95], Extrapolate.CLAMP) },
                { translateY: interpolate(swipeProgress.value, [0, 1], [40, 20], Extrapolate.CLAMP) }
            ],
            opacity: interpolate(swipeProgress.value, [0, 0.5, 1], [0, 0.3, 0.7], Extrapolate.CLAMP),
            zIndex: 3
        };
    });

    // Stiluri pentru emoji-uri
    const emojiLikeStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            cardTranslateX.value,
            [0, SWIPE_THRESHOLD / 2],
            [0, 1],
            Extrapolate.CLAMP
        ),
    }));

    const emojiDislikeStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            cardTranslateX.value,
            [-SWIPE_THRESHOLD / 2, 0],
            [1, 0],
            Extrapolate.CLAMP
        ),
    }));

    // Determinăm cardurile care trebuie afișate
    const current = outfits[currentIndex];
    const next = outfits[currentIndex + 1];
    const third = outfits[currentIndex + 2];

    if (loading) return <ActivityIndicator size="large" color="#FF6B6B" />;

    // Funcție optimizată pentru renderizarea cardurilor
    const renderCard = (outfit, animatedStyle, isTop = false, idx) => {
        if (!outfit) return null;

        const isRegenerate = outfit?.type === "regenerate";
        const content = isRegenerate ? (
            <TouchableOpacity onPress={onRegenerate} style={styles.regenerateButton}>
                <Text style={styles.regenerateText}>Generate new outfits</Text>
                <FontAwesome name="refresh" size={28} color="#fff" style={{ marginTop: 12 }} />
            </TouchableOpacity>
        ) : (
            <>
                {isTop && (
                    <>
                        <Animated.View style={[styles.emojiOverlay, styles.leftEmoji, emojiLikeStyle]}>
                            <FontAwesome name="thumbs-up" size={42} color="#32CD32" />
                            <Text style={[styles.emojiText, { color: '#32CD32' }]}>Like</Text>
                        </Animated.View>
                        <Animated.View style={[styles.emojiOverlay, styles.rightEmoji, emojiDislikeStyle]}>
                            <FontAwesome name="thumbs-down" size={42} color="#FF6B6B" />
                            <Text style={[styles.emojiText, { color: '#FF6B6B' }]}>Dislike</Text>
                        </Animated.View>
                    </>
                )}
                <OutfitPreview clothingItems={outfit.clothingItems} size="large" />
            </>
        );

        const card = (
            <Animated.View key={`card-${idx}`} style={[styles.card, animatedStyle]}>
                {content}
            </Animated.View>
        );

        if (isTop && !isRegenerate) {
            return (
                <PanGestureHandler key={`gesture-${idx}`} onGestureEvent={gestureHandler}>
                    {card}
                </PanGestureHandler>
            );
        }
        return card;
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <View style={styles.stackContainer}>
                {third && renderCard(third, thirdStyle, false, currentIndex + 2)}
                {next && renderCard(next, nextStyle, false, currentIndex + 1)}
                {current && renderCard(current, currentStyle, true, currentIndex)}
            </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    stackContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: {
        width: SCREEN_WIDTH * 0.8,
        height: SCREEN_WIDTH * 1.4,
        borderRadius: 16,
        backgroundColor: '#2E2E2E',
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 8,
    },
    emojiOverlay: { position: 'absolute', top: 40, alignItems: 'center', zIndex: 50, opacity: 0 },
    emojiText: { marginTop: 4, fontSize: 16, fontWeight: 'bold' },
    leftEmoji: { left: 30 },
    rightEmoji: { right: 30 },
    regenerateButton: {
        backgroundColor: '#FF6B6B',
        paddingVertical: 24,
        paddingHorizontal: 32,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    },
    regenerateText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default OutfitSwiper;
