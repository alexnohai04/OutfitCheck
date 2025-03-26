import React, { useContext } from "react";
import { View, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons";
import ProfileScreen from "../screens/ProfileScreen";
import CameraScreen from "./CameraScreen";
import CalendarScreen from "../screens/CalendarScreen";
import globalStyles from "../styles/globalStyles";
import PostFeedScreen from "../screens/PostFeedScreen";


const Tab = createBottomTabNavigator();

const AppTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === "Feed") {
                        iconName = "home";
                    } else if (route.name === "Calendar") {
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
                tabBarStyle: globalStyles.tabBar,
                headerShown: false,
            })}
        >
            <Tab.Screen name="Calendar" component={CalendarScreen} />
            <Tab.Screen name="Feed" component={PostFeedScreen} />
            <Tab.Screen name="Camera" component={CameraScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen}/>
        </Tab.Navigator>
    );
};
export default AppTabs;
