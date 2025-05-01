import React, { useContext, useEffect, useState, useRef } from "react";
import {
    SafeAreaView,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Modal,
    View,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Animated
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import PostCard from "../reusable/PostCard";
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";
import { processClothingItems } from "../utils/imageUtils";
import { UserContext } from "../UserContext";
import { useNavigation } from "@react-navigation/native";
import globalStyles from "../styles/globalStyles";

const PostDetailsScreen = ({ route }) => {
    const { post, postImage, profilePic } = route.params;
    const [clothingItems, setClothingItems] = useState(null);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const { userId } = useContext(UserContext);
    const navigation = useNavigation();

    const [optionsVisible, setOptionsVisible] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(300)).current;

    const openModal = () => {
        setOptionsVisible(true);
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const closeModal = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 300,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setOptionsVisible(false);
        });
    };

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

    const handleOptionsPress = () => {
        openModal();
    };

    const handleEditPost = () => {
        closeModal();
        Alert.alert("Edit Post", "Feature in progress 👷");
    };

    const handleDeletePost = async () => {
        try {
            closeModal();
            await apiClient.delete(API_URLS.DELETE_POST(post.id));
            Alert.alert("Deleted", "Post has been deleted.");
            navigation.goBack();
        } catch (error) {
            console.error("❌ Error deleting post:", error);
            Alert.alert("Error", "Could not delete the post.");
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
                onLike={() => toggleLike(post.id)}
                onOptionsPress={handleOptionsPress}
            />

            {optionsVisible && (
                <View style={StyleSheet.absoluteFill}>
                    <TouchableWithoutFeedback onPress={closeModal}>
                        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]} />
                    </TouchableWithoutFeedback>

                    <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
                        <View style={globalStyles.dragBar} />

                        <TouchableOpacity style={styles.modalButton} onPress={handleEditPost}>
                            <Ionicons name="pencil-outline" size={20} color="#fff" style={styles.icon} />
                            <Text style={styles.modalButtonText}>Edit Post</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalButton} onPress={handleDeletePost}>
                            <Ionicons name="trash-outline" size={20} color="#FF6B6B" style={styles.icon} />
                            <Text style={[styles.modalButtonText, styles.deleteText]}>Delete Post</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
                            <Text style={styles.modalCancel}>Cancel</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            )}
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
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        backgroundColor: "#2c2c2c",
        paddingTop: 12,
        paddingBottom: 25,
        paddingHorizontal: 25,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },

    modalButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
    },
    icon: {
        marginRight: 12,
    },
    modalButtonText: {
        fontSize: 16,
        color: "#fff",
    },
    modalCancel: {
        fontSize: 16,
        color: "#aaa",
        textAlign: "center",
        marginTop: 20,
    },
    deleteText: {
        color: "#FF6B6B",
        fontWeight: "bold",
    },
});

export default PostDetailsScreen;