import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Platform } from "react-native";
import axios from "axios";

const API_URL = "http://192.168.0.107:8080/users/register"; // Înlocuiește cu URL-ul corect

const SignUpScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSignUp = async () => {
        if (!email || !password || !confirmPassword) {
            Platform.OS === "web" ? window.alert("Te rog completează toate câmpurile!") : Alert.alert("Eroare", "Te rog completează toate câmpurile!");
            return;
        }

        if (password !== confirmPassword) {
            Platform.OS === "web" ? window.alert("Parolele nu coincid!") : Alert.alert("Eroare", "Parolele nu coincid!");
            return;
        }

        try {
            const response = await axios.post(API_URL, { email, password }, { headers: { "Content-Type": "application/json" } });
            Platform.OS === "web" ? window.alert("Înregistrare reușită!") : Alert.alert("Succes", "Înregistrare reușită!");

            console.log("Răspuns server:", response.data);
            navigation.navigate("Login");
        } catch (error) {
            console.error("Eroare la înregistrare:", error.response?.data || error.message);
            Platform.OS === "web" ? window.alert("Eroare la înregistrare!") : Alert.alert("Eroare", error.response?.data || "Eroare la înregistrare!");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign Up</Text>
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
            <TextInput
                style={styles.input}
                placeholder="Confirmă parola"
                placeholderTextColor="#A0A0A0"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                <Text style={styles.buttonText}>Sign Up</Text>
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

export default SignUpScreen;
