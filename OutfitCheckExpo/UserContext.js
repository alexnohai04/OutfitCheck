import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as jwtDecode from "jwt-decode";
// ✅ Import corect

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userId, setUserId] = useState(null);

    // 📌 Preia `userId` din JWT la pornirea aplicației
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const token = await AsyncStorage.getItem("jwt_token");

                if (!token) {
                    console.log("⚠️ Niciun JWT găsit la pornire.");
                    return;
                }

                console.log("📥 JWT extras:", token);
                const decodedToken = jwtDecode.default(token); // ✅ Decodează token-ul
                console.log("🔍 Token decodificat:", decodedToken);

                if (decodedToken.userId) {
                    setUserId(decodedToken.userId); // ✅ Setează `userId`
                } else {
                    console.error("⚠️ JWT nu conține `userId`!");
                }
            } catch (error) {
                console.error("Eroare la decodarea JWT-ului:", error);
            }
        };

        fetchUserId();
    }, []);

    // 📌 Funcție pentru login (salvează JWT și setează userId)
    const loginUser = async (token) => {
        try {
            await AsyncStorage.setItem("jwt_token", token); // ✅ Salvează JWT
            console.log("✅ Token salvat:", token);

            const decodedToken = jwtDecode(token); // ✅ Decodează token-ul
            console.log("🔍 Token decodificat:", decodedToken);

            if (decodedToken.userId) {
                setUserId(decodedToken.userId); // ✅ Setează `userId`
            } else {
                console.error("⚠️ JWT nu conține `userId`!");
            }
        } catch (error) {
            console.error("Eroare la setarea userului:", error);
        }
    };

    // 📌 Funcție pentru logout (șterge JWT și `userId`)
    const logoutUser = async () => {
        await AsyncStorage.removeItem("jwt_token");
        setUserId(null);
        console.log("🚪 Utilizator deconectat.");
    };

    return (
        <UserContext.Provider value={{ userId, loginUser, logoutUser }}>
            {children}
        </UserContext.Provider>
    );
};
