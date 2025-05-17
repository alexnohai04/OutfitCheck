import React, { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import ProfileScreen from "../screens/ProfileScreen";
import CalendarScreen from "../screens/CalendarScreen";
import PostFeedScreen from "../screens/PostFeedScreen";
import WardrobeScreen from "./WardrobeScreen";
import CameraScreenModal from "../reusable/CameraModal"; // renamed to emphasize modal behavior
import globalStyles from "../styles/globalStyles";
import AddCareInstructionsScreen from "./AddCareInstructionsScreen";
import AddClothingItemScreen from "./AddClothingItemScreen";
import TodaysFitScreen from "./TodaysFitScreen";

const Tab = createBottomTabNavigator();

const AppTabs = () => {
    const [showCameraModal, setShowCameraModal] = useState(false);

    return (
        <>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ color, size }) => {
                        if (route.name === "Wardrobe") return <MaterialCommunityIcons name="wardrobe" size={size} color={color} />;
                        if (route.name === "Feed") return <MaterialCommunityIcons name="home" size={size + 4} color={color} />;
                        if (route.name === "TodaysFit") return <Ionicons name="sparkles" size={size} color={color} />;
                        if (route.name === "Profile") return <Ionicons name="person" size={size} color={color} />;
                        if (route.name === "Camera") return <Ionicons name="camera" size={size} color={color} />;
                    },
                    tabBarActiveTintColor: "#FF6B6B",
                    tabBarInactiveTintColor: "gray",
                    tabBarStyle: globalStyles.tabBar,
                    headerShown: false,
                })}
            >
                <Tab.Screen name="Feed" component={PostFeedScreen} />
                <Tab.Screen name="TodaysFit" component={TodaysFitScreen} />
                <Tab.Screen
                    name="Camera"
                    options={{
                        tabBarButton: (props) => (
                            <TouchableOpacity
                                {...props}
                                onPress={() => setShowCameraModal(true)}
                                style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
                            >
                                <Ionicons
                                    name="camera"
                                    size={24}
                                    color={props.accessibilityState?.selected ? "#FF6B6B" : "gray"}
                                />
                                <Text style={{ fontSize: 12, color: props.accessibilityState?.selected ? "#FF6B6B" : "gray" }}>
                                    Camera
                                </Text>
                            </TouchableOpacity>
                        ),
                    }}
                >
                    {() => null}
                </Tab.Screen>

                <Tab.Screen name="Wardrobe" component={WardrobeScreen} />
                {/*<Tab.Screen name="Test" component={AddCareInstructionsScreen} />*/}
                <Tab.Screen name="Profile" component={ProfileScreen} />
            </Tab.Navigator>

            <CameraScreenModal
                visible={showCameraModal}
                onClose={() => setShowCameraModal(false)}
            />

            </>
    );
};

export default AppTabs;
