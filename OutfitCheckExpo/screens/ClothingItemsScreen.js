import React, { useState, useEffect, useContext } from "react";
import {
    View,
    Text,
    FlatList,
    Image,
    ActivityIndicator,
    Alert,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import API_URLS from "../apiConfig";
import { UserContext } from "../UserContext";
import apiClient from "../apiClient";
import { Swipeable } from "react-native-gesture-handler";
import globalStyles from "../styles/globalStyles";
import { processClothingItems } from "../utils/imageUtils";
import Icon from "react-native-vector-icons/Ionicons";

const ClothingItemsScreen = () => {
    const navigation = useNavigation();
    const [clothingItems, setClothingItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const { userId } = useContext(UserContext);

    useEffect(() => {
        if (!userId) {
            console.log("⚠️ userId is not defined, skipping API request.");
            return;
        }

        const fetchClothingItems = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(`${API_URLS.GET_CLOTHING_ITEMS_BY_USER}/${userId}`);

                if (response.status === 200) {
                    const updatedItems = await processClothingItems(response.data);
                    setClothingItems(updatedItems);
                } else {
                    Alert.alert("Error", response.data.message || "Could not load clothing items.");
                }
            } catch (error) {
                Alert.alert("Error", "There was a problem loading clothing items.");
            } finally {
                setLoading(false);
            }
        };

        fetchClothingItems();
    }, [userId]);

    const deleteClothingItem = async (itemId) => {
        try {
            const response = await apiClient.delete(API_URLS.DELETE_CLOTHING_ITEM(itemId));
            if (response.status === 200) {
                setClothingItems(prevItems => prevItems.filter(item => item.id !== itemId));
                Alert.alert("Success", "Clothing item deleted successfully!");
            } else {
                Alert.alert("Error", "Failed to delete clothing item.");
            }
        } catch (error) {
            Alert.alert("Error", "Could not delete clothing item.");
        }
    };

    const confirmDelete = (itemId) => {
        Alert.alert(
            "Are you sure?",
            "Do you really want to delete this clothing item?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Yes", onPress: () => deleteClothingItem(itemId) }
            ]
        );
    };

    const renderRightActions = (itemId) => (
        <TouchableOpacity style={globalStyles.deleteButton} onPress={() => confirmDelete(itemId)}>
            <Text style={globalStyles.deleteText}>Delete</Text>
        </TouchableOpacity>
    );

    const renderItem = ({ item }) => (
        <Swipeable renderRightActions={() => renderRightActions(item.id)}>
            <View style={styles.itemContainer}>
                {item.base64Image ? (
                    <Image source={{ uri: item.base64Image }} style={styles.image} />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Text style={styles.imagePlaceholderText}>No Image</Text>
                    </View>
                )}
                <View style={styles.infoContainer}>
                    <Text style={styles.itemText}>Color: {item.color}</Text>
                    <Text style={styles.itemText}>Material: {item.material}</Text>
                    <Text style={styles.itemText}>Category: {item.category.name}</Text>
                </View>
            </View>
        </Swipeable>
    );

    if (loading) {
        return (
            <View style={globalStyles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
        );
    }

    const categories = ["All", ...new Set(clothingItems.map(item => item.category.name))];

    const filteredItems = selectedCategory === "All"
        ? clothingItems
        : clothingItems.filter(item => item.category.name === selectedCategory);

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Your Clothes</Text>
            <TouchableOpacity
                style={globalStyles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>


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
                            onPress={() => setSelectedCategory(category)}
                        >
                            <Text style={styles.categoryText}>{category}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.listContainer}>
                {filteredItems.length === 0 ? (
                    <Text style={styles.noItemsText}>No items in this category.</Text>
                ) : (
                    <FlatList
                        data={filteredItems}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#2C2C2C",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 20,
        textAlign: "center",
    },
    buttonsContainer: {
        height: 50,
        marginBottom: 10,
    },
    categoryScroll: {
        flexGrow: 0,
        padding: 5
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
        flex: 1,
    },
    noItemsText: {
        fontSize: 18,
        color: "#A0A0A0",
        textAlign: "center",
        marginTop: 20,
    },
    itemContainer: {
        flexDirection: "row",
        backgroundColor: "#1E1E1E",
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
});

export default ClothingItemsScreen;