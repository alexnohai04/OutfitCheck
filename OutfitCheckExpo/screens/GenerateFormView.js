// GenerateFormView.js with unified payload (context, season & article preferences)
import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Dimensions,
    SafeAreaView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserContext } from '../UserContext';
import apiClient from '../apiClient';
import API_URLS from '../apiConfig';

const { width } = Dimensions.get('window');

const CONTEXT_OPTIONS = [
    { id: 'school', label: 'School', emoji: '📚', mappedStyle: 'Smart Casual' },
    { id: 'work',   label: 'Work',   emoji: '💼', mappedStyle: 'Formal' },
    { id: 'party',  label: 'Party',  emoji: '🎉', mappedStyle: 'Party' },
    { id: 'sport',  label: 'Sport',  emoji: '🏃', mappedStyle: 'Sports' },
    { id: 'outing', label: 'Going Out', emoji: '🛍️', mappedStyle: 'Casual' },
];

const SEASON_OPTIONS = [
    { id: 'spring', label: 'Spring', emoji: '🌸' },
    { id: 'summer', label: 'Summer', emoji: '☀️' },
    { id: 'fall',   label: 'Fall',   emoji: '🍂' },
    { id: 'winter', label: 'Winter', emoji: '❄️' },
];

const GenerateFormView = ({ onNext }) => {
    const [step, setStep] = useState(1);
    const [selectedContext, setSelectedContext] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [includeHeadwear, setIncludeHeadwear] = useState(false);
    const [includeOuterwear, setIncludeOuterwear] = useState(false);
    const [topwearLayers, setTopwearLayers] = useState(1);
    const [preferFullBodywear, setPreferFullBodywear] = useState(false);
    const [loading, setLoading] = useState(false);

    const { userId } = useContext(UserContext);

    const isStepValid = () => {
        if (step === 1) return selectedContext !== null;
        if (step === 2) return selectedSeason !== null;
        return true;
    };

    const handleNext = async () => {
        if (step < 3) {
            setStep(step + 1);
            return;
        }

        setLoading(true);
        try {
            const contextObj = CONTEXT_OPTIONS.find(opt => opt.id === selectedContext);
            const seasonObj  = SEASON_OPTIONS.find(opt => opt.id === selectedSeason);

            const payload = {
                userId,
                context: contextObj?.mappedStyle,
                season:  seasonObj?.label,
                includeHeadwear,
                includeOuterwear,
                topwearLayers,
                preferFullBodywear,
            };

            console.log(payload);
            const response = await apiClient.post(
                API_URLS.GENERATE_OUTFIT,
                payload
            );

            onNext?.(response.data, payload.context, payload.season, {
                includeHeadwear,
                includeOuterwear,
                topwearLayers,
                preferFullBodywear,
            });

        } catch (error) {
            console.error('Error generating outfit:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderOption = (item, selected, onSelect) => (
        <TouchableOpacity
            style={[styles.option, selected === item.id && styles.optionSelected]}
            onPress={() => onSelect(item.id)}
        >
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.label}>{item.label}</Text>
        </TouchableOpacity>
    );

    const renderArticlePreferences = () => (
        <View>
            <Text style={styles.title}>What items do you want to wear?</Text>

            <View style={styles.toggleRow}>
                <TouchableOpacity
                    style={[styles.option, includeHeadwear && styles.optionSelected]}
                    onPress={() => setIncludeHeadwear(v => !v)}
                >
                    <Text style={styles.emoji}>🧢</Text>
                    <Text style={styles.label}>Headwear</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.option, includeOuterwear && styles.optionSelected]}
                    onPress={() => setIncludeOuterwear(v => !v)}
                >
                    <Text style={styles.emoji}>🧥</Text>
                    <Text style={styles.label}>Outerwear</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.toggleRow}>
                <TouchableOpacity
                    style={[styles.option, topwearLayers === 1 && styles.optionSelected]}
                    onPress={() => setTopwearLayers(1)}
                >
                    <Text style={styles.emoji}>👕</Text>
                    <Text style={styles.label}>1 Top Layer</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.option, topwearLayers === 2 && styles.optionSelected]}
                    onPress={() => setTopwearLayers(2)}
                >
                    <Text style={styles.emoji}>👕👔</Text>
                    <Text style={styles.label}>2 Top Layers</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.toggleRow}>
                <TouchableOpacity
                    style={[styles.option, preferFullBodywear && styles.optionSelected]}
                    onPress={() => setPreferFullBodywear(v => !v)}
                >
                    <Text style={styles.emoji}>👗</Text>
                    <Text style={styles.label}>Prefer FullBody</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const options = step === 1 ? CONTEXT_OPTIONS : SEASON_OPTIONS;
    const selected = step === 1 ? selectedContext : selectedSeason;
    const onSelect = step === 1 ? setSelectedContext : setSelectedSeason;

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B6B" />
                <Text style={styles.loadingText}>Generating your outfit...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.fullScreenWrapper}>
            <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${(step - 1) * 33}%` }]} />
            </View>

            {step < 3 ? (
                <>
                    <Text style={styles.title}>
                        {step === 1 ? 'Choose Context' : 'Choose Season'}
                    </Text>
                    <FlatList
                        data={options}
                        keyExtractor={item => item.id}
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                        contentContainerStyle={styles.grid}
                        renderItem={({ item }) => renderOption(item, selected, onSelect)}
                        style={{ flexGrow: 0 }}
                    />
                </>
            ) : (
                renderArticlePreferences()
            )}

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.nextButton, !isStepValid() && styles.disabledButton]}
                    onPress={handleNext}
                    disabled={!isStepValid()}
                >
                    <Text style={styles.nextButtonText}>
                        {step < 3 ? 'Next' : 'Generate'}
                    </Text>
                    <Ionicons
                        name="arrow-forward"
                        size={20}
                        color="#fff"
                        style={{ marginLeft: 5 }}
                    />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    fullScreenWrapper: {
        backgroundColor: '#1c1c1c',
        paddingTop: Platform.OS === 'android' ? 40 : 0,
        justifyContent: 'flex-start',
        paddingHorizontal: 20,
        width: '90%',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#1c1c1c',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#FFFFFF',
    },
    progressBarContainer: {
        height: 6,
        backgroundColor: '#333',
        borderRadius: 3,
        marginBottom: 20,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#FF6B6B',
        borderRadius: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 20,
    },
    grid: {
        paddingBottom: 40,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    option: {
        flex: 1,
        marginHorizontal: 8,
        backgroundColor: '#2E2E2E',
        borderRadius: 16,
        paddingVertical: 30,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#444',
    },
    optionSelected: {
        borderColor: '#FF6B6B',
    },
    emoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        color: '#FFFFFF',
    },
    buttonContainer: {
        marginTop: 'auto',
        paddingBottom: 40,
    },
    nextButton: {
        flexDirection: 'row',
        backgroundColor: '#FF6B6B',
        borderRadius: 12,
        paddingVertical: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.5,
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
});

export default GenerateFormView;
