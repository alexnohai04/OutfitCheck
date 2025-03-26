import React, { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Feather, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";
import { UserContext } from "../UserContext";
import globalStyles from "../styles/globalStyles";
import Toast from 'react-native-toast-message';
import { fetchProfileImageBase64 } from "../utils/imageUtils";

const ProfileScreen = () => {
    const [user, setUser] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const { userId, logoutUser } = useContext(UserContext);

    const fetchUserData = async () => {
        if (!userId) return;

        try {
            const response = await apiClient.get(`${API_URLS.GET_USER_PROFILE}/${userId}`);
            setUser(response.data);

            const base64Image = await fetchProfileImageBase64(userId);
            setProfileImage(base64Image);

        } catch (error) {
            console.error("❌ Error loading user data:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [userId]);

    const handleLogout = async () => {
        try {
            await logoutUser();

            Toast.show({
                type: 'success',
                text1: 'Logged out',
                text2: 'You have been logged out successfully.',
                position: 'top',
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

    const uploadProfilePicture = async (fileUri) => {
        try {
            let formData = new FormData();
            formData.append("file", {
                uri: fileUri,
                name: "profile.webp",
                type: "image/webp",
            });

            const response = await apiClient.post(API_URLS.UPLOAD_PROFILE_PIC(userId), formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 200) {
                fetchUserData(); // 🔁 reîncarcă poza după upload
            } else {
                Alert.alert("Error", "Failed to upload image.");
            }
        } catch (error) {
            console.error("Error uploading profile picture:", error);
            Alert.alert("Error", "Something went wrong.");
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

    if (loading) {
        return (
            <View style={globalStyles.container}>
                <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
        );
    }

    return (
        <View style={globalStyles.profileContainer}>
            <TouchableOpacity onPress={pickImage} style={globalStyles.profileImageContainer}>
                {profileImage ? (
                    <Image
                        source={{ uri: profileImage }}
                        style={globalStyles.profileImage}
                        onError={() => {
                            setProfileImage(null);
                            console.log("❌ Failed to load profile image.");
                        }}
                    />
                ) : (
                    <Feather name="user" size={50} color="#FFFFFF" />
                )}
            </TouchableOpacity>

            <Text style={globalStyles.username}>{user.username || "User"}</Text>
            <Text style={globalStyles.email}>{user.email}</Text>

            <View style={globalStyles.buttonsContainer}>
                <TouchableOpacity style={globalStyles.iconButton} onPress={() => navigation.navigate("ClothingItems")}>
                    <FontAwesome5 name="tshirt" size={24} color="#FFFFFF" />
                    <Text style={globalStyles.iconText}>My Clothes</Text>
                </TouchableOpacity>

                <TouchableOpacity style={globalStyles.iconButton} onPress={() => navigation.navigate("OutfitBuilder")}>
                    <Feather name="plus-circle" size={24} color="#FFFFFF" />
                    <Text style={globalStyles.iconText}>Create Outfit</Text>
                </TouchableOpacity>

                <TouchableOpacity style={globalStyles.iconButton} onPress={() => navigation.navigate("UserOutfits")}>
                    <MaterialIcons name="style" size={24} color="#FFFFFF" />
                    <Text style={globalStyles.iconText}>My Outfits</Text>
                </TouchableOpacity>

                <TouchableOpacity style={globalStyles.iconButton} onPress={() => alert("Feature in progress!")}>
                    <Feather name="edit" size={24} color="#FFFFFF" />
                    <Text style={globalStyles.iconText}>Edit Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity style={globalStyles.iconButton} onPress={handleLogout}>
                    <Feather name="log-out" size={24} color="#FF6B6B" />
                    <Text style={[globalStyles.iconText, { color: "#FF6B6B" }]}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ProfileScreen;
