// components/wardrobe/LaundryView.js

import React, { useEffect, useState, useContext } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView,
} from "react-native";
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";
import { UserContext } from "../UserContext";
import { SYMBOL_ICONS } from "../constants/symbolIcons";
import { processClothingItems } from "../utils/imageUtils";

const LaundryView = () => {
    const { userId } = useContext(UserContext);
    const [clothingItems, setClothingItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClothes = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(`${API_URLS.GET_CLOTHING_ITEMS_BY_USER}/${userId}`);
                const processed = await processClothingItems(response.data);
                setClothingItems(processed);
            } catch (error) {
                console.error("Failed to fetch clothing items:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClothes();
    }, [userId]);

    const classifyColor = (colors) => {
        const normalizedColors = colors.map(c => c.toLowerCase().trim());
        if (normalizedColors.length === 1 && normalizedColors[0] === "white") return "White";
        if (normalizedColors.some(c => c.includes("black") || c.includes("dark"))) return "Dark";
        return "Colored";
    };

    const groupByMachine = () => {
        const groups = {};
        clothingItems.forEach(item => {
            const washLabels = item.careSymbols?.filter(symbol => symbol.toLowerCase().includes("wash"));
            if (washLabels && washLabels.length > 0) {
                const colorGroup = classifyColor(item.colors);
                const groupKey = `${washLabels[0]} - ${colorGroup}`;
                if (!groups[groupKey]) groups[groupKey] = [];
                groups[groupKey].push(item);
            }
        });
        return groups;
    };

    const groupedItems = groupByMachine();

    // if (loading) {
    //     return (
    //         <View style={styles.loadingContainer}>
    //             <ActivityIndicator size="large" color="#FF6B6B" />
    //         </View>
    //     );
    // }

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            {Object.entries(groupedItems).map(([label, items]) => (
                <View key={label} style={styles.groupContainer}>
                    <View style={styles.groupHeader}>
                        {SYMBOL_ICONS[label.split(" - ")[0]] && (
                            <Image source={SYMBOL_ICONS[label.split(" - ")[0]]} style={styles.labelIcon} resizeMode="contain" />
                        )}
                        <Text style={styles.groupTitle}>{label}</Text>
                    </View>
                    <FlatList
                        data={items}
                        keyExtractor={(item) => item.id.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.itemsRow}
                        renderItem={({ item }) => (
                            <View style={styles.clothingItemContainer}>
                                {item.base64Image ? (
                                    <Image source={{ uri: item.base64Image }} style={styles.image} />
                                ) : (
                                    <View style={styles.imagePlaceholder}>
                                        <Text style={styles.imagePlaceholderText}>No Image</Text>
                                    </View>
                                )}
                                <Text style={styles.itemText}>{item.category.name}</Text>
                                <Text style={styles.itemSubText}>{item.colors.join(', ')}</Text>
                            </View>
                        )}
                    />
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollContainer: {
        paddingBottom: 40,
        paddingTop: 20,
        paddingHorizontal: 16,
    },
    groupContainer: {
        marginBottom: 24,
    },
    groupHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    labelIcon: {
        width: 24,
        height: 24,
    },
    groupTitle: {
        fontSize: 18,
        color: "#FFF",
        fontWeight: "bold",
    },
    itemsRow: {
        gap: 12,
    },
    clothingItemContainer: {
        backgroundColor: "#2C2C2C",
        borderRadius: 12,
        padding: 10,
        width: 120,
        alignItems: "center",
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginBottom: 8,
    },
    imagePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 10,
        backgroundColor: "#444",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    imagePlaceholderText: {
        color: "#AAA",
        fontSize: 12,
    },
    itemText: {
        color: "#FFF",
        fontWeight: "600",
        fontSize: 14,
    },
    itemSubText: {
        color: "#CCC",
        fontSize: 12,
    },
});

export default LaundryView;
