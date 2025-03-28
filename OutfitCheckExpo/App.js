import React, { useContext, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ActivityIndicator, View } from "react-native";
import { registerRootComponent } from "expo";

import HomeScreen from "./screens/HomeScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import AddClothingItemScreen from "./screens/AddClothingItemScreen";
import ClothingItemsScreen from "./screens/ClothingItemsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import { UserProvider, UserContext } from "./UserContext";
import OutfitBuilderScreen from "./screens/OutfitBuilderScreen";
import UserOutfitsScreen from "./screens/UserOutfitScreen";
import OutfitDetailsScreen from "./screens/OutfitDetailsScreen";
import CalendarScreen from "./screens/CalendarScreen";
import SelectOutfitScreen from "./screens/SelectOutfitScreen";
import Toast from 'react-native-toast-message';
import { toastConfig } from './reusable/ToastConfig';
import AddPostScreen from "./screens/AddPostScreen";
import UserProfileScreen from "./screens/UserProfileScreen";
import PostDetailsScreen from "./screens/PostDetailsScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
    const { userId, isLoading } = useContext(UserContext); // ✅ Use `isLoading` from context

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#2C2C2C" }}>
                <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName={userId ? "Home" : "Welcome"} screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="SignUp" component={SignUpScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="AddClothingItem" component={AddClothingItemScreen} />
                <Stack.Screen name="ClothingItems" component={ClothingItemsScreen} options={{ title: "My Clothes" }} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="OutfitBuilder" component={OutfitBuilderScreen} />
                <Stack.Screen name="UserOutfits" component={UserOutfitsScreen} />
                <Stack.Screen name="OutfitDetails" component={OutfitDetailsScreen} />
                <Stack.Screen name="CalendarScreen" component={CalendarScreen} />
                <Stack.Screen name="SelectOutfit" component={SelectOutfitScreen} />
                <Stack.Screen name="AddPost" component={AddPostScreen} />
                <Stack.Screen name="UserProfile" component={UserProfileScreen} />
                <Stack.Screen name="PostDetailsScreen" component={PostDetailsScreen} />


            </Stack.Navigator>
            <Toast config={toastConfig} position="top" />
        </NavigationContainer>
    );
};

const App = () => {
    return (
        <UserProvider>
            <AppNavigator />
        </UserProvider>
    );
};

export default App;
registerRootComponent(App);
