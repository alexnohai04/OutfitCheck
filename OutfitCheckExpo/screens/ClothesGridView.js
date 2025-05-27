import React from 'react';
import {
    View,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView
} from 'react-native';

/**
 * Props:
 * - clothes: array of clothing items
 * - categories: array of category names
 * - selectedCategory: currently selected category
 * - onSelectCategory: callback when category is selected
 * - navigation: react-navigation navigation prop
 */
const ClothesGridView = ({ clothes, categories, selectedCategory, onSelectCategory, navigation }) => {
    const filteredClothes = selectedCategory === 'All'
        ? clothes
        : clothes.filter(item => item.category.name === selectedCategory);

    const renderClothingItem = ({ item }) => (
        <TouchableOpacity
            style={styles.clothingItemContainer}
            onPress={() => navigation.navigate('ClothingItemDetailsScreen', { item })}
        >
            {item.base64Image ? (
                <Image source={{ uri: item.base64Image }} style={styles.image} />
            ) : (
                <View style={styles.imagePlaceholder}>
                    <Text style={styles.imagePlaceholderText}>No Image</Text>
                </View>
            )}
            <Text style={styles.itemText}>{item.articleType}</Text>
            <Text style={styles.itemSubText}>{item.baseColor}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.buttonsContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryScroll}
                >
                    {categories.map(category => (
                        <TouchableOpacity
                            key={category}
                            style={[
                                styles.categoryButton,
                                selectedCategory === category && styles.categoryButtonSelected
                            ]}
                            onPress={() => onSelectCategory(category)}
                        >
                            <Text style={styles.categoryText}>{category}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredClothes}
                keyExtractor={item => item.id.toString()}
                renderItem={renderClothingItem}
                numColumns={3}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1E1E1E' },
    buttonsContainer: { height: 50, marginBottom: 10 },
    categoryScroll: { flexGrow: 0, padding: 5 },
    categoryButton: {
        minWidth: 80,
        height: 40,
        paddingHorizontal: 16,
        backgroundColor: '#564c4c',
        borderRadius: 8,
        marginHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    categoryButtonSelected: { backgroundColor: '#FF6B6B' },
    categoryText: { color: '#FFFFFF', fontSize: 16 },
    listContainer: { paddingHorizontal: 8, paddingBottom: 100 },
    clothingItemContainer: {
        flex: 1,
        aspectRatio: 0.75,
        margin: 6,
        backgroundColor: '#2C2C2C',
        borderRadius: 12,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    image: { width: '100%', height: '60%', borderRadius: 10, marginBottom: 8 },
    imagePlaceholder: {
        width: '100%',
        height: '60%',
        borderRadius: 10,
        backgroundColor: '#444',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8
    },
    imagePlaceholderText: { color: '#AAA', fontSize: 12 },
    itemText: { color: '#FFF', fontWeight: '600', fontSize: 14, marginTop: 4 },
    itemSubText: { color: '#CCC', fontSize: 12, marginTop: 2 }
});

export default ClothesGridView;
