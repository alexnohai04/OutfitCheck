import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';

const ClothingItemStatCard = ({ item,navigation }) => {
    return (
        <TouchableOpacity style={styles.card}
                          onPress={() => navigation.navigate('ClothingItemDetailsScreen', { item })}>
            {item.base64Image ? (
                <Image source={{ uri: item.base64Image }} style={styles.image} />
            ) : (
                <View style={styles.imagePlaceholder}>
                    <Text style={styles.imagePlaceholderText}>No Image</Text>
                </View>
            )}
            <Text style={styles.text}>{item.articleType}</Text>
            <Text style={styles.subtext}>{item.baseColor}</Text>
            <Text style={styles.usageText}>Used {item.usageCount}x</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        width: 100,
        backgroundColor: '#2C2C2C',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        marginHorizontal: 8
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginBottom: 8
    },
    imagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#444',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8
    },
    imagePlaceholderText: {
        color: '#AAA',
        fontSize: 12
    },
    text: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 13,
        textAlign: 'center'
    },
    subtext: {
        color: '#CCC',
        fontSize: 11,
        textAlign: 'center'
    },
    usageText: {
        color: '#FF6B6B',
        fontSize: 11,
        marginTop: 4
    }
});

export default ClothingItemStatCard;
