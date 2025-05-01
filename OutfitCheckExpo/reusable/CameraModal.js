// screens/CameraScreen.js
import React, { useEffect } from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    TouchableWithoutFeedback
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import globalStyles from "../styles/globalStyles";

const CameraModal = ({ visible, onClose }) => {
    const navigation = useNavigation();

    // useEffect(() => {
    //     if (!visible && navigation.canGoBack()) {
    //         navigation.goBack();
    //     }
    // }, [visible]);

    const handleScanArticle = async (source) => {
        if (source === "camera") {
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

                navigation.navigate("LoadingScreen", { imageUri: result.assets[0].uri });
                setTimeout(() => onClose(), 0)
            }
        } else if (source === "gallery") {
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

                navigation.navigate("LoadingScreen", { imageUri: result.assets[0].uri });
                setTimeout(() => onClose(), 0)
            }
        }
    };

    const handleCreatePost = async () => {
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
            navigation.navigate("AddPost", { imageUri: result.assets[0].uri });
            setTimeout(() => onClose(), 0)
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={() => {}}>
                        <View style={styles.modalContentEnhanced}>
                            <View style={globalStyles.dragBar} />
                            <Text style={styles.modalTitle}>Select Action</Text>

                            <View style={styles.modeOptionsContainer}>
                                <TouchableOpacity
                                    style={styles.modeOptionBox}
                                    onPress={handleCreatePost}
                                >
                                    <Icon name="image-outline" size={24} color="#FFF" style={styles.modeIcon} />
                                    <Text style={styles.modeLabel}>Post a Social Media Photo</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.modeOptionBox}
                                    onPress={() => handleScanArticle("gallery")}
                                >
                                    <Icon name="scan-outline" size={24} color="#FFF" style={styles.modeIcon} />
                                    <Text style={styles.modeLabel}>Scan Article</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>

    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContentEnhanced: {
        backgroundColor: '#1E1E1E',
        paddingVertical: 24,
        paddingHorizontal: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        alignItems: 'center',
    },
    modalTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    modeOptionsContainer: {
        flexDirection: 'column',
        width: '100%',
        gap: 16,
    },
    modeOptionBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#444',
        borderWidth: 2,
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#2C2C2C',
    },
    modeLabel: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 12,
    },
    modeIcon: {
        marginBottom: 0,
    },
});

export default CameraModal;