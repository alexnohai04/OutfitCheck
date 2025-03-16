import React, { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";
import { UserContext } from "../UserContext";
import globalStyles from "../styles/globalStyles";

const ProfileScreen = () => {
    const [user, setUser] = useState(null);
    const navigation = useNavigation();
    const { userId, logoutUser } = useContext(UserContext);

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "OK",
                    onPress: async () => {
                        await logoutUser();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: "Welcome" }],
                        });
                    },
                },
            ]
        );
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await apiClient.get(`${API_URLS.GET_USER_PROFILE}/${userId}`);
                setUser(response.data);
            } catch (error) {
                console.error("Error loading user data:", error.response?.data || error.message);
            }
        };
        fetchUserData();
    }, []);

    if (!user) {
        return (
            <View style={globalStyles.container}>
                <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
        );
    }

    return (
        <View style={globalStyles.container}>
            <Text style={globalStyles.title}>{user.email}</Text>

            <TouchableOpacity style={globalStyles.button} onPress={() => navigation.navigate("ClothingItems")}>
                <Text style={globalStyles.buttonText}>View My Clothes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={globalStyles.button} onPress={() => navigation.navigate("OutfitBuilder")}>
                <Text style={globalStyles.buttonText}>Create an Outfit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={globalStyles.button} onPress={() => navigation.navigate("UserOutfits")}>
                <Text style={globalStyles.buttonText}>Show Outfits</Text>
            </TouchableOpacity>


            <TouchableOpacity style={globalStyles.button} onPress={() => alert("Feature in progress!")}>
                <Text style={globalStyles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={globalStyles.button} onPress={handleLogout}>
                <Text style={globalStyles.buttonText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

export default ProfileScreen;
