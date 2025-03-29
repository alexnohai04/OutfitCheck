import React, {useCallback, useContext, useEffect, useState} from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    FlatList,
    Alert,
    StyleSheet,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Feather, Ionicons } from "@expo/vector-icons";
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";
import { UserContext } from "../UserContext";
import Toast from "react-native-toast-message";
import { fetchProfileImageBase64, processClothingItems, processPostImage } from "../utils/imageUtils";
import OutfitPreview from "../reusable/OutfitPreview";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";


const ProfileScreen = () => {
    const { userId, logoutUser } = useContext(UserContext);
    const [user, setUser] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [postImages, setPostImages] = useState({});
    const [tab, setTab] = useState("posts");
    const [outfits, setOutfits] = useState([]);
    const navigation = useNavigation();

    const fetchUserData = async () => {
        try {
            const response = await apiClient.get(`${API_URLS.GET_USER_PROFILE}/${userId}`);
            setUser(response.data);

            const image = await fetchProfileImageBase64(userId);
            setProfileImage(image);

            const postsRes = await apiClient.get(API_URLS.GET_POSTS_BY_USER(userId, userId));
            setPosts(postsRes.data);

            const outfitsRes = await apiClient.get(`${API_URLS.GET_OUTFITS_BY_USER}/${userId}`);
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

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            const resizedImage = await ImageManipulator.manipulateAsync(
                result.assets[0].uri,
                [{ resize: { width: 512, height: 512 } }],
                { compress: 0.8, format: ImageManipulator.SaveFormat.WEBP }
            );
            uploadProfilePicture(resizedImage.uri);
        }
    };

    const uploadProfilePicture = async (fileUri) => {
        try {
            let formData = new FormData();
            formData.append("file", {
                uri: fileUri,
                name: "profile.webp",
                type: "image/webp",
            });

            await apiClient.post(API_URLS.UPLOAD_PROFILE_PIC(userId), formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            fetchUserData();
        } catch (error) {
            console.error("Error uploading profile picture:", error);
            Alert.alert("Error", "Something went wrong.");
        }
    };

    const handleLogout = async () => {
        try {
            await logoutUser();
            Toast.show({
                type: "success",
                text1: "Logged out",
                position: "top",
            });
            setTimeout(() => {
                navigation.reset({
                    index: 0,
                    routes: [{ name: "Welcome" }],
                });
            }, 300);
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUserData();
        }, [userId])
    );

    useEffect(() => {
        const fetchImages = async () => {
            const updatedImages = {};
            for (const post of posts) {
                if (post.imageUrl && !postImages[post.id]) {
                    const img = await processPostImage(post.imageUrl);
                    if (img) updatedImages[post.id] = img;
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

    const renderPosts = () => (
        <FlatList
            data={posts}
            numColumns={3}
            keyExtractor={(item) => item.id.toString()}
            columnWrapperStyle={styles.flatListRow}
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

    const renderOutfits = () => {
        const dataWithAddButton = [{ isAddButton: true }, ...outfits];

        return (
            <FlatList
                data={dataWithAddButton}
                keyExtractor={(item, index) => item.id?.toString() || `add-${index}`}
                renderItem={({ item }) => {
                    if (item.isAddButton) {
                        return (
                            <TouchableOpacity
                                style={styles.gridItem}
                                onPress={() => navigation.navigate("OutfitBuilder")}
                            >
                                <View style={styles.outfitPreviewWrapper}>
                                    <View style={styles.outfitPreviewContainer}>
                                        <Ionicons name="add" size={40} color="#FFF" />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    }


                    return (
                        <TouchableOpacity
                            style={styles.gridItem}
                            onPress={() => navigation.navigate('OutfitDetails', { outfitId: item.id })}
                        >
                            <OutfitPreview clothingItems={item.clothingItems} compact />
                        </TouchableOpacity>
                    );
                }}
                numColumns={3}
                columnWrapperStyle={styles.row}
                contentContainerStyle={{ paddingBottom: 100 }}
            />
        );
    };


    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={pickImage} style={styles.profileImageContainer}>
                {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.profileImage} />
                ) : (
                    <Feather name="user" size={50} color="#FFFFFF" />
                )}
            </TouchableOpacity>

            <Text style={styles.username}>{user?.username || "User"}</Text>

            <View style={styles.countsContainer}>
                <Text style={styles.countText}>{user?.followersCount ?? 0} followers</Text>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.countText}>{user?.followingCount ?? 0} following</Text>
            </View>

            <View style={styles.buttonRow}>
                <TouchableOpacity onPress={() => navigation.navigate("EditProfile")} style={styles.actionButton}>
                    <Feather name="edit" size={18} color="#FFF" />
                    <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("ClothingItems")} style={styles.actionButton}>
                    <Ionicons name="shirt" size={18} color="#FFF" />
                    <Text style={styles.actionText}>My Clothes</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleLogout} style={styles.actionButton}>
                    <Feather name="log-out" size={18} color="#FF6B6B" />
                    <Text style={[styles.actionText, { color: "#FF6B6B" }]}>Logout</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.iconTabContainer}>
                <TouchableOpacity style={styles.iconTab} onPress={() => setTab("posts")}>
                    <Ionicons name="grid" size={24} color={tab === "posts" ? "#FF6B6B" : "#AAA"} />
                    {tab === "posts" && <View style={styles.underline} />}
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconTab} onPress={() => setTab("outfits")}>
                    <MaterialIcons name="style" size={24} color={tab === "outfits" ? "#FF6B6B" : "#AAA"} />
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
        justifyContent:"center"
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
    buttonRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        gap: 12,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#666",
    },
    actionText: {
        color: "#FFF",
        fontWeight: "600",
        fontSize: 14,
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
    gridItem: {
        width: "33.33%",
        padding: 8,
        alignItems: "center",
        justifyContent: "flex-start",
        minHeight: 290
    },
    row: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
    },
    flatListRow: {
        justifyContent: "flex-start",
    },
    addButton: {
        borderWidth: 2,
        borderColor: "#3A3A3A",
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 12,
       // height: 110,
       // width: 110,
       // margin: 4,
        //backgroundColor: "#2E2E2E",
        //padding: 30
    },
    outfitPreviewWrapper: {
        width: '100%',
        borderWidth: 2,
        borderColor: "#3A3A3A",
        borderRadius: 16,
        borderStyle: "dashed",
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        minHeight: 290, // aproximativ înălțimea medie a unui OutfitPreview
    },
    outfitPreviewContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },

});

export default ProfileScreen;
