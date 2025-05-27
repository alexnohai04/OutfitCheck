// SignUpScreen.js
import React, { useState, useContext } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
    Dimensions,
    Image,
} from "react-native";
import axios from "axios";
import API_URLS from "../apiConfig";
import { UserContext } from "../UserContext";

// importă logo-ul PNG
import LogoHeader from "../constants/Logo_text.png";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const API_URL = API_URLS.REGISTER;

export default function SignUpScreen({ navigation }) {
    const { loginUser } = useContext(UserContext);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [usernameError, setUsernameError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [confirmPasswordError, setConfirmPasswordError] = useState(false);

    const ERROR_COLOR = "#e12d2d";
    const SUCCESS_COLOR = "#049f04";
    const DEFAULT_COLOR = "#444";

    const validateUsername = (text) => {
        setUsername(text);
        setUsernameError(text.length < 3);
    };
    const validateEmail = (text) => {
        setEmail(text);
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setEmailError(!re.test(text));
    };
    const validatePassword = (text) => {
        setPassword(text);
        setPasswordError(text.length < 6);
    };
    const validateConfirm = (text) => {
        setConfirmPassword(text);
        setConfirmPasswordError(text !== password);
    };

    const handleSignUp = async () => {
        if (
            usernameError ||
            emailError ||
            passwordError ||
            confirmPasswordError
        ) {
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
            await axios.post(
                API_URL,
                { username, email, password },
                { headers: { "Content-Type": "application/json" } }
            );
            Alert.alert("Success", "Registration successful!");
            navigation.navigate("Login");
        } catch (err) {
            Alert.alert(
                "Error",
                err.response?.data?.message || "An error occurred during registration!"
            );
        }
    };

    return (
        <View style={styles.container}>
            {/* header: text + logo */}
            <Image
                source={LogoHeader}
                style={styles.logo}
                resizeMode="contain"
            />

            <TextInput
                style={[
                    styles.input,
                    {
                        borderColor: username
                            ? usernameError
                                ? ERROR_COLOR
                                : SUCCESS_COLOR
                            : DEFAULT_COLOR,
                    },
                ]}
                placeholder="Username"
                placeholderTextColor="#AAA"
                value={username}
                onChangeText={validateUsername}
                autoCapitalize="none"
            />

            <TextInput
                style={[
                    styles.input,
                    {
                        borderColor: email
                            ? emailError
                                ? ERROR_COLOR
                                : SUCCESS_COLOR
                            : DEFAULT_COLOR,
                    },
                ]}
                placeholder="Email Address"
                placeholderTextColor="#AAA"
                value={email}
                onChangeText={validateEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                style={[
                    styles.input,
                    {
                        borderColor: password
                            ? passwordError
                                ? ERROR_COLOR
                                : SUCCESS_COLOR
                            : DEFAULT_COLOR,
                    },
                ]}
                placeholder="Password"
                placeholderTextColor="#AAA"
                value={password}
                onChangeText={validatePassword}
                secureTextEntry
            />

            <TextInput
                style={[
                    styles.input,
                    {
                        borderColor: confirmPassword
                            ? confirmPasswordError
                                ? ERROR_COLOR
                                : SUCCESS_COLOR
                            : DEFAULT_COLOR,
                    },
                ]}
                placeholder="Confirm Password"
                placeholderTextColor="#AAA"
                value={confirmPassword}
                onChangeText={validateConfirm}
                secureTextEntry
            />

            {(usernameError ||
                emailError ||
                passwordError ||
                confirmPasswordError) && (
                <View style={styles.errorContainer}>
                    {usernameError && (
                        <Text style={styles.errorText}>
                            • Username must be at least 3 characters.
                        </Text>
                    )}
                    {emailError && (
                        <Text style={styles.errorText}>
                            • Enter a valid email address.
                        </Text>
                    )}
                    {passwordError && (
                        <Text style={styles.errorText}>
                            • Password must be at least 6 characters.
                        </Text>
                    )}
                    {confirmPasswordError && (
                        <Text style={styles.errorText}>• Passwords do not match.</Text>
                    )}
                </View>
            )}

            <TouchableOpacity
                style={styles.button}
                onPress={handleSignUp}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>Sign Up</Text>
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
        marginBottom: 16,
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: "#3A3A3A",
        color: "#FFF",
    },
    errorContainer: {
        width: SCREEN_WIDTH * 0.8,
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    errorText: {
        color: "#e12d2d",
        fontSize: 14,
        marginBottom: 4,
    },
    button: {
        width: SCREEN_WIDTH * 0.8,
        paddingVertical: 16,
        backgroundColor: "#FF6B6B",
        borderRadius: 30,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        marginTop: 8,
    },
    buttonText: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "600",
    },
});
