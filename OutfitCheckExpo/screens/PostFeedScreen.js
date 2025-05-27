// PostFeedScreen.js
import React, { useContext, useEffect, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Alert,
    SafeAreaView,
    View,
    Image,
    Text,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UserContext } from "../UserContext";
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";
import {
    processPostImage,
    fetchProfileImageBase64,
    processClothingItems,
} from "../utils/imageUtils";
import PostCard from "../reusable/PostCard";
import ModeSelectorModal from "../reusable/ModeSelectorModal";
const PostFeedScreen = () => {
    const { userId } = useContext(UserContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [clothingItemsByOutfitId, setClothingItemsByOutfitId] = useState({});
    const [postImages, setPostImages] = useState({});
    const [profilePics, setProfilePics] = useState({});
    const [feedType, setFeedType] = useState("forYou");
    const [modalVisible, setModalVisible] = useState(false);

    const modeOptions = [
        { id: "forYou", label: "For You", icon: "home-outline" },
        { id: "following", label: "Following", icon: "people-outline" },
    ];

    const fetchForYou = async () => {
        try {
            const { data } = await apiClient.get(API_URLS.GET_ALL_POSTS(userId));
            setPosts(
                data.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt))
            );
        } catch {
            Alert.alert("Error", "Could not load posts.");
        }
    };

    const fetchFollowingPosts = async () => {
        try {
            const { data } = await apiClient.get(
                API_URLS.GET_FOLLOWING_POSTS(userId)
            );
            setPosts(
                data.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt))
            );
        } catch {
            Alert.alert("Error", "Could not load following feed.");
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        if (feedType === "forYou") await fetchForYou();
        else await fetchFollowingPosts();
        setRefreshing(false);
    };

    useEffect(() => {
        setLoading(true);
        handleRefresh().finally(() => setLoading(false));
    }, [feedType]);

    useEffect(() => {
        posts.forEach((p) => {
            if (p.outfitId) fetchClothingItemsForOutfit(p.outfitId);
        });
    }, [posts]);

    useEffect(() => {
        const loadImages = async () => {
            const updated = {};
            for (const p of posts) {
                if (p.imageUrl && !postImages[p.id]) {
                    const img = await processPostImage(p.imageUrl);
                    if (img) updated[p.id] = img;
                }
            }
            setPostImages((prev) => ({ ...prev, ...updated }));
        };
        if (posts.length) loadImages();
    }, [posts]);

    useEffect(() => {
        const loadProfiles = async () => {
            const pics = { ...profilePics };
            for (const p of posts) {
                if (!pics[p.userId]) {
                    const b64 = await fetchProfileImageBase64(p.userId);
                    if (b64) pics[p.userId] = b64;
                }
            }
            setProfilePics(pics);
        };
        if (posts.length) loadProfiles();
    }, [posts]);

    const fetchClothingItemsForOutfit = async (outfitId) => {
        if (clothingItemsByOutfitId[outfitId]) return;
        try {
            const resp = await apiClient.get(
                `${API_URLS.GET_OUTFIT_DETAILS}/${outfitId}`
            );
            const items = await processClothingItems(resp.data.clothingItems);
            setClothingItemsByOutfitId((prev) => ({
                ...prev,
                [outfitId]: items,
            }));
        } catch {
            console.error("Error fetching outfit", outfitId);
        }
    };

    const renderHeader = () => {
        const current = modeOptions.find((o) => o.id === feedType);
        return (
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.dropdownToggle}
                    onPress={() => setModalVisible(true)}
                >

                    <Text style={styles.dropdownText}>
                        {current.label} <Ionicons name="chevron-down" size={20} color="#FFF" />
                    </Text>

                </TouchableOpacity>

            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ModeSelectorModal
                visible={modalVisible}
                options={modeOptions}
                selectedId={feedType}
                title="Select Feed"
                onSelect={(type) => setFeedType(type)}
                onClose={() => setModalVisible(false)}
            />

            <FlatList
                data={posts}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={renderHeader}
                renderItem={({ item }) => (
                    <PostCard
                        post={item}
                        profilePic={profilePics[item.userId]}
                        postImage={postImages[item.id]}
                        clothingItems={clothingItemsByOutfitId[item.outfitId]}
                    />
                )}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                contentContainerStyle={{ paddingBottom: 80 }}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#2C2C2C" },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
       // fontFamily: 'PalanquinDark',
    },
    header: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        //flexWrap:"wrap"
    },
    dropdownToggle: { flexDirection: "row", justifyContent: "center"  },
    dropdownText: { fontSize: 24, color: "#FFF", fontWeight: "bold" },
    logo:{
        position: "absolute",
        width: "40%",  // jumătate din lățimea ecranului
        height: 25,
        right: 10,
        top: 10// ajustează după necesitate
        //marginBottom: 12,
       // marginLeft: 15
    },
});

export default PostFeedScreen;
