// IstighfarScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";

import RecorderUploader from "../components/RecorderUploader";
import istighfarData from "../data/istigfhar/istigfhar.json";

const STORAGE_PREFIX = "@istighfar_";
const ISTIGHFAR_DATA = istighfarData;

const migrateStorageData = (data) => {
  if (typeof data === "number") {
    return { total: data, details: {} };
  }
  return {
    total: data.total || 0,
    details: data.details || {},
  };
};

const IstighfarScreen = () => {
  const [count, setCount] = useState(0);
  const [yesterdayCount, setYesterdayCount] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("🎤 Tap to enable voice");

  const today = moment().format("YYYY-MM-DD");
  const selectedIstighfar = ISTIGHFAR_DATA[selectedIndex];

  useEffect(() => {
    loadTodayCount();
    loadYesterdayCount();
  }, [selectedIndex]);

  const loadTodayCount = async () => {
    try {
      const key = STORAGE_PREFIX + today;
      const savedData = await AsyncStorage.getItem(key);
      if (savedData !== null) {
        const parsed = JSON.parse(savedData);
        const migrated = migrateStorageData(parsed);
        setCount(migrated.details[selectedIndex] || 0);
      } else {
        setCount(0);
      }
    } catch (error) {
      console.error("Failed to load today's count:", error);
      setCount(0);
    }
  };

  const loadYesterdayCount = async () => {
    try {
      const yesterday = moment().subtract(1, "day").format("YYYY-MM-DD");
      const savedData = await AsyncStorage.getItem(STORAGE_PREFIX + yesterday);
      if (savedData !== null) {
        const parsed = JSON.parse(savedData);
        const migrated = migrateStorageData(parsed);
        setYesterdayCount(migrated.total);
      } else {
        setYesterdayCount(0);
      }
    } catch (error) {
      console.error("Failed to load yesterday's count:", error);
      setYesterdayCount(0);
    }
  };

  const saveCountToStorage = async (newCount, index) => {
    try {
      const key = STORAGE_PREFIX + today;
      const existingData = await AsyncStorage.getItem(key);

      let data;
      if (existingData) {
        const parsed = JSON.parse(existingData);
        data = migrateStorageData(parsed);
      } else {
        data = { total: 0, details: {} };
      }

      data.details[index] = newCount;

      // Update total count by summing all details counts
      data.total = Object.values(data.details).reduce(
        (acc, val) => acc + val,
        0
      );

      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save count:", error);
    }
  };

  const incrementCount = async () => {
    const newCount = count + 1;
    setCount(newCount);
    await saveCountToStorage(newCount, selectedIndex);

    if (showSummary) {
      await loadWeeklyHistory();
    }
  };

  const loadWeeklyHistory = async () => {
    setRefreshing(true);
    try {
      const last7Days = [];

      for (let i = 6; i >= 0; i--) {
        const date = moment().subtract(i, "days").format("YYYY-MM-DD");
        const stored = await AsyncStorage.getItem(STORAGE_PREFIX + date);

        if (stored) {
          const parsed = JSON.parse(stored);
          const migrated = migrateStorageData(parsed);
          last7Days.push({
            date,
            total: migrated.total,
            details: migrated.details,
          });
        } else {
          last7Days.push({ date, total: 0, details: {} });
        }
      }

      setHistory(last7Days);
    } catch (error) {
      console.error("Failed to load weekly history:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const toggleSummary = async () => {
    if (!showSummary) {
      await loadWeeklyHistory();
    }
    setShowSummary(!showSummary);
  };

  const toggleVoiceRecognition = () => {
    if (isListening) {
      setIsListening(false);
      setVoiceStatus("🎤 Tap to enable voice");
    } else {
      setIsListening(true);
      setVoiceStatus("🎙️ Listening... Tap to stop");
    }
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#eef2f3",
        paddingTop: StatusBar.currentHeight || 40,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={loadWeeklyHistory}
          tintColor="#0284c7"
        />
      }
    >
      <View style={styles.container}>
        {/* <Text style={styles.subtext}>Daily Istighfar Counter</Text> */}
        <View style={styles.header}>
          <View style={styles.headerDecoration} />
          <Text style={styles.headerText}>Daily Istighfar Counter</Text>
          <View style={styles.headerDecoration} />
        </View>

        <ScrollView style={styles.duaBox}>
          <Text style={styles.arabic}>{selectedIstighfar.arabic}</Text>
          <Text style={styles.transliteration}>
            {selectedIstighfar.transliteration}
          </Text>
          <Text style={styles.meaning}>{selectedIstighfar.meaning}</Text>
        </ScrollView>

        <TouchableOpacity
          onPress={incrementCount}
          style={styles.counterButton}
          disabled={refreshing || isListening}
        >
          <Text style={styles.counterText}>{count}</Text>
        </TouchableOpacity>

        {/* RecorderUploader mounted only when isListening is true */}
        {isListening && (
          <RecorderUploader
            onTranscription={(text) => {
              if (text.toLowerCase().includes("astaghfir")) {
                incrementCount();
              }
            }}
          />
        )}

        <TouchableOpacity
          onPress={toggleVoiceRecognition}
          style={[styles.voiceButton, isListening && styles.listeningButton]}
          disabled={refreshing}
        >
          <Text style={styles.voiceButtonText}>{voiceStatus}</Text>
          {isListening && <ActivityIndicator color="#fff" size="small" />}
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
              disabled={refreshing || isListening}
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

        <TouchableOpacity
          onPress={toggleSummary}
          style={styles.summaryButton}
          disabled={refreshing || isListening}
        >
          <Text style={styles.summaryButtonText}>
            {showSummary ? "Hide Summary" : "📊 Show Weekly Summary"}
          </Text>
        </TouchableOpacity>

        {showSummary && (
          <View style={styles.summaryBox}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>📅 Weekly Summary</Text>
              <TouchableOpacity
                onPress={loadWeeklyHistory}
                style={styles.refreshButton}
                disabled={refreshing || isListening}
              >
                <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
              </TouchableOpacity>
            </View>

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
        <Text style={styles.note}>
          🎤 Voice recognition works best in quiet environments
        </Text>
      </View>
    </ScrollView>
  );
};

export default IstighfarScreen;

const styles = StyleSheet.create({
  container: {
    // padding: 20,
    alignItems: "center",
    // paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5d4037",
    paddingTop: StatusBar.currentHeight || 40,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    width: "100%",
    marginBottom: 20,
  },
  headerDecoration: {
    width: 40,
    height: 4,
    backgroundColor: "#d7ccc8",
    borderRadius: 2,
    marginHorizontal: 10,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 1,
    fontFamily: "serif",
    marginBottom: 10,
  },
  // subtext: {
  //   fontSize: 22,
  //   fontWeight: "700",
  //   color: "#1e3a8a",
  //   backgroundColor: "#dbeafe",
  //   paddingVertical: 8,
  //   paddingHorizontal: 25,
  //   borderRadius: 14,
  //   marginBottom: 20,
  //   textAlign: "center",
  // },
  duaBox: {
    maxHeight: 210,
    width: "100%",
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    position: "relative",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  voiceButton: {
    backgroundColor: "#22c55e",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    width: "80%",
  },
  listeningButton: {
    backgroundColor: "#ef4444",
  },
  voiceButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  summaryButton: {
    backgroundColor: "#facc15",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
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
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e3a8a",
  },
  refreshButton: {
    backgroundColor: "#0284c7",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 12,
  },
  historyEntry: {
    fontSize: 14,
    color: "#374151",
  },

  note: {
    marginTop: 15,
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    paddingHorizontal: 15,
    fontStyle: "italic",
  },
});
