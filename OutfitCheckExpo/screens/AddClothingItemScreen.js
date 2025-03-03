import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import API_URLS from "../apiConfig";

const AddClothingItemScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { imageUri } = route.params || {};

    const [color, setColor] = useState("");
    const [material, setMaterial] = useState("");
    const [category, setCategory] = useState(null); // Inițial fără selecție
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true); // Stare de încărcare

    // 📌 Fetch categorii din backend
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(API_URLS.GET_CLOTHING_CATEGORIES); // Endpoint backend
                const data = await response.json();

                // Transformă rezultatul în formatul necesar pentru DropDownPicker
                const formattedCategories = data.map((category) => ({
                    label: category.name, // Numele categoriei
                    value: category.name, // Valoarea selectată
                }));

                setItems(formattedCategories);
                setLoading(false);
            } catch (error) {
                console.error("Eroare la încărcarea categoriilor:", error);
                Alert.alert("Eroare", "Nu s-au putut încărca categoriile.");
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleSave = async () => {
        if (!imageUri) {
            Alert.alert("Eroare", "Nu există nicio imagine! Te rog capturează o fotografie.");
            return;
        }
        if (!color || !material || !category) {
            Alert.alert("Eroare", "Te rog completează toate câmpurile!");
            return;
        }

        const clothingItem = {
            imageUrl: imageUri,
            color,
            material,
            categoryId: category, // Trimitem ID-ul categoriei, nu textul
            userId: 8 // 🔥 Schimbă acest ID cu cel real al utilizatorului (ex: din AsyncStorage)
        };

        try {
            const response = await fetch(API_URLS.ADD_CLOTHING, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(clothingItem),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("Succes", "Articolul vestimentar a fost salvat!");
                navigation.goBack(); // Ne întoarcem la ecranul anterior
            } else {
                Alert.alert("Eroare", data.message || "Nu s-a putut salva articolul. Încearcă din nou.");
            }
        } catch (error) {
            Alert.alert("Eroare", "A apărut o problemă la salvare. Verifică conexiunea la server.");
        }
    };


    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
                style={styles.container}
            >
                <View style={styles.innerContainer}>
                    <Text style={styles.title}>Adaugă un articol vestimentar</Text>

                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.image} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Text style={styles.imagePlaceholderText}>Nicio imagine</Text>
                        </View>
                    )}

                    <TextInput
                        placeholder="Culoare"
                        placeholderTextColor="#A0A0A0"
                        value={color}
                        onChangeText={setColor}
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Material"
                        placeholderTextColor="#A0A0A0"
                        value={material}
                        onChangeText={setMaterial}
                        style={styles.input}
                    />

                    <Text style={styles.label}>Categorie:</Text>
                    {loading ? (
                        <ActivityIndicator size="large" color="#FFFFFF" />
                    ) : (
                        <DropDownPicker
                            open={open}
                            value={category} // 🔥 Trebuie să fie categoryId, nu numele categoriei
                            items={items}
                            setOpen={setOpen}
                            setValue={setCategory} // 🔥 Acum setăm ID-ul categoriei, nu textul
                            setItems={setItems}
                            containerStyle={styles.dropdownContainer}
                            style={styles.dropdown}
                            dropDownContainerStyle={styles.dropdownList}
                            placeholder="Selectează o categorie"
                            placeholderStyle={styles.placeholderText}
                            textStyle={styles.dropdownText}
                            labelStyle={styles.dropdownLabel}
                            zIndex={1000}
                            zIndexInverse={3000}
                            onOpen={Keyboard.dismiss}
                        />

                    )}

                    <TouchableOpacity onPress={handleSave} style={styles.button}>
                        <Text style={styles.buttonText}>Salvează articolul</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#2C2C2C",
        justifyContent: "center",
        alignItems: "center",
    },
    innerContainer: {
        width: "90%",
        alignItems: "center",
        backgroundColor: "#1E1E1E",
        paddingVertical: 20,
        borderRadius: 15,
        paddingHorizontal: 15,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 20,
        textAlign: "center",
        marginTop: Platform.OS === "ios" ? 50 : 30,
    },
    image: {
        width: 250,
        height: 250,
        marginBottom: 20,
        borderRadius: 15,
    },
    imagePlaceholder: {
        width: 250,
        height: 250,
        marginBottom: 20,
        borderRadius: 15,
        backgroundColor: "#444",
        justifyContent: "center",
        alignItems: "center",
    },
    imagePlaceholderText: {
        color: "#A0A0A0",
        fontSize: 16,
    },
    input: {
        width: "100%",
        padding: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#444",
        borderRadius: 10,
        backgroundColor: "#3A3A3A",
        color: "#FFFFFF",
    },
    label: {
        color: "#FFFFFF",
        marginBottom: 5,
        fontSize: 16,
        fontWeight: "bold",
    },
    dropdownContainer: {
        width: "100%",
        marginBottom: 20,
    },
    dropdown: {
        backgroundColor: "#3A3A3A",
        borderColor: "#444",
    },
    dropdownList: {
        backgroundColor: "#3A3A3A",
        borderColor: "#444",
    },
    placeholderText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    dropdownText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    dropdownLabel: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    button: {
        backgroundColor: "#FF6B6B",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        marginVertical: 10,
        width: "100%",
        alignItems: "center",
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default AddClothingItemScreen;
