import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";

const { width } = Dimensions.get("window");
const tabWidth = width / 3;

// Funcție pentru deschiderea camerei
const openCamera = async () => {
    // Cere permisiunea utilizatorului pentru cameră
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
        alert("We need camera permissions to make this work!");
        return;
    }

    // Deschide camera
    const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.IMAGE, // deprecated, might not work
        quality: 1,
    });

    if (!result.canceled) {
        console.log("Photo taken: ", result.assets[0].uri);
    }
};


const CalendarScreen = () => (
    <View style={styles.screen}>
        <Text style={styles.text}>Calendar Screen</Text>
    </View>
);

const CameraScreen = () => (
    <View style={styles.screen}>
        <Text style={styles.text}>Camera Screen</Text>
    </View>
);

const ProfileScreen = () => (
    <View style={styles.screen}>
        <Text style={styles.text}>Profile Screen</Text>
    </View>
);

const Tab = createBottomTabNavigator();

const AnimatedIcon = ({ name, color, focused }) => {
    const scaleAnim = useRef(new Animated.Value(focused ? 1.2 : 1)).current;

    useEffect(() => {
        Animated.timing(scaleAnim, {
            toValue: focused ? 1.2 : 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [focused]);

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Icon name={name} size={30} color={color} />
        </Animated.View>
    );
};

const HomeScreen = () => {
    return (
        <View style={styles.container}>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ color, focused }) => {
                        let iconName;

                        if (route.name === "Calendar") {
                            iconName = "calendar";
                        } else if (route.name === "Camera") {
                            iconName = "camera";
                        } else if (route.name === "Profile") {
                            iconName = "person";
                        }

                        return (
                            <View style={styles.iconContainer}>
                                {focused && <View style={styles.activeBackground} />}
                                <AnimatedIcon name={iconName} color={color} focused={focused} />
                            </View>
                        );
                    },
                    tabBarActiveTintColor: "#FF6B6B",
                    tabBarInactiveTintColor: "gray",
                    tabBarStyle: styles.tabBar,
                    tabBarShowLabel: false,
                    headerShown: false,
                })}
            >
                <Tab.Screen name="Calendar" component={CalendarScreen} />
                <Tab.Screen name="Camera" component={CalendarScreen} options={{
                    tabBarButton: (props) => (
                        <TouchableOpacity {...props} onPress={openCamera} style={styles.iconContainer}>
                            <Icon name="camera" size={30} color="gray" />
                        </TouchableOpacity>
                    )
                }} />
                <Tab.Screen name="Profile" component={ProfileScreen} />
            </Tab.Navigator>
        </View>
    );
};

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
        height: 50,
        borderRadius: 25,
        backgroundColor: "#1E1E1E", // Culoarea navbarului
        top: -15, // Urcă puțin peste navbar
    },
});

export default HomeScreen;
