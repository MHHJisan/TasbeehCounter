import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "react-native";
import moment from "moment";
import istighfarData from "../data/istigfhar/istigfhar.json";

const STORAGE_PREFIX = "@istighfar_";
const ISTIGHFAR_DATA = istighfarData;

const IstighfarScreen = () => {
  const [count, setCount] = useState(0);
  const [yesterdayCount, setYesterdayCount] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [showSummary, setShowSummary] = useState(false);

  const today = moment().format("YYYY-MM-DD");
  const selectedIstighfar = ISTIGHFAR_DATA[selectedIndex];

  useEffect(() => {
    loadTodayCount();
    loadYesterdayCount();
    loadWeeklyHistory();
  }, []);

  const loadTodayCount = async () => {
    const savedData = await AsyncStorage.getItem(STORAGE_PREFIX + today);
    if (savedData !== null) {
      const parsed = JSON.parse(savedData);
      setCount(parsed.total || 0);
    } else {
      setCount(0);
    }
  };

  const loadYesterdayCount = async () => {
    const yesterday = moment().subtract(1, "day").format("YYYY-MM-DD");
    const savedData = await AsyncStorage.getItem(STORAGE_PREFIX + yesterday);
    if (savedData !== null) {
      const parsed = JSON.parse(savedData);
      setYesterdayCount(parsed.total || 0);
    } else {
      setYesterdayCount(0);
    }
  };

  const saveCountToStorage = async (updatedCount, index) => {
    const existingData = await AsyncStorage.getItem(STORAGE_PREFIX + today);
    let parsed = existingData
      ? JSON.parse(existingData)
      : { total: 0, details: {} };

    parsed.total = updatedCount;
    parsed.details[index] = (parsed.details[index] || 0) + 1;

    await AsyncStorage.setItem(STORAGE_PREFIX + today, JSON.stringify(parsed));
  };

  const incrementCount = async () => {
    const updatedCount = count + 1;
    setCount(updatedCount);

    await saveCountToStorage(updatedCount, selectedIndex);

    // Optionally reload today's count to sync state exactly with storage
    await loadTodayCount();

    if (showSummary) {
      await loadWeeklyHistory();
    }
  };

  const loadWeeklyHistory = async () => {
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const date = moment().subtract(i, "days").format("YYYY-MM-DD");
      const stored = await AsyncStorage.getItem(STORAGE_PREFIX + date);

      if (stored) {
        const parsed = JSON.parse(stored);
        last7Days.push({
          date,
          total: parsed.total || 0,
          details: parsed.details || {},
        });
      } else {
        last7Days.push({ date, total: 0, details: {} });
      }
    }

    setHistory(last7Days);
  };

  const toggleSummary = () => {
    if (!showSummary) loadWeeklyHistory();
    setShowSummary((prev) => !prev);
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#eef2f3",
        paddingTop: StatusBar.currentHeight || 40,
      }}
    >
      <View style={styles.container}>
        <Text style={styles.subtext}>🤲 Daily Istighfar Counter</Text>

        <ScrollView style={styles.duaBox}>
          <Text style={styles.arabic}>{selectedIstighfar.arabic}</Text>
          <Text style={styles.transliteration}>
            {selectedIstighfar.transliteration}
          </Text>
          <Text style={styles.meaning}>{selectedIstighfar.meaning}</Text>
        </ScrollView>

        <TouchableOpacity onPress={incrementCount} style={styles.counterButton}>
          <Text style={styles.counterText}>{count}</Text>
        </TouchableOpacity>

        <Text style={styles.yesterdayText}>
          📆 Yesterday's Count: {yesterdayCount}
        </Text>

        <View style={styles.selectorRow}>
          {ISTIGHFAR_DATA.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.istighfarButton,
                selectedIndex === index && styles.istighfarButtonActive,
              ]}
              onPress={() => setSelectedIndex(index)}
            >
              <Text
                style={[
                  styles.istighfarButtonText,
                  selectedIndex === index && styles.istighfarButtonTextActive,
                ]}
              >
                {index + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={toggleSummary} style={styles.summaryButton}>
          <Text style={styles.summaryButtonText}>
            {showSummary ? "Hide Summary" : "📊 Show Weekly Summary"}
          </Text>
        </TouchableOpacity>

        {showSummary && (
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>📅 Weekly Summary</Text>
            {history.map((entry) => (
              <View key={entry.date} style={{ marginBottom: 10 }}>
                <Text style={styles.historyEntry}>
                  {moment(entry.date).format("ddd, MMM D")}: {entry.total} total
                </Text>
                {Object.entries(entry.details).map(([index, val]) => (
                  <Text
                    key={index}
                    style={[styles.historyEntry, { paddingLeft: 12 }]}
                  >
                    • Istighfar {parseInt(index) + 1}: {val}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}

        <Text style={styles.note}>
          ✨ Counter resets at midnight (12:00 AM). Keep seeking forgiveness!
        </Text>
      </View>
    </ScrollView>
  );
};

export default IstighfarScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  subtext: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e3a8a",
    backgroundColor: "#dbeafe",
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 14,
    marginBottom: 20,
  },
  duaBox: {
    maxHeight: 210,
    width: "100%",
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  arabic: {
    fontSize: 24,
    color: "#064e3b",
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 36,
    marginBottom: 12,
  },
  transliteration: {
    fontSize: 16,
    color: "#0f172a",
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 8,
  },
  meaning: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
    lineHeight: 20,
  },
  counterButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#0284c7",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  counterText: {
    fontSize: 50,
    fontWeight: "bold",
    color: "#fff",
  },
  yesterdayText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 10,
    fontStyle: "italic",
    textAlign: "center",
  },
  selectorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 10,
  },
  istighfarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#cbd5e1",
    justifyContent: "center",
    alignItems: "center",
    margin: 6,
  },
  istighfarButtonActive: {
    backgroundColor: "#1e40af",
  },
  istighfarButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
  },
  istighfarButtonTextActive: {
    color: "#fff",
  },
  summaryButton: {
    backgroundColor: "#facc15",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  summaryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  summaryBox: {
    backgroundColor: "#f3f4f6",
    padding: 16,
    borderRadius: 10,
    width: "100%",
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e3a8a",
    marginBottom: 10,
    textAlign: "center",
  },
  historyEntry: {
    fontSize: 14,
    color: "#374151",
    paddingVertical: 2,
    textAlign: "center",
  },
  note: {
    marginTop: 15,
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    paddingHorizontal: 15,
  },
});
