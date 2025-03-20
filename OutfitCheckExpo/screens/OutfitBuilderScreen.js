import React, {useContext, useEffect, useMemo, useRef, useState} from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    PanResponder,
    SafeAreaView, ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Animated, {useAnimatedStyle, useSharedValue, withSpring} from "react-native-reanimated";
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";
import globalStyles from "../styles/globalStyles";
import {UserContext} from "../UserContext";
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get("window");

const OutfitBuilderScreen = () => {
    const [wardrobe, setWardrobe] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [outfitName, setOutfitName] = useState();
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const { userId } = useContext(UserContext);

    const panelPosition = useSharedValue(height * 0.5); // 📌 Panel starts at 50% of the screen
    const isDragging = useRef(false);

    const CATEGORY_ORDER = ["Hat", "Top", "Pants", "Shoes"];
    const CATEGORY_IDS = {
        Hat: 4,
        Top: 1,
        Pants: 2,
        Shoes: 3,
    };


    useEffect(() => {
        const fetchClothingItems = async () => {
            try {
                const response = await apiClient.get(`${API_URLS.GET_CLOTHING_ITEMS_BY_USER}/${userId}`);
                console.log("📥 Clothing items received:", response.data);
                setWardrobe(response.data);
            } catch (error) {
                console.error("❌ Error loading clothing items:", error);
                Alert.alert("Error", "Failed to load clothing items.");
            } finally {
                setLoading(false); // ✅ Stop loading when done
            }
        };
        fetchClothingItems();
    }, [userId]);


    const toggleItemSelection = (item) => {
        setSelectedItems((prevItems) => {
            // Dacă articolul este deja selectat, îl elimină
            if (prevItems.some(i => i.id === item.id)) {
                return prevItems.filter(i => i.id !== item.id);
            }

            // Gestionăm cazul pentru Top (maxim 2)
            if (item.category.id === CATEGORY_IDS.Top) {
                const tops = prevItems.filter(i => i.category.id === CATEGORY_IDS.Top);

                if (tops.length < 2) {
                    return [...prevItems, item]; // Adaugă Top-ul dacă sunt mai puțin de 2
                }

                return [...tops.slice(1), item, ...prevItems.filter(i => i.category.id !== CATEGORY_IDS.Top)]; // Înlocuiește doar unul, păstrând restul outfitului
            }

            // Gestionăm Hat, Pants și Shoes (doar unul per categorie, fără să șteargă restul)
            return [...prevItems.filter(i => i.category.id !== item.category.id), item];
        });
    };



    const saveOutfit = async () => {
        if (selectedItems.length === 0) {
            Alert.alert("Error", "Please select at least one clothing item!");
            return;
        }

        const newOutfit = {
            name: outfitName.trim() !== "" ? outfitName : "Untitled Outfit",
            creatorId: userId,
            items: selectedItems.map((i) => i.id),
        };

        try {
            await apiClient.post(API_URLS.CREATE_OUTFIT, newOutfit);
            Alert.alert("Success", "Outfit saved successfully!");
            //setSelectedItems([]);
            navigation.navigate("UserOutfits");
        } catch (error) {
            console.error("❌ Error saving outfit:", error);
            Alert.alert("Error", "Failed to save outfit.");
        }
    };

    const animatedStyle = useAnimatedStyle(() => ({
        top: withSpring(panelPosition.value, { damping: 20, stiffness: 150 }),
    }));

    const outfitListScale = useAnimatedStyle(() => {
        const scaleFactor = panelPosition.value > height * 0.6 ? 1.2 : 1.0; // ✅ Expands when panel shrinks
        const translateY = panelPosition.value > height * 0.6 ? 30 : 0; // ✅ Moves the list downward to prevent overlap
        const marginTop = panelPosition.value > height * 0.6 ? 40 : 10; // ✅ Ensures extra space above the list

        return {
            transform: [{ scale: withSpring(scaleFactor) }, { translateY: withSpring(translateY) }],
            marginTop: withSpring(marginTop), // ✅ Keeps space between list and text
        };
    });

    const panResponder = useMemo(() => {
        return PanResponder.create({
            onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 10,
            onPanResponderGrant: (_, gesture) => {
                const touchY = gesture.y0;
                if (touchY > panelPosition.value - 30 && touchY < panelPosition.value + 30) {
                    isDragging.current = true;
                }
            },
            onPanResponderMove: (_, gesture) => {
                if (isDragging.current) {
                    panelPosition.value = Math.max(height * 0.5, Math.min(height * 0.7, panelPosition.value + gesture.dy));
                }
            },
            onPanResponderRelease: (_, gesture) => {
                isDragging.current = false;
                panelPosition.value = panelPosition.value > height * 0.6 ? height * 0.7 : height * 0.5;
            },
        });
    }, []);

    if (loading) {
        return (
            <View style={globalStyles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
        );
    }
    return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={styles.outfitContainer}>
                <TextInput
                    style={styles.input}
                    value={outfitName}
                    onChangeText={setOutfitName}
                    placeholder="Name your outfit..."
                    placeholderTextColor="#888"
                />
                <Animated.View style={[styles.outfitListContainer, outfitListScale]}>
                    <FlatList
                        data={CATEGORY_ORDER.flatMap(category =>
                            category === "Top"
                                ? [selectedItems.filter(item => item.category.id === CATEGORY_IDS[category])] // Afișează ca un array
                                : selectedItems.filter(item => item.category.id === CATEGORY_IDS[category])
                        )}
                        keyExtractor={(item, index) => (Array.isArray(item) ? `top-group-${index}` : item.id.toString())}
                        renderItem={({ item }) => {
                            const isHatOrShoes = !Array.isArray(item) && (item.category.id === CATEGORY_IDS.Hat || item.category.id === CATEGORY_IDS.Shoes);
                            const imageStyle = isHatOrShoes
                                ? { width: styles.image.width * 0.5, height: styles.image.height * 0.5 } // Reducere 50% pentru Hat și Shoes
                                : styles.image;

                            return (
                                Array.isArray(item) ? (
                                    <View style={{ flexDirection: "row", justifyContent: "center" }}>
                                        {item.map((topItem) => (
                                            <TouchableOpacity key={topItem.id} style={styles.outfitItem}>
                                                <Image source={{ uri: topItem.imageUrl }} style={styles.image} />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                ) : (
                                    <View style={styles.outfitItemContainer}>
                                        <TouchableOpacity style={styles.outfitItem}>
                                            <Image source={{ uri: item.imageUrl }} style={imageStyle} />
                                        </TouchableOpacity>
                                    </View>
                                )
                            );
                        }}
                    />



                </Animated.View>
            </View>

            <Animated.View
                style={[styles.panelContainer, animatedStyle]}
                {...panResponder.panHandlers}
            >
                <TouchableOpacity style={styles.panelHandle} onPress={() => (isDragging.current = true)} />
                <Text style={globalStyles.title}>Select clothing items</Text>

                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
                    nestedScrollEnabled={true} // ✅ Allows scrolling inside a nested list
                >
                    {CATEGORY_ORDER.map(category => (
                        <View key={category} style={styles.sectionContainer}>
                            <Text style={styles.sectionHeader}>{category}</Text>
                            <FlatList
                                data={wardrobe.filter(item => item.category.id === CATEGORY_IDS[category])}
                                keyExtractor={(item) => item.id.toString()}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => toggleItemSelection(item)}
                                        style={[
                                            styles.clothingItem,
                                            selectedItems.some((i) => i.id === item.id) && styles.selectedItem,
                                        ]}
                                    >
                                        <Image source={{ uri: item.imageUrl }} style={styles.image} />
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    ))}

                    {/* ✅ Ensure Save Button is at the bottom */}
                    <TouchableOpacity style={globalStyles.button} onPress={saveOutfit}>
                        <Text style={globalStyles.buttonText}>Save Outfit</Text>
                    </TouchableOpacity>
                </ScrollView>
            </Animated.View>
        </SafeAreaView>

    );
};

const styles = StyleSheet.create({
    outfitListContainer: {
        marginTop: 20, // ✅ Ensures space below text
        flex: 1, // ✅ Prevents layout conflicts
        justifyContent: "flex-start",
        alignItems: "center",
    },

    outfitItemContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    outfitItem: {
        padding: 15,
        backgroundColor: "#333",
        borderRadius: 10,
        alignItems: "center",
    },
    itemText: {
        color: "#FFF",
        marginTop: 5,
    },

    safeContainer: {
        flex: 1,
        backgroundColor: "#2C2C2C",
    },
    outfitContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 20,
    },
    input: {
        width: "50%",
        padding: 8,
        marginBottom: 5,
        borderWidth: 1,
        borderColor: "#444",
        borderRadius: 8,
        backgroundColor: "#3A3A3A",
        color: "#FFFFFF",
        textAlign: "center",
        fontSize: 18,
    },
    panelContainer: {
        position: "absolute",
        width: "100%",
        height: height * 0.6,
        backgroundColor: "#1E1E1E",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        flex: 1,
    },
    sectionContainer: {
        marginBottom: 10,
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFFFFF",
        paddingVertical: 10,
        backgroundColor: "#333",
        textAlign: "center",
    },
    clothingItem: {
        margin: 5,
        alignItems: "center",
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#333",
    },
    selectedItem: {
        borderColor: "#FF6B6B",
        borderWidth: 2,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 10,
    },
    panelHandle: {
        width: 60,
        height: 6,
        backgroundColor: "#888",
        borderRadius: 3,
        alignSelf: "center",
        marginBottom: 10,
    },
});

export default OutfitBuilderScreen;
