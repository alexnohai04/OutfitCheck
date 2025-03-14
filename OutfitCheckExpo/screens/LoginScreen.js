import React, { useContext, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import axios from "axios";
import API_URLS from "../apiConfig";
import { UserContext } from "../UserContext";
import globalStyles from "../styles/globalStyles";

const API_URL = API_URLS.LOGIN;

const LoginScreen = ({ navigation }) => {
    const { loginUser } = useContext(UserContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter your email and password!");
            return;
        }

        try {
            const response = await axios.post(API_URL, { email, password }, { headers: { "Content-Type": "application/json" } });

            try {
                const token = response?.data?.token;
                if (!token) throw new Error("No token received!");

                console.log("Saved token:", token);
                await loginUser(token);
                navigation.reset({
                    index: 0,
                    routes: [{ name: "Home" }],
                });
            } catch (error) {
                console.warn("Error saving the token:", error);
                Alert.alert("Error", "Something went wrong while saving login data.");
            }

        } catch (error) {
            let errorMessage = "An error occurred. Please try again.";
            if (error.response) {
                errorMessage = error.response.data?.message || "Incorrect email or password!";
            } else if (error.request) {
                errorMessage = "No response from the server. Check your internet connection.";
            } else {
                errorMessage = error.message;
            }

            // 🔥 Cleaned up logs: No unnecessary console.error
            console.warn("Login failed:", errorMessage);
            Alert.alert("Error", errorMessage);
        }
    };

    return (
        <View style={globalStyles.container}>
            <Text style={globalStyles.title}>Login</Text>
            <TextInput
                style={globalStyles.input}
                placeholder="Email Address"
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={globalStyles.input}
                placeholder="Password"
                placeholderTextColor="#A0A0A0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity style={globalStyles.button} onPress={handleLogin}>
                <Text style={globalStyles.buttonText}>Login</Text>
            </TouchableOpacity>
        </View>
    );
};

export default LoginScreen;
