import React from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";

const Tab = createBottomTabNavigator();

// 📸 Funcție pentru deschiderea camerei
const openCamera = async (navigation) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
        Alert.alert("Permisiune necesară", "Trebuie să permiți accesul la cameră pentru a folosi această funcție.");
        return;
    }

    const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log("📸 Photo taken:", result.assets[0].uri);
        navigation.navigate("AddClothingItem", { imageUri: result.assets[0].uri });
    }
};

// 📷 **CameraScreen - Deschide automat camera când intri în tab**
const CameraScreen = () => {
    const navigation = useNavigation();

    useFocusEffect(
        React.useCallback(() => {
            openCamera(navigation);
        }, [navigation])
    );

    return <View style={styles.screen} />;
};

// 🗓️ Calendar Screen
const CalendarScreen = () => (
    <View style={styles.screen}>
        <Text style={styles.text}>Calendar Screen</Text>
    </View>
);

// 👤 Profile Screen
const ProfileScreen = () => (
    <View style={styles.screen}>
        <Text style={styles.text}>Profile Screen</Text>
    </View>
);

// **Tab Navigator**
const AppTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === "Calendar") {
                        iconName = "calendar";
                    } else if (route.name === "Camera") {
                        iconName = "camera";
                    } else if (route.name === "Profile") {
                        iconName = "person";
                    }
                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: "#FF6B6B",
                tabBarInactiveTintColor: "gray",
                tabBarStyle: styles.tabBar, // **Navbar-ul tău rămâne intact**
                headerShown: false, // **Ascunde header-ul alb**
            })}
        >
            <Tab.Screen name="Calendar" component={CalendarScreen} />
            <Tab.Screen name="Camera" component={CameraScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

// 🎨 **Stilurile tale păstrate exact așa cum le-ai definit**
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#2C2C2C",
    },
    screen: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#2C2C2C",
    },
    text: {
        fontSize: 24,
        color: "#FFFFFF",
    },
    tabBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 70,
        backgroundColor: "#1E1E1E",
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        borderTopWidth: 0,
        elevation: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        paddingBottom: 20,
    },
    iconContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    activeBackground: {
        position: "absolute",
        width: 65,
        height: 60,
        borderRadius: 25,
        backgroundColor: "#1E1E1E",
        top: -15, // **Urcă puțin peste navbar, exact cum ai vrut**
    },
});

export default AppTabs;
