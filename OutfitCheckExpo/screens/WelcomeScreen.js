import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import globalStyles from "../styles/globalStyles";

const WelcomeScreen = () => {
    const navigation = useNavigation();

    return (
        <View style={globalStyles.container}>
            <Text style={globalStyles.title}>Welcome to OutfitCheck</Text>
            <TouchableOpacity style={globalStyles.button} onPress={() => navigation.navigate("Login")}>
                <Text style={globalStyles.buttonText}>Log In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={globalStyles.button} onPress={() => navigation.navigate("SignUp")}>
                <Text style={globalStyles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
        </View>
    );
};

export default WelcomeScreen;
