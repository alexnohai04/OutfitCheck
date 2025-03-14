import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import axios from "axios";
import API_URLS from "../apiConfig";
import globalStyles from "../styles/globalStyles";

const SignUpScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSignUp = async () => {
        if (!email || !password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields!");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match!");
            return;
        }

        try {
            const response = await axios.post(API_URLS.REGISTER, { email, password }, { headers: { "Content-Type": "application/json" } });

            Alert.alert("Success", "Registration successful!");
            console.log("Server response:", response.data);

            navigation.navigate("Login");
        } catch (error) {
            console.error("Registration error:", error.response?.data || error.message);
            Alert.alert("Error", error.response?.data || "An error occurred during registration!");
        }
    };

    return (
        <View style={globalStyles.container}>
            <Text style={globalStyles.title}>Sign Up</Text>
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
            <TextInput
                style={globalStyles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#A0A0A0"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />
            <TouchableOpacity style={globalStyles.button} onPress={handleSignUp}>
                <Text style={globalStyles.buttonText}>Register</Text>
            </TouchableOpacity>
        </View>
    );
};

export default SignUpScreen;
