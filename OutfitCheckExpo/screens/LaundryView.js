import React, { useEffect, useState, useContext } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView,
    TouchableOpacity, Pressable
} from "react-native";
import Toast from 'react-native-toast-message';
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";
import { UserContext } from "../UserContext";
import { SYMBOL_ICONS } from "../constants/symbolIcons";
import { processClothingItems } from "../utils/imageUtils";
import {Ionicons} from "@expo/vector-icons";

const LaundryView = () => {
    const { userId } = useContext(UserContext);
    const [clothingItems, setClothingItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClothes = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(
                    `${API_URLS.GET_CLOTHING_ITEMS_BY_USER}/${userId}`
                );
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
        const normalized = colors?.toLowerCase().trim();
        if (normalized === "white") return "White";
        if (normalized.includes("black") || normalized.includes("dark")) return "Dark";
        return "Colored";
    };

    const groupByMachine = () => {
        const groups = {};
        clothingItems.forEach(item => {
            const washLabels = item.careSymbols?.filter(symbol => symbol.toLowerCase().includes("wash"));
            if (!washLabels || washLabels.length === 0) return;
            const first = washLabels[0].toLowerCase();
            if (first.includes("do not wash")) return;

            let groupKey;
            if (first.includes("hand")) {
                groupKey = "Hand Wash";
            } else {
                const colorGroup = classifyColor(item.baseColor);
                groupKey = `${washLabels[0]} - ${colorGroup}`;
            }
            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push(item);
        });
        return groups;
    };

    const sortByLaundryFlag = (items) => [
        ...items.filter(item => item.inLaundry),
        ...items.filter(item => !item.inLaundry)
    ];

    const groupedItems = groupByMachine();

    // Show confirm toast on long press
    const addToLaundry = (itemId) => {
        Toast.show({
            type: 'confirm',
            position: 'top',
            text1: 'Add item to laundry?',
            text2: 'Tap to confirm',
            autoHide: false,
            props: {
                onConfirm: () => sendToLaundry(itemId),
                onCancel: () => Toast.hide()
            }
        });
    };

    const sendToLaundry = async (itemId) => {
        try {
            const response = await apiClient.patch(
                API_URLS.TOGGLE_LAUNDRY(itemId),
                { inLaundry: true }
            );
            if (response.status === 200) {
                setClothingItems(prev =>
                    prev.map(it => it.id === itemId ? { ...it, inLaundry: true } : it)
                );
                Toast.show({ type: 'success', text1: 'Item sent to laundry' });
            }
        } catch (error) {
            console.error("Error sending clothing item to laundry", error);
            Toast.show({ type: 'error', text1: 'Failed to send to laundry' });
        }
    };

    const washCategory = async (items) => {
        const toToggle = items.filter(it => it.inLaundry);
        if (toToggle.length === 0) {
            Toast.show({ type: 'info', text1: 'No items in laundry' });
            return;
        }
        try {
            await Promise.all(
                toToggle.map(it =>
                    apiClient.patch(API_URLS.TOGGLE_LAUNDRY(it.id), { inLaundry: false })
                )
            );
            setClothingItems(prev =>
                prev.map(it =>
                    toToggle.some(w => w.id === it.id)
                        ? { ...it, inLaundry: false }
                        : it
                )
            );
            Toast.show({ type: 'success', text1: `${toToggle.length} items washed succesfully` });
        } catch (error) {
            console.error("Error washing category", error);
            Toast.show({ type: 'error', text1: 'Failed to wash category' });
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {Object.entries(groupedItems).map(([label, items]) => {
                    const sorted = sortByLaundryFlag(items);
                    return (
                        <View key={label} style={styles.groupContainer}>
                            <View style={styles.groupHeader}>
                                {SYMBOL_ICONS[label.split(" - ")[0]] && (
                                    <Image
                                        source={SYMBOL_ICONS[label.split(" - ")[0]]}
                                        style={styles.labelIcon}
                                    />
                                )}
                                <Text style={styles.groupTitle}>{label}</Text>
                                <TouchableOpacity
                                    style={styles.headerButton}
                                    onPress={() => washCategory(items)}
                                >
                                    <Ionicons name="water-outline" size={20} color="#89cff0" />
                                    <Text style={styles.headerButtonText}>Wash</Text>
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={sorted}
                                keyExtractor={item => item.id.toString()}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.itemsRow}
                                renderItem={({ item }) => (
                                    <Pressable
                                        onLongPress={() => !item.inLaundry && addToLaundry(item.id)}
                                        style={({ pressed }) => [
                                            styles.itemContainer,
                                            item.inLaundry && styles.inactiveItem,
                                            pressed && styles.pressedItem
                                        ]}
                                    >
                                        <View style={[
                                            styles.itemContainer,
                                            !item.inLaundry && styles.inactiveItem
                                        ]}>
                                            {item.base64Image ? (
                                                <Image source={{ uri: item.base64Image }} style={styles.itemImage} />
                                            ) : (
                                                <View style={styles.placeholder}>
                                                    <Text style={styles.placeholderText}>No Image</Text>
                                                </View>
                                            )}
                                            <Text style={styles.itemName}>{item.category.name}</Text>
                                            <Text style={styles.itemColor}>{item.baseColor}</Text>
                                        </View>
                                    </Pressable>
                                )}
                            />
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex:1, backgroundColor: '#1E1E1E' },
    loadingContainer: { flex:1, justifyContent:'center', alignItems:'center' },
    scrollContainer: { paddingBottom:40, paddingTop:20, paddingHorizontal:16 },
    groupContainer: { marginBottom:24 },
    groupHeader: { flexDirection:'row', alignItems:'center', marginBottom:12 },
    labelIcon: { width:24, height:24, marginRight:8 },
    groupTitle: {  flex: 1, fontSize:18, color:'#FFF', fontWeight:'bold' },
    itemsRow: { gap:12 },
    itemContainer: { backgroundColor:'#2C2C2C', borderRadius:12, padding:10, width:120, alignItems:'center' },
    inactiveItem: { opacity:0.3 },
    itemImage: { width:100, height:100, borderRadius:10, marginBottom:8 },
    placeholder: { width:100, height:100, borderRadius:10, backgroundColor:'#444', justifyContent:'center', alignItems:'center', marginBottom:8 },
    placeholderText: { color:'#AAA', fontSize:12 },
    itemName: { color:'#FFF', fontWeight:'600', fontSize:14 },
    itemColor: { color:'#CCC', fontSize:12 },
    headerButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4 },
    headerButtonText: { color: '#89cff0', fontSize: 14, marginLeft: 4 },
    pressedItem: { backgroundColor:'#383838' },
});

export default LaundryView;
