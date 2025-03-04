import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import {registerRootComponent} from "expo";
import HomeScreen from "./screens/HomeScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import AddClothingItemScreen from "./screens/AddClothingItemScreen";
import ClothingItemsScreen from "./screens/ClothingItemsScreen";
import {UserProvider} from "./UserContext";

const Stack = createStackNavigator();

const App = () => {
    return (
        <UserProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Welcome" component={WelcomeScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="SignUp" component={SignUpScreen} />
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="AddClothingItem" component={AddClothingItemScreen} />
                    <Stack.Screen name="ClothingItems" component={ClothingItemsScreen} options={{ title: "Hainele mele" }} />
                </Stack.Navigator>
            </NavigationContainer>
        </UserProvider>
    );
};
export default App;
registerRootComponent(App);
