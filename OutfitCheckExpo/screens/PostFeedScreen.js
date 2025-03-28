import React, { useContext, useEffect, useState } from "react";
import {
    View,
    FlatList,
    StyleSheet,
    Alert,
    SafeAreaView,
} from "react-native";
import { UserContext } from "../UserContext";
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";
import {
    processPostImage,
    fetchProfileImageBase64,
    processClothingItems,
} from "../utils/imageUtils";
import PostCard from "../reusable/PostCard";


const PostFeedScreen = () => {
    const { userId } = useContext(UserContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [clothingItemsByOutfitId, setClothingItemsByOutfitId] = useState({});
    const [postImages, setPostImages] = useState({});
    const [profilePics, setProfilePics] = useState({});

    const fetchPosts = async () => {
        try {
            const response = await apiClient.get(API_URLS.GET_ALL_POSTS(userId));
            const sortedPosts = response.data.sort(
                (a, b) => new Date(b.postedAt) - new Date(a.postedAt)
            );
            setPosts(sortedPosts);
        } catch (error) {
            console.error("❌ Error loading posts:", error);
            Alert.alert("Error", "Could not load posts.");
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchPosts();
        setRefreshing(false);
    };

    const fetchClothingItemsForOutfit = async (outfitId) => {
        if (clothingItemsByOutfitId[outfitId]) return;
        try {
            const response = await apiClient.get(
                `${API_URLS.GET_OUTFIT_DETAILS}/${outfitId}`
            );
            const processedItems = await processClothingItems(
                response.data.clothingItems
            );
            setClothingItemsByOutfitId((prev) => ({
                ...prev,
                [outfitId]: processedItems,
            }));
        } catch (err) {
            console.error(`Error fetching outfit ${outfitId}:`, err);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    useEffect(() => {
        posts.forEach((post) => {
            if (post.outfitId) {
                fetchClothingItemsForOutfit(post.outfitId);
            }
        });
    }, [posts]);

    useEffect(() => {
        const fetchImages = async () => {
            const updatedImages = {};
            for (const post of posts) {
                if (post.imageUrl && !postImages[post.id]) {
                    const img = await processPostImage(post.imageUrl);
                    if (img) {
                        updatedImages[post.id] = img;
                    }
                }
            }
            setPostImages((prev) => ({ ...prev, ...updatedImages }));
        };
        if (posts.length > 0) fetchImages();
    }, [posts]);

    useEffect(() => {
        const fetchProfilePictures = async () => {
            const newProfilePics = { ...profilePics };
            for (const post of posts) {
                const uid = post.userId;
                if (!newProfilePics[uid]) {
                    const base64 = await fetchProfileImageBase64(uid);
                    if (base64) newProfilePics[uid] = base64;
                }
            }
            setProfilePics(newProfilePics);
        };
        if (posts.length > 0) fetchProfilePictures();
    }, [posts]);

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={posts}
                keyExtractor={(item) => item.id.toString()}
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
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#2C2C2C",
        marginBottom: 70,
    },
});

export default PostFeedScreen;
