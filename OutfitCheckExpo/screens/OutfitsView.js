// components/wardrobe/OutfitsView.js

import React from "react";
import {
    FlatList,
    TouchableOpacity,
    View,
    StyleSheet,
    Text,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import OutfitPreview from "../reusable/OutfitPreview";
const OutfitsView = ({ outfits, navigation, selectedCategory, onSelectCategory }) => {
    const filteredOutfits = selectedCategory === "All"
        ? outfits
        : outfits.filter(item => item.category?.name === selectedCategory);

    const dataWithAddButton = [{ isAddButton: true }, ...filteredOutfits];

    const renderOutfitItem = ({ item }) => {
        if (item.isAddButton) {
            return (
                <TouchableOpacity
                    style={styles.gridItem}
                    onPress={() => navigation.navigate("OutfitBuilder")}
                >
                    <View style={styles.outfitPreviewWrapper}>
                        <View style={styles.outfitPreviewContainer}>
                            <Ionicons name="add" size={40} color="#FFF" />
                        </View>
                    </View>
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                style={styles.gridItem}
                onPress={() => navigation.navigate("OutfitDetails", { outfitId: item.id })}
            >
                <OutfitPreview clothingItems={item.clothingItems} compact />
            </TouchableOpacity>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.buttonsContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryScroll}
                >
                    <TouchableOpacity
                        style={[
                            styles.categoryButton,
                            selectedCategory === "All" && styles.categoryButtonSelected
                        ]}
                        onPress={() => onSelectCategory("All")}
                    >
                        <Text style={styles.categoryText}>All</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
            <FlatList
                data={dataWithAddButton}
                keyExtractor={(item, index) => item.id?.toString() || `add-${index}`}
                renderItem={renderOutfitItem}
                numColumns={3}
                columnWrapperStyle={styles.row}
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
        paddingHorizontal: 10,
    },
    row: {
        flex: 1,
    },
    gridItem: {
        width: "30%",
        margin: 5,
        alignItems: "flex-start",
        justifyContent: "center",
    },
    outfitPreviewWrapper: {
        width: "100%",
        borderWidth: 2,
        borderColor: "#3A3A3A",
        borderRadius: 16,
        borderStyle: "dashed",
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 290,
    },
    outfitPreviewContainer: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
});

export default OutfitsView;

