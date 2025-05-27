// components/ModeSelectorModal.js
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import globalStyles from '../styles/globalStyles';

/**
 * Reusable modal component for selecting between modes.
 *
 * Props:
 * - visible: boolean
 * - options: Array<{ id: string, label: string, icon: string }>
 * - selectedId: string
 * - title: string
 * - onSelect: (id: string) => void
 * - onClose: () => void
 */
const ModeSelectorModal = ({ visible, options, selectedId, title, onSelect, onClose }) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.container}>
            {/* Dark overlay behind modalContent */}
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay} />
            </TouchableWithoutFeedback>

            {/* Modal content placed at bottom */}
            <View style={styles.contentWrapper}>
                <SafeAreaView style={styles.modalContent}>
                    <View style={styles.dragBar} />
                    <Text style={styles.modalTitle}>{title}</Text>
                    {options.map(opt => (
                        <TouchableOpacity
                            key={opt.id}
                            style={[
                                styles.optionBox,
                                selectedId === opt.id && styles.optionSelected,
                            ]}
                            onPress={() => {
                                onSelect(opt.id);
                                onClose();
                            }}
                        >
                            <Ionicons name={opt.icon} size={24} color="#FFF" style={styles.icon} />
                            <Text style={styles.optionLabel}>{opt.label}</Text>
                        </TouchableOpacity>
                    ))}
                </SafeAreaView>
            </View>
        </View>
    </Modal>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    contentWrapper: {
        width: '100%',
    },
    modalContent: {
        backgroundColor: '#1E1E1E',
        paddingVertical: 24,
        paddingHorizontal: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    dragBar: {
        width: 40,
        height: 4,
        backgroundColor: '#444',
        borderRadius: 2,
        alignSelf: 'center',
        margin: 12,
    },
    modalTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 16,
        marginBottom: 5
    },
    optionBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#444',
        borderWidth: 2,
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#2C2C2C',
        marginHorizontal: 15,
        marginVertical: 5
    },
    optionSelected: {
        borderColor: '#FF6B6B',
    },
    icon: {
        marginRight: 12,
    },
    optionLabel: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default ModeSelectorModal;
