import React from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";

const handleScanArticle = async (navigation) => {
    const options = [
        { text: "Take a Photo", action: "camera" },
        { text: "Choose from Gallery", action: "gallery" },
        { text: "Cancel", action: "cancel" }
    ];

    Alert.alert("Select Image Source", "Choose an option:", [
        {
            text: options[0].text,
            onPress: async () => {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== "granted") {
                    Alert.alert("Permission Required", "You must grant camera access to use this feature.");
                    return;
                }
                const result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    quality: 1,
                });

                if (!result.canceled && result.assets?.length > 0) {
                    console.log("📸 Clothing photo taken:", result.assets[0].uri);
                    navigation.navigate("AddClothingItem", { imageUri: result.assets[0].uri });
                }
            }
        },
        {
            text: options[1].text,
            onPress: async () => {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== "granted") {
                    Alert.alert("Permission Required", "You must grant gallery access to use this feature.");
                    return;
                }
                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    quality: 1,
                });

                if (!result.canceled && result.assets?.length > 0) {
                    console.log("🖼️ Clothing image selected:", result.assets[0].uri);
                    navigation.navigate("AddClothingItem", { imageUri: result.assets[0].uri });
                }
            }
        },
        { text: options[2].text, style: "cancel" }
    ]);
};

const handleCreatePost = async (navigation) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
        Alert.alert("Permission Required", "You must grant gallery access to use this feature.");
        return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
    });


    if (!result.canceled && result.assets?.length > 0) {
        console.log("🖼️ Post image selected:", result.assets[0].uri);
        navigation.navigate("AddPost", { imageUri: result.assets[0].uri });
    }
};


const CameraScreen = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.panel} onPress={() => handleCreatePost(navigation)}>
                <Icon name="image-outline" size={40} color="#FFFFFF" />
                <Text style={styles.panelText}>Post a Social Media Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.panel} onPress={() => handleScanArticle(navigation)}>
                <Icon name="scan-outline" size={40} color="#FFFFFF" />
                <Text style={styles.panelText}>Scan Article</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#2C2C2C",
        justifyContent: "center",
        alignItems: "center",
    },
    panel: {
        width: "80%",
        padding: 20,
        backgroundColor: "#1E1E1E",
        borderRadius: 15,
        alignItems: "center",
        marginVertical: 10,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    panelText: {
        marginTop: 10,
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
});

export default CameraScreen;
