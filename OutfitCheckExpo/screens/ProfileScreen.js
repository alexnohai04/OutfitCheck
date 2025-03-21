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
import base64 from "react-native-base64";

const arrayBufferToBase64 = (buffer) => {
    let binary = "";
    let bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return base64.encode(binary);
};

const ProfileScreen = () => {
    const [user, setUser] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const { userId, logoutUser } = useContext(UserContext);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // 🔹 Obținem datele utilizatorului
                const response = await apiClient.get(`${API_URLS.GET_USER_PROFILE}/${userId}`);
                setUser(response.data);

                // 🔹 Încercăm să obținem imaginea de profil
                try {
                    const imageResponse = await apiClient.get(API_URLS.GET_PROFILE_PIC(userId), {
                        responseType: "arraybuffer",
                    });

                    // 🔹 Convertim `arraybuffer` în `base64`
                    const base64String = `data:image/webp;base64,${arrayBufferToBase64(imageResponse.data)}`;
                    setProfileImage(base64String);
                    console.log("Profile image loaded.");
                } catch (imageError) {
                    if (imageError.response && imageError.response.status === 404) {
                        console.log("No profile image found, using default icon.");
                        setProfileImage(null); // 🔹 Setăm `null` pentru iconița default
                    } else {
                        console.error("Error loading profile image:", imageError);
                    }
                }
            } catch (error) {
                console.error("Error loading user data:", error.response?.data || error.message);
            } finally {
                setLoading(false); // 🔹 Setăm `loading` la `false` după finalizarea încărcării
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = async () => {
        try {
            await logoutUser();
            navigation.reset({
                index: 0,
                routes: [{ name: "Welcome" }],
            });
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
                // 🔹 După upload, reîncarcăm imaginea
                const newImageResponse = await apiClient.get(API_URLS.GET_PROFILE_PIC(userId), {
                    responseType: "arraybuffer",
                });

                const newBase64String = `data:image/webp;base64,${arrayBufferToBase64(newImageResponse.data)}`;
                setProfileImage(newBase64String);
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
            quality: 1, // Păstrăm calitate maximă înainte de comprimare
        });

        if (!result.canceled) {
            // 🔹 Facem resize la 512x512 pentru a reduce dimensiunea fișierului
            const resizedImage = await ImageManipulator.manipulateAsync(
                result.assets[0].uri,
                [{ resize: { width: 512, height: 512 } }], // 📌 Setăm dimensiunea optimă pentru imaginea de profil
                { compress: 0.8, format: ImageManipulator.SaveFormat.WEBP } // 📌 Reducem calitatea la 70%
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
            {/* Header profil */}
            <TouchableOpacity onPress={pickImage} style={globalStyles.profileImageContainer}>
                {profileImage ? (
                    <Image source={{ uri: profileImage }} style={globalStyles.profileImage} />
                ) : (
                    <Feather name="user" size={50} color="#FFFFFF" /> // 🔹 Păstrăm iconița default
                )}
            </TouchableOpacity>

            <Text style={globalStyles.username}>{user.username || "User"}</Text>
            <Text style={globalStyles.email}>{user.email}</Text>

            {/* Butoane acțiuni */}
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
