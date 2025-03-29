import React, { useEffect, useState, useContext } from "react";
import {
    View,
    Text,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    FlatList,
    StyleSheet,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import apiClient from "../apiClient";
import { fetchProfileImageBase64, processPostImage, processClothingItems } from "../utils/imageUtils";
import API_URLS from "../apiConfig";
import { UserContext } from "../UserContext";
import { Ionicons } from "@expo/vector-icons";
import OutfitPreview from "../reusable/OutfitPreview";

const UserProfileScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { userId: otherUserId } = route.params || {};
    const { userId: currentUserId } = useContext(UserContext);

    const [user, setUser] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [posts, setPosts] = useState([]);
    const [postImages, setPostImages] = useState({});
    const [tab, setTab] = useState("posts");
    const [outfits, setOutfits] = useState([]);

    const fetchUserData = async () => {
        try {
            const response = await apiClient.get(`${API_URLS.GET_USER_PROFILE}/${otherUserId}`);
            setUser(response.data);

            const image = await fetchProfileImageBase64(otherUserId);
            setProfileImage(image);

            const followRes = await apiClient.get(`${API_URLS.IS_FOLLOWING(otherUserId)}`, {
                params: { currentUserId },
            });
            setIsFollowing(followRes.data.following);

            const postsRes = await apiClient.get(API_URLS.GET_POSTS_BY_USER(otherUserId, currentUserId));
            setPosts(postsRes.data);

            const outfitsRes = await apiClient.get(`${API_URLS.GET_OUTFITS_BY_USER}/${otherUserId}`);
            const processedOutfits = await Promise.all(
                outfitsRes.data.map(async (outfit) => {
                    const processedItems = await processClothingItems(outfit.clothingItems);
                    return { ...outfit, clothingItems: processedItems };
                })
            );
            setOutfits(processedOutfits);
        } catch (error) {
            console.error("❌ Error fetching user:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = async () => {
        const newIsFollowing = !isFollowing;
        const updatedFollowersCount = user.followersCount + (newIsFollowing ? 1 : -1);

        setIsFollowing(newIsFollowing);
        setUser((prev) => ({
            ...prev,
            followersCount: updatedFollowersCount,
        }));

        try {
            const endpoint = newIsFollowing
                ? `${API_URLS.FOLLOW_USER(otherUserId)}?currentUserId=${currentUserId}`
                : `${API_URLS.UNFOLLOW_USER(otherUserId)}?currentUserId=${currentUserId}`;

            await apiClient.post(endpoint);
        } catch (error) {
            console.error("❌ Error follow toggle:", error.response?.data || error.message);
            setIsFollowing(!newIsFollowing);
            setUser((prev) => ({
                ...prev,
                followersCount: prev.followersCount + (newIsFollowing ? -1 : 1),
            }));
        }
    };

    useEffect(() => {
        if (otherUserId) fetchUserData();
    }, [otherUserId]);

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

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
        );
    }

    if (!otherUserId || !user) {
        return (
            <View style={styles.container}>
                <Text style={{ color: "white" }}>User not found.</Text>
            </View>
        );
    }

    const renderPosts = () => (
        <FlatList
            data={posts}
            numColumns={3}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <TouchableOpacity
                    onPress={() =>
                        navigation.navigate("PostDetailsScreen", {
                            post: item,
                            postImage: postImages[item.id],
                            profilePic: profileImage,
                        })
                    }
                >
                    <Image source={{ uri: postImages[item.id] }} style={styles.postImage} />
                </TouchableOpacity>
            )}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
        />
    );

    const renderOutfits = () => (
        <FlatList
            data={outfits}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <View style={styles.gridItem}>
                    <OutfitPreview clothingItems={item.clothingItems} compact />
                </View>
            )}
            numColumns={3}
            columnWrapperStyle={styles.row}
            contentContainerStyle={{ paddingBottom: 100 }}
        />
    );

    return (
        <View style={styles.container}>
            <View style={styles.profileImageContainer}>
                {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.profileImage} />
                ) : (
                    <Feather name="user" size={50} color="#FFFFFF" />
                )}
            </View>

            <Text style={styles.username}>{user?.username || "User"}</Text>

            <View style={styles.countsContainer}>
                <Text style={styles.countText}>
                    {user?.followersCount ?? 0} followers
                </Text>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.countText}>
                    {user?.followingCount ?? 0} following
                </Text>
            </View>

            {currentUserId !== otherUserId && (
                <TouchableOpacity style={styles.followButton} onPress={handleFollowToggle}>
                    <Text style={styles.followButtonText}>
                        {isFollowing ? "Unfollow" : "Follow"}
                    </Text>
                </TouchableOpacity>
            )}

            <View style={styles.iconTabContainer}>
                <TouchableOpacity
                    style={styles.iconTab}
                    onPress={() => setTab("posts")}
                >
                    <Ionicons
                        name="grid"
                        size={24}
                        color={tab === "posts" ? "#FF6B6B" : "#AAA"}
                    />
                    {tab === "posts" && <View style={styles.underline} />}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.iconTab}
                    onPress={() => setTab("outfits")}
                >
                    <Ionicons
                        name="shirt"
                        size={24}
                        color={tab === "outfits" ? "#FF6B6B" : "#AAA"}
                    />
                    {tab === "outfits" && <View style={styles.underline} />}
                </TouchableOpacity>
            </View>

            {tab === "posts" ? renderPosts() : renderOutfits()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#1E1E1E",
        paddingTop: 40,
        paddingHorizontal: 20,
    },
    profileImageContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#333",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        margin: 16,
    },
    profileImage: {
        width: "100%",
        height: "100%",
        borderRadius: 60,
    },
    username: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    countsContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        gap: 8,
    },
    countText: {
        color: "#AAAAAA",
        fontSize: 14,
    },
    separator: {
        color: "#AAAAAA",
        fontSize: 14,
    },
    followButton: {
        backgroundColor: "#FF6B6B",
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginBottom: 16,
    },
    followButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "600",
    },
    gridContainer: {
        paddingBottom: 100,

    },
    postImage: {
        width: 110,
        height: 110,
        margin: 2,
        borderRadius: 8,
        backgroundColor: "#333",
    },
    iconTabContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
        gap: 40,
    },
    iconTab: {
        alignItems: "center",
    },
    underline: {
        marginTop: 4,
        height: 3,
        width: 24,
        backgroundColor: "#FF6B6B",
        borderRadius: 2,
    },
    gridItem: {
        width: '33.33%',
        padding: 8,
        alignItems: 'center',
        justifyContent: "flex-start",
        minHeight: 290
    },
    row: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
});

export default UserProfileScreen;
