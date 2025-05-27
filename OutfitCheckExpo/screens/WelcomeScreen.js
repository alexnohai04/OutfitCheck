import React, { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Video } from "expo-av";
import globalStyles from "../styles/globalStyles";

const WelcomeScreen = () => {
    const navigation = useNavigation();
    const video = useRef(null);

    return (
        <View style={styles.container}>
            {/* Logo animation video */}
            <Video
                ref={video}
                source={require("../constants/AnimatedLogo.mp4")}
                style={styles.video}
                resizeMode="contain"
                shouldPlay
                isLooping={true}
            />

            {/*<Text style={globalStyles.subtitle}>Welcome to OutfitCheck</Text>*/}

            <TouchableOpacity
                style={styles.signInButton}
                onPress={() => navigation.navigate("Login")}
                activeOpacity={0.8}
            >
                <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>

            {/* Sign Up — outline */}
            <TouchableOpacity
                style={styles.signUpButton}
                onPress={() => navigation.navigate("SignUp")}
                activeOpacity={0.8}
            >
                <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
        </View>
    );
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const styles = StyleSheet.create({
    video: {
        width: SCREEN_WIDTH,   // 60% din lățimea ecranului
        aspectRatio: 1,              // păstrează raportul 1:1 (ajustează după animația ta)
        alignSelf: "center",         // centrează orizontal
        marginBottom: 24,            // spațiu între video și titlu
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#1c1c1c",
    },
    signInButton: {
        width: SCREEN_WIDTH * 0.8,     // 80% din lățime
        paddingVertical: 18,
        backgroundColor: "#FF6B6B",
        borderRadius: 36,
        alignItems: "center",
        marginBottom: 20,
        // shadow (iOS)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        // elevation (Android)
        elevation: 6,
    },
    signInText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "600",
    },
    signUpButton: {
        width: SCREEN_WIDTH * 0.8,
        paddingVertical: 18,
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: "#FF6B6B",
        borderRadius: 36,
        alignItems: "center",
    },
    signUpText: {
        color: "#FF6B6B",
        fontSize: 18,
        fontWeight: "600",
    },
});

export default WelcomeScreen;
