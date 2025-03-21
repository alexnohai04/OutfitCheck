import { StyleSheet } from "react-native";

const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#2C2C2C",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 20,
    },
    input: {
        width: "80%",
        padding: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#444",
        borderRadius: 8,
        backgroundColor: "#3A3A3A",
        color: "#FFFFFF",
    },
    button: {
        backgroundColor: "#FF6B6B",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginVertical: 10,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
    screen: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#2C2C2C",
    },
    text: {
        fontSize: 24,
        color: "#FFFFFF",
    },
    tabBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 70,
        backgroundColor: "#1E1E1E",
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        borderTopWidth: 0,
        elevation: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        paddingBottom: 20,
    },
    iconContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    activeBackground: {
        position: "absolute",
        width: 65,
        height: 60,
        borderRadius: 25,
        backgroundColor: "#1E1E1E",
        top: -15, // **Urcă puțin peste navbar, exact cum ai vrut**
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        borderRadius: 10,
        //flex: 1,
        marginVertical: 5,
        marginRight:15
    },
    deleteText: {
        color: 'white',
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#2C2C2C",
    },
    profileContainer: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#2C2C2C",
        paddingTop: 50,
    },
    profileHeader: {
        alignItems: "center",
        marginBottom: 30,
    },
    username: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    email: {
        fontSize: 16,
        color: "#AAAAAA",
        marginBottom: 10,
    },
    buttonsContainer: {
        width: "100%",
        alignItems: "center",
    },
    iconButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#3A3A3A",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        width: "80%",
        marginBottom: 15,
    },
    iconText: {
        color: "#FFFFFF",
        fontSize: 18,
        marginLeft: 10,
    },
    profileImageContainer: {
        width: 120, // Dimensiune fixă
        height: 120, // Face containerul pătrat
        borderRadius: 60, // Face containerul un cerc
        backgroundColor: "#3A3A3A", // Fundal gri dacă nu există imagine
        justifyContent: "center", // Centrează imaginea pe verticală
        alignItems: "center", // Centrează imaginea pe orizontală
        borderWidth: 3,
        borderColor: "#FF6B6B", // Bordură roșie pentru evidențiere
        overflow: "hidden", // Previne întinderea border-ului
    },
    profileImage: {
        width: "100%", // Ocupă tot containerul
        height: "100%", // Respectă proporțiile
        borderRadius: 60, // Asigură că și imaginea este rotundă
        resizeMode: "cover", // Evită stretching-ul imaginii
    }

});

export default globalStyles;
