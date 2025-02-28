import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

const HomeScreen = () => {
  return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Bine ai venit la OutfitCheck! 👕👖👟</Text>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default HomeScreen;
