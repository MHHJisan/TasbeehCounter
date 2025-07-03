import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";

const STORAGE_KEY = "@istighfar_count";
const DATE_KEY = "@istighfar_date";

const IstighfarScreen = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    checkAndResetCount();
  }, []);

  useEffect(() => {
    saveCount();
  }, [count]);

  // Load count and reset if date has changed
  const checkAndResetCount = async () => {
    const savedDate = await AsyncStorage.getItem(DATE_KEY);
    const today = moment().format("YYYY-MM-DD");

    if (savedDate !== today) {
      await AsyncStorage.setItem(DATE_KEY, today);
      await AsyncStorage.setItem(STORAGE_KEY, "0");
      setCount(0);
    } else {
      const savedCount = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedCount !== null) {
        setCount(parseInt(savedCount));
      }
    }
  };

  // Save count every time it updates
  const saveCount = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, count.toString());
  };

  const incrementCount = () => {
    setCount((prev) => prev + 1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Astaghfirullah</Text>
      <Text style={styles.subtext}>Daily Istighfar Counter</Text>
      <TouchableOpacity onPress={incrementCount} style={styles.counterButton}>
        <Text style={styles.counterText}>{count}</Text>
      </TouchableOpacity>
      <Text style={styles.note}>
        Counter will reset automatically at 12:00 AM daily.
      </Text>
    </View>
  );
};

export default IstighfarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2f3",
    paddingTop: 80,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#4B0082",
    marginBottom: 8,
  },
  subtext: {
    fontSize: 18,
    marginBottom: 30,
    color: "#555",
  },
  counterButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#00a86b",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    marginVertical: 20,
  },
  counterText: {
    fontSize: 50,
    fontWeight: "bold",
    color: "#fff",
  },
  note: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 30,
  },
});
