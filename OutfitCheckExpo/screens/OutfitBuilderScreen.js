import React, {useContext, useEffect, useMemo, useRef, useState} from "react";
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    PanResponder,
    SafeAreaView, ScrollView,
    SectionList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import Animated, {useAnimatedStyle, useSharedValue, withSpring} from "react-native-reanimated";
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";
import globalStyles from "../styles/globalStyles";
import {UserContext} from "../UserContext";

const { height } = Dimensions.get("window");

const OutfitBuilderScreen = () => {
    const [wardrobe, setWardrobe] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [outfitName, setOutfitName] = useState();
    const { userId } = useContext(UserContext);

    const panelPosition = useSharedValue(height * 0.5); // 📌 Panel starts at 50% of the screen
    const isDragging = useRef(false);

    useEffect(() => {
        const fetchClothingItems = async () => {
            try {
                const response = await apiClient.get(`${API_URLS.GET_CLOTHING_ITEMS_BY_USER}/${userId}`);
                console.log("📥 Clothing items received:", response.data);
                setWardrobe(response.data);
            } catch (error) {
                console.error("❌ Error loading clothing items:", error);
                Alert.alert("Error", "Failed to load clothing items.");
            }
        };
        fetchClothingItems();
    }, [userId]);

    const groupedClothing = wardrobe.reduce((acc, item) => {
        const category = item.category.name;
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {});

    const sections = Object.keys(groupedClothing).map((category) => ({
        title: category,
        data: groupedClothing[category],
    }));

    const toggleItemSelection = (item) => {
        setSelectedItems((prevItems) =>
            prevItems.some((i) => i.id === item.id)
                ? prevItems.filter((i) => i.id !== item.id)
                : [...prevItems, item]
        );
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
            setSelectedItems([]);
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
                    <DraggableFlatList
                        data={selectedItems}
                        keyExtractor={(item) => item.id.toString()}
                        onDragEnd={({ data }) => setSelectedItems(data)}
                        renderItem={({ item, drag }) => (
                            <View style={styles.outfitItemContainer}>
                                <TouchableOpacity onLongPress={drag} style={styles.outfitItem}>
                                    <Image source={{ uri: item.imageUrl }} style={styles.image} />
                                </TouchableOpacity>
                            </View>
                        )}
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
                    {sections.map((section) => (
                        <View key={section.title} style={styles.sectionContainer}>
                            <Text style={styles.sectionHeader}>{section.title}</Text>
                            <FlatList
                                data={section.data}
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
        width: "80%",
        padding: 12,
        marginBottom: 15,
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
