import React, { useState, useRef, useEffect } from "react";
import { View, Image, StyleSheet, Pressable, Text, TouchableWithoutFeedback, Animated, Linking } from "react-native";
import {Link} from "expo-router";

const CATEGORY_ORDER = ["Headwear", "Topwear", "Bottomwear", "Footwear", "FullBodywear"];
const CATEGORY_IDS = {
    Headwear: 4,
    Topwear: 1,
    Bottomwear: 2,
    Footwear: 3,
    FullBodywear: 5,
};

const OutfitPreview = ({ clothingItems, compact = false, size = "medium", style, enableTooltip = false }) => {
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [fadeAnim] = useState(new Animated.Value(0));
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;
    const tooltipAnim = useRef(new Animated.Value(0)).current;

    const imageSize = size === "large" ? 170 : compact ? 60 : 100;
    const smallSize = size === "large" ? 80 : compact ? 45 : 60;
    const overlap = size === "large" ? 100 : compact ? 35 : 60;

    const getCategoryName = (id) => {
        return Object.keys(CATEGORY_IDS).find(key => CATEGORY_IDS[key] === id) || "Unknown";
    }

    const getDomainFromUrl = (url) => {
        try {
            const { hostname } = new URL(url);
            return hostname.replace(/^www\d*\./, '');
        } catch {
            return null;
        }
    };

    const generateGoogleSearchLink = (item) => {
        const name = getCategoryName(item.category?.id);
        const color = item.colors[0];
        const terms = [item.brand, item.material, name, color]
            .filter(Boolean)
            .join(" ");
        const query = encodeURIComponent(terms);
        return `https://www.google.com/search?q=${query}`;
    };



    const handleSelect = (itemId) => {
        setSelectedItemId(itemId);
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1.2,
                friction: 5,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0.3,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(tooltipAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            })
        ]).start();
    };

    const handleDeselect = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(tooltipAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            })
        ]).start(() => setSelectedItemId(null));
    };

    if (!Array.isArray(clothingItems)) return null;

    return enableTooltip ? (
        <TouchableWithoutFeedback onPress={handleDeselect}>
                    <View style={[styles.wrapper, style]}>
                        {selectedItemId && (
                            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />
                        )}
                        <View style={styles.container}>
                            {CATEGORY_ORDER.map((category) => {
                                const items = clothingItems.filter(
                                    (item) => item.category?.id === CATEGORY_IDS[category]
                                );
                                if (!items.length) return null;

                                const isTopGroup = category === "Topwear";

                                return (
                                    <View
                                        key={category}
                                        style={[styles.section, { height: isTopGroup ? imageSize : undefined }]}
                                    >
                                        {isTopGroup ? (
                                            <View
                                                style={[
                                                    styles.topOverlapContainer,
                                                    {
                                                        width:
                                                            items.length > 1
                                                                ? imageSize + (items.length - 1) * overlap
                                                                : imageSize,
                                                        height: imageSize,
                                                    },
                                                ]}
                                            >
                                                {items.map((topItem, index) => {
                                                    const isSelected = selectedItemId === topItem.id;
                                                    const animatedStyle = isSelected ? { transform: [{ scale: scaleAnim }] } : {};
                                                    const itemOpacity = selectedItemId && !isSelected ? opacityAnim : 1;
                                                    return (
                                                        <Pressable
                                                            key={topItem.id}
                                                            onLongPress={() => handleSelect(topItem.id)}
                                                            style={[styles.itemWrapper, styles.itemOverlay, {
                                                                position: "absolute",
                                                                top: 0,
                                                                left: index * overlap,
                                                                zIndex: items.length - index,
                                                                alignItems: "flex-start",
                                                            }]}
                                                        >
                                                            <Animated.Image
                                                                source={{ uri: topItem.base64Image }}
                                                                style={[
                                                                    styles.imageBase,
                                                                    {
                                                                        width: imageSize,
                                                                        height: imageSize,
                                                                        opacity: itemOpacity,
                                                                    },
                                                                    animatedStyle,
                                                                ]}
                                                            />
                                                            {isSelected && (
                                                                <Animated.View style={[styles.tooltipBox, {
                                                                    left: imageSize,
                                                                    opacity: tooltipAnim,
                                                                    transform: [{ translateY: tooltipAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }]
                                                                }]}>
                                                                    <Text style={styles.tooltipText}>{getCategoryName(topItem.category?.id)}</Text>
                                                                    <Text style={styles.tooltipText}>{topItem.brand || "Unknown Brand"}</Text>
                                                                    {topItem.material && (<Text style={styles.tooltipText}>{topItem.material}</Text> )}
                                                                    <Text
                                                                        style={[styles.tooltipText, { textDecorationLine: "underline", color: "#FF6B6B" }]}
                                                                        onPress={() => Linking.openURL(topItem.link || generateGoogleSearchLink(topItem))}
                                                                    >
                                                                        {topItem.link ? getDomainFromUrl(topItem.link) : 'Search similar'}
                                                                    </Text>

                                                                </Animated.View>
                                                            )}
                                                        </Pressable>
                                                    );
                                                })}
                                            </View>
                                        ) : (
                                            items.map((item) => {
                                                const isSmall = category === "Headwear" || category === "Footwear";
                                                const itemSize = isSmall ? smallSize : imageSize;
                                                const isSelected = selectedItemId === item.id;
                                                const animatedStyle = isSelected ? { transform: [{ scale: scaleAnim }] } : {};
                                                const itemOpacity = selectedItemId && !isSelected ? opacityAnim : 1;

                                                return (
                                                    <Pressable
                                                        key={item.id}
                                                        onLongPress={() => handleSelect(item.id)}
                                                        style={[styles.itemWrapper, styles.itemOverlay]}
                                                    >
                                                        <Animated.Image
                                                            source={{ uri: item.base64Image }}
                                                            style={[
                                                                styles.imageBase,
                                                                {
                                                                    width: itemSize,
                                                                    height: itemSize,
                                                                    marginVertical: 2,
                                                                    opacity: itemOpacity,
                                                                },
                                                                animatedStyle,
                                                            ]}
                                                        />
                                                        {isSelected && (
                                                            <Animated.View style={[styles.tooltipBox, {
                                                                left: itemSize + 12,
                                                                opacity: tooltipAnim,
                                                                transform: [{ translateY: tooltipAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }]
                                                            }]}>
                                                                <Text style={styles.tooltipText}>{getCategoryName(item.category?.id)}</Text>
                                                                <Text style={styles.tooltipText}>{item.brand || "Unknown Brand"}</Text>
                                                                {item.material && (<Text style={styles.tooltipText}>{item.material}</Text> )}
                                                                <Text
                                                                    style={[styles.tooltipText, { textDecorationLine: "underline", color: "#FF6B6B" }]}
                                                                    onPress={() => Linking.openURL(item.link || generateGoogleSearchLink(item))}
                                                                >
                                                                    {item.link ? getDomainFromUrl(item.link) : 'Search similar'}
                                                                </Text>


                                                            </Animated.View>
                                                        )}
                                                    </Pressable>
                                                );
                                            })
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            ) : (
                <View style={[styles.wrapper, style]}>
                    <View style={styles.container}>
                        {CATEGORY_ORDER.map((category) => {
                            const items = clothingItems.filter(
                                (item) => item.category?.id === CATEGORY_IDS[category]
                            );
                            if (!items.length) return null;

                            const isTopGroup = category === "Topwear";

                            return (
                                <View
                                    key={category}
                                    style={[styles.section, { height: isTopGroup ? imageSize : undefined }]}
                                >
                                    {isTopGroup ? (
                                        <View
                                            style={[
                                                styles.topOverlapContainer,
                                                {
                                                    width:
                                                        items.length > 1
                                                            ? imageSize + (items.length - 1) * overlap
                                                            : imageSize,
                                                    height: imageSize,
                                                },
                                            ]}
                                        >
                                            {items.map((topItem, index) => (
                                                <Image
                                                    key={topItem.id}
                                                    source={{ uri: topItem.base64Image }}
                                                    style={{
                                                        width: imageSize,
                                                        height: imageSize,
                                                        borderRadius: 12,
                                                        position: "absolute",
                                                        top: 0,
                                                        left: index * overlap,
                                                        zIndex: items.length - index,
                                                    }}
                                                />
                                            ))}
                                        </View>
                                    ) : (
                                        items.map((item) => {
                                            const isSmall = category === "Headwear" || category === "Footwear";
                                            const itemSize = isSmall ? smallSize : imageSize;

                                            return (
                                                <Image
                                                    key={item.id}
                                                    source={{ uri: item.base64Image }}
                                                    style={{
                                                        width: itemSize,
                                                        height: itemSize,
                                                        borderRadius: 12,
                                                        marginVertical: 2,
                                                    }}
                                                />
                                            );
                                        })
                                    )}
                                </View>
                            );
                        })}
                    </View>
                </View>

    );
};

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        height: '100%',
        backgroundColor: '#3A3A3A',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 0,
        alignItems: 'stretch',
        justifyContent: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        zIndex: 10,
    },
    container: {
        flexDirection: "column",
        width: '100%',
        paddingHorizontal: 12,
        zIndex: 20,
    },
    section: {
        alignItems: "center",
        marginBottom: 4,
    },
    topOverlapContainer: {
        position: "relative",
        justifyContent: "center",
        alignItems: "flex-start",
        flexDirection: 'row',
    },
    tooltipBox: {
        position: "absolute",
        top: 0,
        backgroundColor: "#3A3A3A",
        padding: 10,
        borderRadius: 12,
        maxWidth: 180,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
        zIndex: 99,
    },
    tooltipText: {
        color: "#ffffff",
        fontSize: 13,
        marginBottom: 4,
        fontWeight: "600",
    },
    imageBase: {
        borderRadius: 12,
        resizeMode: 'cover',
    },
    itemWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemOverlay: {
        position: 'relative',
        zIndex: 30,
    },
});

export default OutfitPreview;
