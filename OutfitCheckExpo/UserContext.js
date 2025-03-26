import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { setLogoutHandler } from './utils/authService'; // ajustează calea după structură
import Toast from "react-native-toast-message";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // ✅ Setăm handler global pentru logout
    useEffect(() => {
        setLogoutHandler(logoutUser);
    }, []);

    // ✅ Verificăm dacă JWT-ul este valid la pornire
    useEffect(() => {
        const checkTokenValidity = async () => {
            try {
                const token = await AsyncStorage.getItem("jwt_token");

                if (!token) {
                    console.log("⚠️ No JWT found at startup.");
                    setIsLoading(false);
                    return;
                }

                const decodedToken = jwtDecode(token);
                const currentTime = Math.floor(Date.now() / 1000);

                if (decodedToken.exp && decodedToken.exp < currentTime) {
                    console.log("⚠️ Token expired. Logging out user...");
                    await logoutUser(true); // send 'true' to indicate forced logout
                    setIsLoading(false);
                    return;
                }

                if (decodedToken.id) {
                    setUserId(decodedToken.id);
                } else {
                    console.error("⚠️ JWT does not contain `id`!");
                }
            } catch (error) {
                console.error("Error decoding JWT:", error);
            }
            setIsLoading(false);
        };

        checkTokenValidity();
    }, []);

    // 📌 Login user
    const loginUser = async (token) => {
        try {
            await AsyncStorage.setItem("jwt_token", token);
            const decodedToken = jwtDecode(token);

            if (decodedToken.id) {
                setUserId(decodedToken.id);
            } else {
                console.error("⚠️ JWT does not contain `userId`!");
            }
        } catch (error) {
            console.error("Error setting user:", error);
        }
    };

    // 📌 Logout user
    const logoutUser = async (showToast = false) => {
        await AsyncStorage.removeItem("jwt_token");
        setUserId(null);
        console.log("🚪 User logged out.");

        if (showToast) {
            Toast.show({
                type: "error",
                text1: "Session expired",
                text2: "Please log in again.",
                position: "top",
            });
        }
    };

    return (
        <UserContext.Provider value={{ userId, loginUser, logoutUser, isLoading }}>
            {children}
        </UserContext.Provider>
    );
};
