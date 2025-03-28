import React, {useContext, useEffect, useState} from "react";
import {SafeAreaView, StyleSheet, ActivityIndicator, Alert} from "react-native";
import PostCard from "../reusable/PostCard";
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";
import { processClothingItems } from "../utils/imageUtils";
import {UserContext} from "../UserContext";

const PostDetailsScreen = ({ route }) => {
    const { post, postImage, profilePic } = route.params;
    const [clothingItems, setClothingItems] = useState(null);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const { userId } = useContext(UserContext);

    useEffect(() => {
        const fetchClothingItems = async () => {
            try {
                const response = await apiClient.get(`${API_URLS.GET_OUTFIT_DETAILS}/${post.outfitId}`);
                const items = await processClothingItems(response.data.clothingItems);
                setClothingItems(items);
            } catch (err) {
                console.error("❌ Error loading outfit details:", err);
            } finally {
                setLoading(false);
            }
        };

        if (post.outfitId) {
            fetchClothingItems();
        } else {
            setLoading(false);
        }
    }, [post]);


    const toggleLike = async (postId) => {
        try {
            await apiClient.post(API_URLS.TOGGLE_LIKE(postId, userId));
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === postId
                        ? {
                            ...post,
                            likedByCurrentUser: !post.likedByCurrentUser,
                            likeCount: post.likedByCurrentUser
                                ? post.likeCount - 1
                                : post.likeCount + 1,
                        }
                        : post
                )
            );
        } catch (error) {
            console.error("❌ Error toggling like:", error);
            Alert.alert("Error", "Could not update like.");
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loader}>
                <ActivityIndicator size="large" color="#FF6B6B" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <PostCard
                post={post}
                profilePic={profilePic}
                postImage={postImage}
                clothingItems={clothingItems}
                onLike={() => toggleLike(item.id)}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: "#1E1E1E",
        flex: 1,
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#1E1E1E",
    },
});

export default PostDetailsScreen;
