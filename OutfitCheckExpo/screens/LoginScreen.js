import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Platform } from "react-native";
import axios from "axios";

import API_URLS from "../apiConfig"; // Import API_URLS

const API_URL = API_URLS.LOGIN;

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        if (!email || !password) {
            Platform.OS === "web" ? window.alert("Eroare: Te rog introdu email-ul și parola!") : Alert.alert("Eroare", "Te rog introdu email-ul și parola!");
            return;
        }

        try {
            const response = await axios.post(API_URL, { email, password }, { headers: { "Content-Type": "application/json" } });
            Platform.OS === "web" ? window.alert("Autentificare reușită!") : Alert.alert("Succes", "Autentificare reușită!");
            console.log("Token primit:", response.data);
            navigation.navigate("Home");
        } catch (error) {
            console.error("Eroare la autentificare:", error.response?.data || error.message);
            Platform.OS === "web" ? window.alert("Eroare: Email sau parolă incorectă!") : Alert.alert("Eroare", error.response?.data || "Email sau parolă incorectă!");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Autentificare</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Parolă"
                placeholderTextColor="#A0A0A0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#2C2C2C"
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 20
    },
    input: {
        width: "80%",
        padding: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#444",
        borderRadius: 8,
        backgroundColor: "#3A3A3A",
        color: "#FFFFFF"
    },
    button: {
        backgroundColor: "#FF6B6B",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginVertical: 10,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
    }
});

export default LoginScreen;
