import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";

const STORAGE_KEY = "@durood_count";
const DATE_KEY = "@durood_date";

const DuroodScreen = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    checkAndResetCount();
  }, []);

  useEffect(() => {
    saveCount();
  }, [count]);

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

  const saveCount = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, count.toString());
  };

  const incrementCount = () => {
    setCount((prev) => prev + 1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Allahumma Salli Ala Muhammad ﷺ</Text>
      <Text style={styles.subtext}>Daily Durood Counter</Text>

      <TouchableOpacity onPress={incrementCount} style={styles.counterButton}>
        <Text style={styles.counterText}>{count}</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Counter resets at 12:00 AM daily. Try sending as many Durood as
        possible!
      </Text>
    </View>
  );
};

export default DuroodScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "800",
    color: "#006400",
    textAlign: "center",
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: "#555",
    marginBottom: 30,
  },
  counterButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#008080",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  counterText: {
    fontSize: 50,
    fontWeight: "bold",
    color: "#fff",
  },
  note: {
    marginTop: 30,
    color: "#777",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
