import React, { useEffect, useState, useContext } from "react";
import {View, Text, StyleSheet, ScrollView, Dimensions, SafeAreaView, FlatList, TouchableOpacity} from "react-native";
import { UserContext } from "../UserContext";
import apiClient from "../apiClient";
import OutfitPreview from "../reusable/OutfitPreview";
import ClothingItemStatCard from "../reusable/ClothingItemStatCard";
import {BarChart, PieChart} from "react-native-chart-kit";
import { processClothingItems } from "../utils/imageUtils";
import API_URLS from "../apiConfig";
import {useNavigation} from "@react-navigation/native";

const screenWidth = Dimensions.get("window").width;

const WardrobeStatsScreen = () => {
    const { userId } = useContext(UserContext);
    const [mostWornOutfits, setMostWornOutfits] = useState(null);
    const [topItemsByCategory, setTopItemsByCategory] = useState({});
    const [usageData, setUsageData] = useState([]);
    const [neglectedItems, setNeglectedItems] = useState([]);
    const navigation = useNavigation();

    // în afara componentului (sus în fișier)
    const CHART_COLORS = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#C780FA"];

    const getColorByIndex = idx => CHART_COLORS[idx % CHART_COLORS.length];

    useEffect(() => {
        (async () => {
            try {
                const outfitRes = await apiClient.get(API_URLS.GET_MOST_WORN_OUTFITS(userId));
                const processed = await Promise.all(
                    outfitRes.data.map(async ({ outfit, usageCount }) => {
                        const items = await processClothingItems(outfit.clothingItems);
                        return {
                            ...outfit,
                            clothingItems: items,
                            usageCount // ← păstrăm și afișăm
                        };
                    })
                );

                setMostWornOutfits(processed); // pentru secțiunea Most Worn Outfit


                const itemsRes = await apiClient.get(API_URLS.GET_MOST_USED_ITEMS(userId));

                const categorized = {};
                for (const { item, usageCount } of itemsRes.data) {
                    const category = item.category.name || "Unknown";
                    if (!categorized[category]) categorized[category] = [];
                    categorized[category].push({ item, usageCount });
                }

                const processedTopItemsList = [];

                for (const category in categorized) {
                    const [top] = categorized[category]
                        .sort((a, b) => b.usageCount - a.usageCount);

                    const [processedItem] = await processClothingItems([top.item]);
                    processedTopItemsList.push({
                        ...processedItem,
                        usageCount: top.usageCount,
                        category
                    });
                }

                setTopItemsByCategory(processedTopItemsList);


                const chartData = itemsRes.data.reduce((acc, { item, usageCount }) => {
                    const key = item.usage?.trim();
                    if (!key || key.toLowerCase() === "unknown") return acc;
                    const existing = acc.find(e => e.name === key);
                    if (existing) existing.usage += usageCount;
                    else acc.push({ name: key, usage: usageCount });
                    return acc;
                }, []);

                setUsageData(chartData.map((e, idx) => ({
                    name: e.name,
                    population: e.usage,
                    color: getColorByIndex(idx),
                    legendFontColor: "#FFF",
                    legendFontSize: 12
                })));


                // Fetch neglected items (never or rarely used)
                const neglectedRes = await apiClient.get(API_URLS.GET_NEGLECTED_ITEMS(userId));
                const processedNeglected = await Promise.all(
                    neglectedRes.data.map(async (item) => {
                        const [processedItem] = await processClothingItems([item]);
                        return { ...processedItem, usageCount: 0 };
                    })
                );
                setNeglectedItems(processedNeglected);

            } catch (err) {
                console.error("Failed to fetch wardrobe stats:", err);
            }
        })();
    }, []);

    const renderOutfits = () => (
        <FlatList
            data={mostWornOutfits}
            keyExtractor={(it, idx) => it.id?.toString() || `add-${idx}`}
            renderItem={({ item, index }) => (
                <TouchableOpacity
                    style={styles.horizontalItem}
                    onPress={() => navigation.navigate('OutfitDetails', { outfitId: item.id })}
                >
                    <View style={styles.outfitPreviewWrapper}>
                        <OutfitPreview clothingItems={item.clothingItems} compact />
                        <Text style={styles.usageBadge}>#{index + 1}</Text>
                    </View>
                </TouchableOpacity>
            )}
            horizontal
            scrollEnabled={false}
        />

    );
    const getRandomColor = () => {
        const colors = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#C780FA"];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.header}>Most Worn Outfits</Text>
                {mostWornOutfits && (
                    renderOutfits()
                )}

                {mostWornOutfits && mostWornOutfits.length > 0 && (
                    <>
                        <Text style={styles.header}>Usage Frequency per Outfit</Text>
                        <BarChart
                            data={{
                                labels: mostWornOutfits.map((o, i) => `#${i + 1}`), // sau o denumire dacă ai
                                datasets: [{ data: mostWornOutfits.map(o => o.usageCount) }]
                            }}
                            width={screenWidth - 40}
                            height={200}
                            chartConfig={{
                                backgroundGradientFrom: "#1E1E1E",
                                backgroundGradientTo: "#1E1E1E",
                                color: () => "#FF6B6B",
                                labelColor: () => "#FFF",
                                decimalPlaces: 0
                            }}
                            style={{ borderRadius: 8, marginVertical: 12 }}
                            fromZero
                            showValuesOnTopOfBars
                        />

                    </>
                )}


                {topItemsByCategory.length > 0 && (
                    <>
                        <Text style={styles.header}>Most Used Item per Category</Text>
                        <FlatList
                            data={topItemsByCategory}
                            keyExtractor={(item) => item.id.toString()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.horizontalList}
                            renderItem={({ item }) => (
                                <ClothingItemStatCard item={item} navigation={navigation} label={item.category} />
                            )}
                        />
                    </>
                )}


                <Text style={styles.header}>Clothing Usage Distribution (by Style)</Text>
                {usageData.length > 0 && (
                    <PieChart
                        data={usageData}
                        width={screenWidth - 40}
                        height={220}
                        chartConfig={{
                            backgroundColor: "#1E1E1E",
                            backgroundGradientFrom: "#1E1E1E",
                            backgroundGradientTo: "#1E1E1E",
                            decimalPlaces: 0,
                            color: () => `#FFF`,
                            labelColor: () => `#FFF`
                        }}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        absolute
                    />
                )}

                {neglectedItems.length > 0 && (
                    <>
                        <Text style={styles.header}>Rarely or Never Used Items</Text>
                        <FlatList
                            data={neglectedItems}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => <ClothingItemStatCard item={item} navigation={navigation} />}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.horizontalList}
                        />
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#1E1E1E" },
    content: { padding: 20, paddingBottom: 60 },
    header: { fontSize: 18, fontWeight: "700", color: "#FF6B6B", marginVertical: 12 },
    row: { flexDirection: "row", justifyContent: "flex-start", marginTop: 8, flexWrap: "wrap" },
    outfitWrapper: { maxHeight: 350, marginBottom: 12, width:"80%",alignSelf:"center" },
    horizontalList: { paddingVertical: 8 },
    subheader: {
        fontSize: 15,
        fontWeight: "600",
        color: "#DDD",
        marginBottom: 8,
        marginLeft: 4
    },
    horizontalItem: { marginVertical:12, marginHorizontal:6, width:screenWidth/3.75, maxHeight:250 },
    outfitPreviewWrapper: {
        position: "relative"
    },
    usageBadge: {
        position: "absolute",
        bottom: 4,
        right: 6,
        fontSize: 12,
        fontWeight: "600",
        color: "#FFF",
        backgroundColor: "#FF6B6B",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        overflow: "hidden"
    }


});

export default WardrobeStatsScreen;
