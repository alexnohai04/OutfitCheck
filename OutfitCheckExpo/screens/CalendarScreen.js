// CalendarScreen.js
import React, { useState, useEffect, useRef, useContext } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    Text,
    Animated,
    TouchableWithoutFeedback,
    ActivityIndicator,
    Alert,
    TouchableOpacity
} from 'react-native';
import { CalendarList } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import API_URLS from "../apiConfig";
import { UserContext } from "../UserContext";
import apiClient from "../apiClient";
import { processClothingItems } from "../utils/imageUtils";
import OutfitPreview from "../reusable/OutfitPreview";
import globalStyles from "../styles/globalStyles";
import SelectOutfitScreen from "../screens/SelectOutfitScreen";

const CalendarScreen = () => {
    const { userId } = useContext(UserContext);
    const navigation = useNavigation();

    const [selectedDate, setSelectedDate] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectOutfitModalVisible, setSelectOutfitModalVisible] = useState(false);
    const [outfitsByDate, setOutfitsByDate] = useState({});
    const [selectedOutfitImages, setSelectedOutfitImages] = useState([]);
    const [loadingImages, setLoadingImages] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(300)).current;
    const fadeAnimSelect = useRef(new Animated.Value(0)).current;
    const slideAnimSelect = useRef(new Animated.Value(600)).current;

    const openModal = () => {
        setModalVisible(true);
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                friction: 8,
                tension: 20,
            }),
        ]).start();
    };

    const closeModal = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 500,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setModalVisible(false);
        });
    };

    const openSelectOutfitModal = () => {
        setSelectOutfitModalVisible(true);
        Animated.parallel([
            Animated.timing(fadeAnimSelect, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnimSelect, {
                toValue: 0,
                useNativeDriver: true,
                friction: 8,
                tension: 10,
            }),
        ]).start();
    };

    const closeSelectOutfitModal = () => {
        Animated.parallel([
            Animated.timing(fadeAnimSelect, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnimSelect, {
                toValue: 600,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setSelectOutfitModalVisible(false);
        });
    };

    useEffect(() => {
        if (!userId) return;
        const fetchOutfits = async () => {
            try {
                const res = await apiClient.get(`${API_URLS.GET_LOGGED_OUTFITS_BY_USER}/${userId}`);
                const byDate = {};
                res.data.forEach(entry => {
                    byDate[entry.date] = {
                        outfitId: entry.outfit.id,
                        top: entry.outfit.top,
                        bottom: entry.outfit.bottom,
                        shoes: entry.outfit.shoes
                    };
                });
                setOutfitsByDate(byDate);
            } catch (err) {
                console.error('Error fetching logged outfits:', err);
            }
        };

        fetchOutfits();
    }, [userId]);

    const fetchOutfitImages = async (outfitId) => {
        try {
            setLoadingImages(true);
            const res = await apiClient.get(`${API_URLS.GET_OUTFIT_DETAILS}/${outfitId}`);
            const processed = await processClothingItems(res.data.clothingItems);
            setSelectedOutfitImages(processed);
        } catch (err) {
            console.error("Error fetching outfit images:", err);
        } finally {
            setLoadingImages(false);
        }
    };

    const handleDayPress = (day) => {
        const date = day.dateString;
        setSelectedDate(date);
        openModal();

        const outfitData = outfitsByDate[date];
        if (outfitData?.outfitId) {
            fetchOutfitImages(outfitData.outfitId);
        } else {
            setSelectedOutfitImages([]);
        }
    };

    const handleLogOutfit = () => {
        openSelectOutfitModal();
    };

    const confirmDelete = () => {
        Alert.alert(
            "Delete outfit",
            "Are you sure you want to delete the logged outfit for this day?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteOutfitLog(selectedDate)
                }
            ]
        );
    };

    const deleteOutfitLog = async (date) => {
        try {
            await apiClient.delete(API_URLS.DELETE_LOGGED_OUTFIT(userId, date));
            setOutfitsByDate(prev => {
                const updated = { ...prev };
                delete updated[date];
                return updated;
            });
            setSelectedOutfitImages([]);
            closeModal();

            Toast.show({
                type: 'success',
                text1: 'Outfit deleted',
                text2: 'The outfit was removed from your calendar.',
                position: 'top',
            });
        } catch (err) {
            console.error("Error deleting logged outfit:", err);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Could not delete the outfit.',
                position: 'top',
            });
        }
    };

    const renderRightActions = () => (
        <TouchableOpacity style={globalStyles.deleteButton} onPress={confirmDelete}>
            <Text style={globalStyles.deleteText}>Delete</Text>
        </TouchableOpacity>
    );

    const outfit = outfitsByDate[selectedDate];

    return (
        <SafeAreaView style={styles.container}>
            <CalendarList
                pastScrollRange={12}
                futureScrollRange={0}
                scrollEnabled
                showScrollIndicator
                firstDay={1}
                onDayPress={handleDayPress}
                theme={{
                    backgroundColor: '#2C2C2C',
                    calendarBackground: '#2C2C2C',
                    dayTextColor: '#FFFFFF',
                    todayTextColor: '#FF6B6B',
                    monthTextColor: '#FFFFFF',
                    arrowColor: '#FF6B6B',
                    textDayFontWeight: 'bold',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: 'bold',
                }}
                markedDates={{
                    ...Object.keys(outfitsByDate).reduce((acc, date) => {
                        acc[date] = { marked: true, dotColor: '#FF6B6B' };
                        return acc;
                    }, {}),
                    [selectedDate]: {
                        ...(outfitsByDate[selectedDate] ? { marked: true, dotColor: '#FF6B6B' } : {}),
                        selected: true,
                        selectedColor: '#FF6B6B',
                    },
                }}
            />

            {modalVisible && (
                <View style={StyleSheet.absoluteFill}>
                    <TouchableWithoutFeedback onPress={closeModal}>
                        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]} />
                    </TouchableWithoutFeedback>

                    <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
                        <View style={globalStyles.dragBar} />
                        <Text style={styles.modalTitle}>{selectedDate}</Text>
                        {outfit ? (
                            loadingImages ? (
                                <ActivityIndicator size="large" color="#FF6B6B" style={{ marginVertical: 12 }} />
                            ) : (
                                <View style={{ width: '100%', paddingHorizontal: 24, marginBottom: 50 }}>
                                    <Swipeable renderRightActions={renderRightActions}>
                                        <OutfitPreview clothingItems={selectedOutfitImages} />
                                    </Swipeable>
                                </View>
                            )
                        ) : (
                            <>
                                <Text style={styles.modalText}>You haven't logged an outfit for this day.</Text>
                                <TouchableOpacity style={globalStyles.button} onPress={handleLogOutfit}>
                                    <Text style={globalStyles.buttonText}>Log outfit</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </Animated.View>
                </View>
            )}

            {selectOutfitModalVisible && (
                <View style={StyleSheet.absoluteFill}>
                    <TouchableWithoutFeedback onPress={closeSelectOutfitModal}>
                        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnimSelect }]} />
                    </TouchableWithoutFeedback>

                    <Animated.View style={[styles.modalContentTall, { transform: [{ translateY: slideAnimSelect }] }]}>
                        <View style={globalStyles.dragBar} />
                        <SelectOutfitScreen
                            date={selectedDate}
                            onClose={closeSelectOutfitModal}
                            onOutfitLogged={(date, data) => {
                                setOutfitsByDate(prev => ({ ...prev, [date]: data }));
                                if (date === selectedDate) fetchOutfitImages(data.outfitId);
                                closeSelectOutfitModal();
                            }}
                        />
                    </Animated.View>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2C2C2C',
        marginBottom: 70,
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        maxHeight: '90%',
        backgroundColor: '#1E1E1E',
        padding: 24,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalContentTall: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '80%',
        backgroundColor: '#1E1E1E',
        padding: 24,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        alignSelf: "center"
    },
    modalText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginVertical: 4,
    },
});

export default CalendarScreen;
