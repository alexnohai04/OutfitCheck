import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export const toastConfig = {
    success: ({ text1, text2 }) => (
        <View style={[styles.toastContainer, styles.successBorder]}>
            <View style={styles.iconContainer}>
                <Feather name="check-circle" size={24} color="#32CD80" />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.text1}>{text1}</Text>
                {text2 ? <Text style={styles.text2}>{text2}</Text> : null}
            </View>
            <View style={[styles.staticProgressBar, { backgroundColor: '#32CD80' }]} />
        </View>
    ),

    error: ({ text1, text2 }) => (
        <View style={[styles.toastContainer, styles.errorBorder]}>
            <View style={styles.iconContainer}>
                <Feather name="x-circle" size={24} color="#FF6B6B" />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.text1}>{text1}</Text>
                {text2 ? <Text style={styles.text2}>{text2}</Text> : null}
            </View>
            <View style={[styles.staticProgressBar, { backgroundColor: '#FF6B6B' }]} />
        </View>
    ),

    info: ({ text1, text2 }) => (
        <View style={[styles.toastContainer, styles.infoBorder]}>
            <View style={styles.iconContainer}>
                <Feather name="info" size={24} color="#32CD80" />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.text1}>{text1}</Text>
                {text2 ? <Text style={styles.text2}>{text2}</Text> : null}
            </View>
            <View style={[styles.staticProgressBar, { backgroundColor: '#32CD80' }]} />
        </View>
    ),

    confirm: ({ text1, text2, props }) => (
        <TouchableOpacity
            style={[styles.toastContainer, styles.confirmBorder]}
            activeOpacity={0.8}
            onPress={props.onConfirm}
        >
            <View style={styles.iconContainer}>
                <Feather name="help-circle" size={24} color="#89cff0" />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.text1}>{text1}</Text>
                {text2 ? <Text style={styles.text2}>{text2}</Text> : null}
            </View>
            <View style={[styles.staticProgressBar, { backgroundColor: '#89cff0' }]} />
        </TouchableOpacity>
    )
};

const styles = StyleSheet.create({
    toastContainer: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginTop: 10,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
        flexDirection: 'row',
        alignItems: 'flex-start',
        position: 'relative',
        overflow: 'hidden'
    },
    iconContainer: {
        marginRight: 12,
        marginTop: 3
    },
    textContainer: {
        flex: 1
    },
    text1: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold'
    },
    text2: {
        color: '#AAAAAA',
        fontSize: 14,
        marginTop: 2
    },
    staticProgressBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: 4,
        width: '120%'
    },
   // successBorder: { borderLeftWidth: 4, borderLeftColor: '#32CD80' },
    //errorBorder: { borderLeftWidth: 4, borderLeftColor: '#FF6B6B' },
    //infoBorder: { borderLeftWidth: 4, borderLeftColor: '#32CD80' },
    //confirmBorder: { borderLeftWidth: 4, borderLeftColor: '#FFD700' }
});
