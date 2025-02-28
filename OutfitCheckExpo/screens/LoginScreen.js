import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import axios from "axios";
import { Platform } from "react-native"; // 🔹 Detectează platforma

const API_URL = "http://192.168.0.107:8080/users/login"; // ← Folosește IP-ul corect!

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        if (!email || !password) {
            if (Platform.OS === "web") {
                window.alert("Eroare: Te rog introdu email-ul și parola!");
            } else {
                Alert.alert("Eroare", "Te rog introdu email-ul și parola!");
            }
            return;
        }

        try {
            const response = await axios.post(API_URL, { email, password }, { headers: { "Content-Type": "application/json" } });

            if (Platform.OS === "web") {
                window.alert("Autentificare reușită!");
            } else {
                Alert.alert("Succes", "Autentificare reușită!");
            }

            console.log("Token primit:", response.data);

            // ✅ Navighează la Home după login (dacă ai o pagină principală)
            navigation.navigate("HomeScreen");

        } catch (error) {
            console.error("Eroare la autentificare:", error.response?.data || error.message);

            if (Platform.OS === "web") {
                window.alert("Eroare: Email sau parolă incorectă!");
            } else {
                Alert.alert("Eroare", error.response?.data || "Email sau parolă incorectă!");
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Autentificare</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Parolă"
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
        backgroundColor: "#f5f5f5"
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20
    },
    input: {
        width: "80%",
        padding: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        backgroundColor: "#fff"
    },
    button: {
        backgroundColor: "#007BFF",
        padding: 10,
        borderRadius: 5
    },
    buttonText: {
        color: "#fff",
        fontSize: 16
    }
});

export default LoginScreen;
