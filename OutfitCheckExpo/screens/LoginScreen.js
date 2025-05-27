// LoginScreen.js
import React, { useContext, useState } from "react";
import {
    View,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
    Dimensions,
} from "react-native";
import axios from "axios";
import API_URLS from "../apiConfig";
import { UserContext } from "../UserContext";

// Importă logo-ul PNG
import LogoHeader from "../constants/Logo_text.png";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const API_URL = API_URLS.LOGIN;

export default function LoginScreen({ navigation }) {
    const { loginUser } = useContext(UserContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter your email and password!");
            return;
        }
        try {
            const response = await axios.post(
                API_URL,
                { email, password },
                { headers: { "Content-Type": "application/json" } }
            );
            const token = response?.data?.token;
            if (!token) throw new Error("No token received!");
            else console.log(token)
            await loginUser(token);
            navigation.reset({
                index: 0,
                routes: [{ name: "Home" }],
            });
        } catch (error) {
            let msg = "An error occurred. Please try again.";
            if (error.response) {
                msg = error.response.data?.message || "Incorrect email or password!";
            } else if (error.request) {
                msg = "No response from the server. Check your internet connection.";
            }
            Alert.alert("Error", msg);
        }
    };

    return (
        <View style={styles.container}>

            <Image
                source={LogoHeader}
                style={styles.logo}
                resizeMode="contain"
            />

            <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#A0A0A0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1E1E1E",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    logo: {
        width: SCREEN_WIDTH * 0.6,
        height: 80,
        marginBottom: 24,
    },
    input: {
        width: SCREEN_WIDTH * 0.8,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#444",
        borderRadius: 10,
        backgroundColor: "#3A3A3A",
        color: "#FFFFFF",
    },
    button: {
        width: SCREEN_WIDTH * 0.8,
        paddingVertical: 16,
        backgroundColor: "#FF6B6B",
        borderRadius: 30,
        alignItems: "center",
        marginTop: 20,
        // shadow for iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        // elevation for Android
        elevation: 6,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "600",
    },
});
