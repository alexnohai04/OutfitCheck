import React from "react";
import {
    View,
    FlatList,
    Image,
    Text,
    Alert,
    TouchableOpacity,
    StyleSheet,
    ScrollView
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { SYMBOL_ICONS } from "../constants/symbolIcons";
import globalStyles from "../styles/globalStyles";

/**
 * Props:
 * - clothes: array of clothing items
 * - categories: array of category names
 * - selectedCategory: currently selected category
 * - onSelectCategory: callback when category is selected
 * - onDelete: callback when Delete is confirmed (itemId)
 * - onWash: callback when Wash is triggered (itemId)
 */
const ClothesView = ({ clothes, categories, selectedCategory, onSelectCategory, onDelete, onWash }) => {
    const filteredClothes = selectedCategory === "All"
        ? clothes
        : clothes.filter(item => item.category.name === selectedCategory);

    const renderLeftActions = (itemId) => (
        <TouchableOpacity style={styles.washButton} onPress={() => onWash(itemId)}>
            <Text style={styles.washText}>Wash</Text>
        </TouchableOpacity>
    );

    const renderRightActions = (itemId) => (
        <TouchableOpacity style={globalStyles.deleteButton} onPress={() => confirmDelete(itemId)}>
            <Text style={globalStyles.deleteText}>Delete</Text>
        </TouchableOpacity>
    );

    const confirmDelete = (itemId) => {
        Alert.alert(
            "Are you sure?",
            "Do you really want to delete this clothing item?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Yes", onPress: () => onDelete(itemId) }
            ]
        );
    };

    const renderClothingItem = ({ item }) => (
        <Swipeable
            renderLeftActions={() => renderLeftActions(item.id)}
            renderRightActions={() => renderRightActions(item.id)}
        >
            <View style={styles.clothingItemContainer}>
                {item.base64Image ? (
                    <Image source={{ uri: item.base64Image }} style={styles.image} />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Text style={styles.imagePlaceholderText}>No Image</Text>
                    </View>
                )}
                <View style={styles.infoContainer}>
                    <Text style={styles.itemText}>Base color: {item.baseColor}</Text>
                    <Text style={styles.itemText}>Category: {item.category.name}</Text>
                    <Text style={styles.itemText}>Brand: {item.brand}</Text>
                    <Text style={styles.itemText}>Style: {item.usage}</Text>
                    <Text style={styles.itemText}>Season: {item.season}</Text>

                    {item.careSymbols && item.careSymbols.length > 0 && (
                        <View style={styles.careIconsContainer}>
                            {item.careSymbols.map((symbol) => {
                                const icon = SYMBOL_ICONS[symbol];
                                return icon ? (
                                    <Image
                                        key={symbol}
                                        source={icon}
                                        style={styles.careIcon}
                                        resizeMode="contain"
                                    />
                                ) : null;
                            })}
                        </View>
                    )}
                </View>
            </View>
        </Swipeable>
    );

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.buttonsContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryScroll}
                >
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category}
                            style={[
                                styles.categoryButton,
                                selectedCategory === category && styles.categoryButtonSelected
                            ]}
                            onPress={() => onSelectCategory(category)}
                        >
                            <Text style={styles.categoryText}>{category}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
            <FlatList
                data={filteredClothes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderClothingItem}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    buttonsContainer: {
        height: 50,
        marginBottom: 10,
    },
    categoryScroll: {
        flexGrow: 0,
        padding: 5,
    },
    categoryButton: {
        minWidth: 80,
        height: 40,
        paddingHorizontal: 16,
        backgroundColor: "#564c4c",
        borderRadius: 8,
        marginHorizontal: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    categoryButtonSelected: {
        backgroundColor: "#FF6B6B",
    },
    categoryText: {
        color: "#FFFFFF",
        fontSize: 16,
    },
    listContainer: {
        paddingBottom: 100,
    },
    clothingItemContainer: {
        flexDirection: "row",
        backgroundColor: "#3A3A3A",
        padding: 15,
        borderRadius: 10,
        marginVertical: 5,
        marginHorizontal: 15,
        alignItems: "center",
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 15,
    },
    imagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 15,
        backgroundColor: "#444",
        justifyContent: "center",
        alignItems: "center",
    },
    imagePlaceholderText: {
        color: "#A0A0A0",
        fontSize: 14,
    },
    infoContainer: {
        flex: 1,
    },
    itemText: {
        fontSize: 16,
        color: "#FFFFFF",
        marginBottom: 5,
    },
    careIconsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 10,
        gap: 6,
    },
    careIcon: {
        width: 24,
        height: 24,
    },
    // Swipe-to-wash button
    washButton: {
        backgroundColor: "#4EA8DE",
        justifyContent: "center",
        alignItems: "center",
        width: 100,
        marginVertical: 5,
        borderRadius: 10,
        marginLeft: 15,
    },
    washText: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 16,
    },
});

export default ClothesView;
