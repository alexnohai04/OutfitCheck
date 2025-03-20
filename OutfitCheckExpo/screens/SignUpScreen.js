import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import axios from "axios";
import API_URLS from "../apiConfig";
import globalStyles from "../styles/globalStyles";

const SignUpScreen = ({ navigation }) => {
    // Culori pentru validare
    const ERROR_COLOR = "#e12d2d";  // Dark Red
    const SUCCESS_COLOR = "#049f04"; // Dark Green
    const DEFAULT_COLOR = "#444";   // Neutru (pentru input necompletat)

    // State pentru câmpuri
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // State pentru erori
    const [usernameError, setUsernameError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [confirmPasswordError, setConfirmPasswordError] = useState(false);

    // Funcție de validare username (minim 3 caractere)
    const validateUsername = (text) => {
        setUsername(text);
        setUsernameError(text.length < 3);
    };

    // Funcție de validare email
    const validateEmail = (text) => {
        setEmail(text);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setEmailError(!emailRegex.test(text));
    };

    // Funcție de validare parolă (minim 6 caractere)
    const validatePassword = (text) => {
        setPassword(text);
        setPasswordError(text.length < 6);
    };

    // Funcție de validare confirmare parolă
    const validateConfirmPassword = (text) => {
        setConfirmPassword(text);
        setConfirmPasswordError(text !== password);
    };

    // Funcție pentru submit
    const handleSignUp = async () => {
        if (usernameError || emailError || passwordError || confirmPasswordError) {
            Alert.alert("Error", "Please correct the errors before submitting!");
            return;
        }

        if (!username || !email || !password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields!");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match!");
            return;
        }

        try {
            const response = await axios.post(API_URLS.REGISTER,
                { username, email, password },
                { headers: { "Content-Type": "application/json" } }
            );

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
                style={[
                    globalStyles.input,
                    { borderColor: usernameError ? ERROR_COLOR : username ? SUCCESS_COLOR : DEFAULT_COLOR },
                ]}
                placeholder="Username"
                placeholderTextColor="#A0A0A0"
                value={username}
                onChangeText={validateUsername}
                autoCapitalize="none"
            />

            <TextInput
                style={[
                    globalStyles.input,
                    { borderColor: emailError ? ERROR_COLOR : email ? SUCCESS_COLOR : DEFAULT_COLOR },
                ]}
                placeholder="Email Address"
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={validateEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                style={[
                    globalStyles.input,
                    { borderColor: passwordError ? ERROR_COLOR : password ? SUCCESS_COLOR : DEFAULT_COLOR },
                ]}
                placeholder="Password"
                placeholderTextColor="#A0A0A0"
                value={password}
                onChangeText={validatePassword}
                secureTextEntry
            />

            <TextInput
                style={[
                    globalStyles.input,
                    { borderColor: confirmPasswordError ? ERROR_COLOR : confirmPassword ? SUCCESS_COLOR : DEFAULT_COLOR },
                ]}
                placeholder="Confirm Password"
                placeholderTextColor="#A0A0A0"
                value={confirmPassword}
                onChangeText={validateConfirmPassword}
                secureTextEntry
            />

            {/* Lista de erori sub ultimul input */}
            {(usernameError || emailError || passwordError || confirmPasswordError) && (
                <View style={{ marginTop: 10 }}>
                    {usernameError && <Text style={{ color: ERROR_COLOR }}>• Username must be at least 3 characters.</Text>}
                    {emailError && <Text style={{ color: ERROR_COLOR }}>• Please enter a valid email address (e.g., example@mail.com).</Text>}
                    {passwordError && <Text style={{ color: ERROR_COLOR }}>• Password must be at least 6 characters long</Text>}
                    {confirmPasswordError && <Text style={{ color: ERROR_COLOR }}>• Passwords do not match</Text>}
                </View>
            )}

            <TouchableOpacity style={globalStyles.button} onPress={handleSignUp}>
                <Text style={globalStyles.buttonText}>Register</Text>
            </TouchableOpacity>
        </View>
    );
};

export default SignUpScreen;
