import React, { useEffect, useState } from "react";
import { View, Text, Image, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Feather, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import apiClient from "../apiClient";
import { fetchProfileImageBase64 } from "../utils/imageUtils";
import styles from "../styles/userProfileStyles";

const UserProfileScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { userId: otherUserId } = route.params;
    const [user, setUser] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);

    const fetchUserData = async () => {
        try {
            const response = await apiClient.get(`/users/${otherUserId}`);
            setUser(response.data);

            const image = await fetchProfileImageBase64(otherUserId);
            setProfileImage(image);

            const followRes = await apiClient.get(`/users/${otherUserId}/is-following`);
            setIsFollowing(followRes.data.following);
        } catch (error) {
            console.error("❌ Error fetching user:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = async () => {
        try {
            if (isFollowing) {
                await apiClient.post(`/users/${otherUserId}/unfollow`);
            } else {
                await apiClient.post(`/users/${otherUserId}/follow`);
            }
            setIsFollowing(!isFollowing);
        } catch (error) {
            console.error("❌ Error follow toggle:", error);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [otherUserId]);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
        );
    }

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
            <Text style={styles.email}>{user?.email}</Text>

            <TouchableOpacity style={styles.followButton} onPress={handleFollowToggle}>
                <Text style={styles.followButtonText}>
                    {isFollowing ? "Unfollow" : "Follow"}
                </Text>
            </TouchableOpacity>

            <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("OtherUserClothes", { userId: otherUserId })}>
                    <FontAwesome5 name="tshirt" size={24} color="#FFFFFF" />
                    <Text style={styles.iconText}>Clothes</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("OtherUserOutfits", { userId: otherUserId })}>
                    <MaterialIcons name="style" size={24} color="#FFFFFF" />
                    <Text style={styles.iconText}>Outfits</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default UserProfileScreen;
