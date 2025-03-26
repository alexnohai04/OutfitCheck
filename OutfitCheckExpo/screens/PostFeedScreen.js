import React, { useContext, useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    SafeAreaView,
    Dimensions,
    ScrollView,
} from "react-native";
import { UserContext } from "../UserContext";
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";
import OutfitPreview from "../reusable/OutfitPreview";
import Icon from "react-native-vector-icons/Ionicons";
import moment from "moment";
import {
    processPostImage,
    fetchProfileImageBase64,
    processClothingItems,
} from "../utils/imageUtils";

const { width } = Dimensions.get("window");
const CARD_SIZE = width - 20;

const PostFeedScreen = () => {
    const { userId } = useContext(UserContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clothingItemsByOutfitId, setClothingItemsByOutfitId] = useState({});
    const [postImages, setPostImages] = useState({});
    const [profilePics, setProfilePics] = useState({});
    const [currentIndexes, setCurrentIndexes] = useState({});

    const fetchPosts = async () => {
        setLoading(true);
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

        if (posts.length > 0) {
            fetchImages();
        }
    }, [posts]);

    useEffect(() => {
        const fetchProfilePictures = async () => {
            const newProfilePics = { ...profilePics };

            for (const post of posts) {
                const uid = post.userId;

                if (!newProfilePics[uid]) {
                    const base64 = await fetchProfileImageBase64(uid);
                    if (base64) {
                        newProfilePics[uid] = base64;
                    }
                }
            }

            setProfilePics(newProfilePics);
        };

        if (posts.length > 0) {
            fetchProfilePictures();
        }
    }, [posts]);

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

    const renderPost = ({ item: post }) => {
        const onScroll = (e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / CARD_SIZE);
            setCurrentIndexes((prev) => ({ ...prev, [post.id]: index }));
        };

        const activeIndex = currentIndexes[post.id] || 0;

        return (
            <View style={styles.card}>
                <View style={styles.header}>
                    {profilePics[post.userId] ? (
                        <Image
                            source={{ uri: profilePics[post.userId] }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={[styles.avatar, { backgroundColor: "#555" }]}>
                            <Icon name="person-outline" size={20} color="#AAA" />
                        </View>
                    )}
                    <View style={{ marginLeft: 10 }}>
                        <Text style={styles.username}>{post.username}</Text>
                        <Text style={styles.date}>{moment(post.postedAt).fromNow()}</Text>
                    </View>
                </View>

                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={onScroll}
                    scrollEventThrottle={16}
                    style={styles.carouselContainer}
                >
                    <View style={styles.carouselItem}>
                        {postImages[post.id] ? (
                            <Image
                                source={{ uri: postImages[post.id] }}
                                style={styles.carouselImage}
                            />
                        ) : (
                            <ActivityIndicator size="large" color="#FF6B6B" />
                        )}
                    </View>

                    <View style={styles.carouselItem}>
                        {clothingItemsByOutfitId[post.outfitId] ? (
                            <OutfitPreview
                                clothingItems={clothingItemsByOutfitId[post.outfitId]}
                                compact
                                size="large"
                            />
                        ) : (
                            <ActivityIndicator size="small" color="#FF6B6B" />
                        )}
                    </View>
                </ScrollView>

                {/* Indicatori de swipe */}
                <View style={styles.dotsContainer}>
                    {[0, 1].map((i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                { opacity: activeIndex === i ? 1 : 0.3 },
                            ]}
                        />
                    ))}
                </View>

                <Text style={styles.caption}>{post.caption}</Text>
                {post.hashtags?.length > 0 && (
                    <Text style={styles.hashtags}>
                        {post.hashtags.map((tag) => `#${tag}`).join(" ")}
                    </Text>
                )}

                <TouchableOpacity
                    style={styles.likeRow}
                    onPress={() => toggleLike(post.id)}
                >
                    <Icon
                        name={post.likedByCurrentUser ? "heart" : "heart-outline"}
                        size={24}
                        color={post.likedByCurrentUser ? "#FF6B6B" : "#aaa"}
                    />
                    <Text style={styles.likeCount}>{post.likeCount} likes</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#FF6B6B" />
            ) : (
                <FlatList
                    data={posts}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderPost}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#2C2C2C",
        marginBottom: 70
    },
    card: {
        backgroundColor: "#1E1E1E",
        margin: 10,
        padding: 10,
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#444",
        justifyContent: "center",
        alignItems: "center",
    },
    username: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    date: {
        color: "#A0A0A0",
        fontSize: 12,
    },
    carouselContainer: {
        width: CARD_SIZE,
        height: CARD_SIZE,
        alignSelf: "center",
    },
    carouselItem: {
        width: CARD_SIZE,
        height: CARD_SIZE,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#bebebe"
    },
    carouselImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    dotsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 6,
    },
    dot: {
        width: 5,
        height: 5,
        borderRadius: 4,
        backgroundColor: "#c5c5c5",
        marginHorizontal: 4,
    },
    caption: {
        color: "#FFFFFF",
        fontSize: 14,
        marginTop: 10,
    },
    hashtags: {
        color: "#FF6B6B",
        fontSize: 13,
        marginBottom: 8,
    },
    likeRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6,
    },
    likeCount: {
        color: "#FFFFFF",
        fontSize: 14,
        marginLeft: 8,
    },
});

export default PostFeedScreen;
