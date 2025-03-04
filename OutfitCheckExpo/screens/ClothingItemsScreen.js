import React, {useState, useEffect, useContext} from "react";
import {View, Text, FlatList, Image, ActivityIndicator, Alert, StyleSheet, SafeAreaView} from "react-native";
import { useNavigation } from "@react-navigation/native";
import API_URLS from "../apiConfig";
import {UserContext} from "../UserContext";
import apiClient from "../apiClient";

const ClothingItemsScreen = () => {
    const navigation = useNavigation();
    const [clothingItems, setClothingItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { userId } = useContext(UserContext);

    useEffect(() => {
        const fetchClothingItems = async () => {
            try {
                const response = await apiClient.get(`${API_URLS.GET_CLOTHING_ITEMS_BY_USER}/${userId}`);
                const data = await response.data;

                if (response.ok) {
                    setClothingItems(data);
                } else {
                    Alert.alert("Eroare", data.message || "Nu s-au putut încărca articolele vestimentare.");
                }
            } catch (error) {
                Alert.alert("Eroare", "A apărut o problemă la încărcarea hainelor.");
                console.error("❌ Eroare:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClothingItems();
    }, []);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>
                <Text style={styles.title}>Hainele tale</Text>
                {clothingItems.length === 0 ? (
                    <Text style={styles.noItemsText}>Nu ai articole vestimentare salvate.</Text>
                ) : (
                    <FlatList
                        data={clothingItems}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.itemContainer}>
                                <Image source={{ uri: item.imageUrl }} style={styles.image} />
                                <View style={styles.infoContainer}>
                                    <Text style={styles.itemText}>Culoare: {item.color}</Text>
                                    <Text style={styles.itemText}>Material: {item.material}</Text>
                                    <Text style={styles.itemText}>Categorie: {item.category.name}</Text>
                                </View>
                            </View>
                        )}
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
    noItemsText: {
        fontSize: 18,
        color: "#A0A0A0",
        textAlign: "center",
        marginTop: 50,
    },
    itemContainer: {
        flexDirection: "row",
        backgroundColor: "#1E1E1E",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        alignItems: "center",
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 15,
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
