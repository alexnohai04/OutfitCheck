import React from "react";
import { View, Image, StyleSheet } from "react-native";

const CATEGORY_ORDER = ["Hat", "Top", "Pants", "Shoes"];
const CATEGORY_IDS = {
    Hat: 4,
    Top: 1,
    Pants: 2,
    Shoes: 3,
};

const OutfitPreview = ({ clothingItems, compact = false, size = "medium", style }) => {
    if (!Array.isArray(clothingItems)) return null;

    const imageSize = size === "large" ? 100 : compact ? 60 : 90;
    const smallSize = size === "large" ? 70 : compact ? 35 : 50;
    const overlap = size === "large" ? 80 : compact ? 40 : 70;

    return (
        <View style={[styles.wrapper, style]}>
            <View style={styles.container}>
                {CATEGORY_ORDER.map((category) => {
                    const items = clothingItems.filter(
                        (item) => item.category?.id === CATEGORY_IDS[category]
                    );
                    if (!items.length) return null;

                    const isTopGroup = category === "Top";

                    return (
                        <View
                            key={category}
                            style={[
                                styles.section,
                                { height: isTopGroup ? imageSize : undefined },
                            ]}
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
                                                position: "absolute",
                                                top: 0,
                                                left: index * overlap,
                                                zIndex: items.length - index,
                                                width: imageSize,
                                                height: imageSize,
                                                borderRadius: 10,
                                            }}
                                        />
                                    ))}
                                </View>
                            ) : (
                                items.map((item) => {
                                    const isSmall =
                                        category === "Hat" || category === "Shoes";
                                    const size = isSmall ? smallSize : imageSize;

                                    return (
                                        <Image
                                            key={item.id}
                                            source={{ uri: item.base64Image }}
                                            style={{
                                                width: size,
                                                height: size,
                                                borderRadius: 10,
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
        padding: 12,
        borderRadius: 16,
        backgroundColor: '#bebebe',
        alignItems: 'center',
        // shadowColor: "#000",
        // shadowOffset: { width: 0, height: 4 },
        // shadowOpacity: 0.3,
        // shadowRadius: 6,
        elevation: 4,
    },

    container: {
        alignItems: "center",
    },
    section: {
        alignItems: "center",
        marginBottom: 4,
    },
    topOverlapContainer: {
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
    },
});

export default OutfitPreview;
