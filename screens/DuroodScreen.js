import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";

const STORAGE_KEY = "@durood_count";
const DATE_KEY = "@durood_date";

const DUROOD_OPTIONS = [
  "Allahumma salli wa sallim ala nabiyyina Muhammad ﷺ",
  "As-salatu was-salamu ala Rasulullah ﷺ",
  "Allahumma salli ala Muhammad ﷺ",
];

const DuroodScreen = () => {
  const [count, setCount] = useState(0);
  const [selectedDurood, setSelectedDurood] = useState(DUROOD_OPTIONS[0]);

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
    // Optional background image
    // <ImageBackground source={require('../assets/mosque-bg.png')} style={{ flex: 1 }}>
    <View style={styles.container}>
      <Text style={styles.subtext}>🕌 Daily Durood Counter</Text>
      <Text style={styles.intro}>
        Send more and more Salawat upon the Prophet ﷺ
      </Text>

      <Text style={styles.header}>{selectedDurood}</Text>

      <View style={styles.mainRow}>
        <TouchableOpacity onPress={incrementCount} style={styles.counterButton}>
          <Text style={styles.counterText}>{count}</Text>
        </TouchableOpacity>

        <View style={styles.duroodSelector}>
          {DUROOD_OPTIONS.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.duroodButton,
                selectedDurood === item && styles.duroodButtonActive,
              ]}
              onPress={() => setSelectedDurood(item)}
            >
              <Text
                style={[
                  styles.duroodButtonText,
                  selectedDurood === item && styles.duroodButtonTextActive,
                ]}
              >
                {index + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={styles.note}>
        ✨ This counter resets at midnight (12:00 AM). Keep sending blessings!
      </Text>
    </View>
    // </ImageBackground>
  );
};

export default DuroodScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3fdfb",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  subtext: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f5132",
    backgroundColor: "#d1fae5",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
    textAlign: "center",
  },
  intro: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    marginBottom: 15,
    fontStyle: "italic",
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    color: "#065f46",
    textAlign: "center",
    marginBottom: 15,
    paddingHorizontal: 15,
    lineHeight: 28,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  counterButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#0d9488",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  counterText: {
    fontSize: 50,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  note: {
    marginTop: 30,
    color: "#555",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    fontStyle: "italic",
  },
  duroodSelector: {
    marginLeft: 20,
    justifyContent: "center",
  },
  duroodButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  duroodButtonActive: {
    backgroundColor: "#065f46",
    borderColor: "#065f46",
  },
  duroodButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
  },
  duroodButtonTextActive: {
    color: "#fff",
  },
});
