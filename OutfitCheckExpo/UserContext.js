import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // ✅ Prevents UI flicker on startup

    useEffect(() => {
        const checkTokenValidity = async () => {
            try {
                const token = await AsyncStorage.getItem("jwt_token");

                if (!token) {
                    console.log("⚠️ No JWT found at startup.");
                    setIsLoading(false);
                    return;
                }

                console.log("📥 Extracted JWT:", token);
                const decodedToken = jwtDecode(token);
                console.log("🔍 Decoded Token:", decodedToken);

                // ✅ CHECK IF TOKEN IS EXPIRED
                const currentTime = Math.floor(Date.now() / 1000);
                if (decodedToken.exp && decodedToken.exp < currentTime) {
                    console.log("⚠️ Token expired. Logging out user...");
                    await logoutUser();
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
            setIsLoading(false); // ✅ Ensures UI only renders when auth check is complete
        };

        checkTokenValidity();
    }, []);

    // 📌 FUNCTION TO LOGIN & SAVE TOKEN
    const loginUser = async (token) => {
        try {
            await AsyncStorage.setItem("jwt_token", token);
            console.log("✅ Token saved:", token);

            const decodedToken = jwtDecode(token);
            console.log("🔍 Decoded Token:", decodedToken);

            if (decodedToken.id) {
                setUserId(decodedToken.id);
            } else {
                console.error("⚠️ JWT does not contain `userId`!");
            }
        } catch (error) {
            console.error("Error setting user:", error);
        }
    };

    // 📌 FUNCTION TO LOGOUT USER & REMOVE TOKEN
    const logoutUser = async () => {
        await AsyncStorage.removeItem("jwt_token");
        setUserId(null);
        console.log("🚪 User logged out.");
    };

    return (
        <UserContext.Provider value={{ userId, loginUser, logoutUser, isLoading }}>
            {children}
        </UserContext.Provider>
    );
};
