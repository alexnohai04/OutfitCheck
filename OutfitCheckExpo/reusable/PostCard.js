import React, { useContext, useState, useRef } from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions,
    Alert,
    Animated,
    TouchableWithoutFeedback,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import OutfitPreview from "../reusable/OutfitPreview";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../UserContext";
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { width } = Dimensions.get("window");
const CARD_SIZE = width - 20;

const PostCard = ({ post, profilePic, postImage, clothingItems, onDelete }) => {
    const navigation = useNavigation();
    const { userId } = useContext(UserContext);

    const [activeIndex, setActiveIndex] = useState(0);
    const [liked, setLiked] = useState(post.likedByCurrentUser);
    const [likeCount, setLikeCount] = useState(post.likeCount);

    const scaleAnim = useRef(new Animated.Value(0)).current;
    const lastTap = useRef(null);

    const animateHeart = () => {
        scaleAnim.setValue(0);
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
        }).start(() => {
            setTimeout(() => {
                scaleAnim.setValue(0);
            }, 400);
        });
    };

    const handleDoubleTap = () => {
        const now = Date.now();
        const DOUBLE_PRESS_DELAY = 300;
        if (lastTap.current && now - lastTap.current < DOUBLE_PRESS_DELAY) {
            if (!liked) {
                toggleLike();
            } else {
                animateHeart();
            }
        } else {
            lastTap.current = now;
        }
    };

    const toggleLike = async () => {
        try {
            setLiked((prev) => !prev);
            setLikeCount((prev) => liked ? prev - 1 : prev + 1);
            animateHeart();
            await apiClient.post(API_URLS.TOGGLE_LIKE(post.id, userId));
        } catch (error) {
            Alert.alert("Error", "Could not update like.");
            setLiked(post.likedByCurrentUser);
            setLikeCount(post.likeCount);
        }
    };


    const onScroll = (e) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / CARD_SIZE);
        setActiveIndex(index);
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate("UserProfile", { userId: post.userId })}>
                    {profilePic ? (
                        <Image source={{ uri: profilePic }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, { backgroundColor: "#555" }]}>
                            <Icon name="person-outline" size={20} color="#AAA" />
                        </View>
                    )}
                </TouchableOpacity>

                <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={styles.username}>{post.username}</Text>
                    <Text style={styles.date}>{dayjs(post.postedAt).fromNow()}</Text>
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
                <TouchableWithoutFeedback onPress={handleDoubleTap}>
                    <View style={styles.carouselItem}>
                        {postImage ? (
                            <>
                                <Image source={{ uri: postImage }} style={styles.carouselImage} />
                                <Animated.View
                                    style={[
                                        styles.animatedHeart,
                                        {
                                            transform: [{ scale: scaleAnim }],
                                            opacity: scaleAnim,
                                        },
                                    ]}
                                >
                                    <Icon name="heart" size={80} color="#FF6B6B" />
                                </Animated.View>
                            </>
                        ) : (
                            <ActivityIndicator size="large" color="#FF6B6B" />
                        )}
                    </View>
                </TouchableWithoutFeedback>

                <View style={styles.carouselItem}>
                    {clothingItems ? (
                        <OutfitPreview clothingItems={clothingItems} size="medium" />
                    ) : (
                        <ActivityIndicator size="small" color="#FF6B6B" />
                    )}
                </View>
            </ScrollView>

            <View style={styles.dotsContainer}>
                {[0, 1].map((i) => (
                    <View
                        key={i}
                        style={[
                            styles.iconCircle,
                            activeIndex === i ? styles.iconCircleActive : styles.iconCircleInactive,
                        ]}
                    >
                        <Icon
                            name={i === 0 ? "image-outline" : "shirt-outline"}
                            size={10}
                            color={activeIndex === i ? "#fff" : "#aaa"}
                        />
                    </View>
                ))}
            </View>

            <Text style={styles.caption}>{post.caption}</Text>
            {post.hashtags?.length > 0 && (
                <Text style={styles.hashtags}>
                    {post.hashtags.map((tag) => `#${tag}`).join(" ")}
                </Text>
            )}

            <TouchableOpacity style={styles.likeRow} onPress={toggleLike}>
                <Icon
                    name={liked ? "heart" : "heart-outline"}
                    size={24}
                    color={liked ? "#FF6B6B" : "#aaa"}
                />
                <Text style={styles.likeCount}>{likeCount} likes</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#1E1E1E",
        margin: 10,
        padding: 10,
        borderRadius: 15,
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
        backgroundColor: "#3A3A3A",
        position: "relative",
    },
    carouselImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    animatedHeart: {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
    },
    dotsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 8,
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
    iconCircle: {
        width: 18,
        height: 18,
        borderRadius: 13,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 4,
    },
    iconCircleActive: {
        backgroundColor: "#FF6B6B",
    },
    iconCircleInactive: {
        backgroundColor: "#3a3a3a",
    },
});

export default PostCard;
