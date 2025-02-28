import {registerRootComponent} from "expo";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./app/(tabs)";

const Stack = createStackNavigator();

const App = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;

registerRootComponent(App);