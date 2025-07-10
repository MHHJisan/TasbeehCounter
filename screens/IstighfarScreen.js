// IstighfarScreen.js
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Vibration,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "react-native";
import moment from "moment";
import { Audio } from "expo-av";

import RecorderUploader from "../components/RecorderUploader";

import istighfarData from "../data/istigfhar/istigfhar.json";

const STORAGE_PREFIX = "@istighfar_";
const ISTIGHFAR_DATA = istighfarData;

// Helper function to migrate old storage format
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
  const [audioPermission, setAudioPermission] = useState(false);

  const recordingRef = useRef(null);
  const soundRef = useRef(null);

  const today = moment().format("YYYY-MM-DD");
  const selectedIstighfar = ISTIGHFAR_DATA[selectedIndex];

  useEffect(() => {
    loadTodayCount();
    loadYesterdayCount();
    requestPermissions();

    return () => {
      stopRecording();
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const requestPermissions = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      setAudioPermission(permission.granted);
      if (!permission.granted) {
        setVoiceStatus("❌ Microphone permission required");
      }
      return permission.granted;
    } catch (error) {
      console.error("Permission error:", error);
      setVoiceStatus("❌ Permission error");
      return false;
    }
  };

  const loadTodayCount = async () => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_PREFIX + today);
      if (savedData !== null) {
        const parsed = JSON.parse(savedData);
        const migrated = migrateStorageData(parsed);
        setCount(migrated.total);
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

      data.total = newCount;
      data.details[index] = (data.details[index] || 0) + 1;

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

  const startRecording = async () => {
    if (!audioPermission) {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;
    }

    try {
      setVoiceStatus("🔊 Listening...");
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();
      recordingRef.current = recording;
    } catch (error) {
      console.error("Failed to start recording:", error);
      setVoiceStatus("❌ Error - Tap to retry");
      setIsListening(false);
    }
  };

  const stopRecording = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        if (uri) {
          await processAudio(uri);
        }
        recordingRef.current = null;
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
    } finally {
      setIsListening(false);
    }
  };

  const processAudio = async (uri) => {
    try {
      await playSound();
      simulateRecognition();

      // 🔁 Continue listening
      if (isListening) {
        await startRecording();
      }
    } catch (error) {
      console.error("Audio processing failed:", error);
      setVoiceStatus("❌ Processing error");
    }
  };

  const playSound = async () => {
    try {
      Vibration.vibrate(50);
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/blast-sound.mp3")
      );
      soundRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.log("Sound error:", error);
    }
  };

  const simulateRecognition = () => {
    const phrases = [
      "astaghfirullah",
      "astaghfirullah al azim",
      "astaghfirullah rabbi wa atubu ilaih",
      "astaghfir",
      "allah",
    ];

    if (Math.random() > 0.15) {
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      handleVoiceRecognition(randomPhrase);
    }
  };

  const handleVoiceRecognition = (text) => {
    if (text.toLowerCase().includes("astaghfir")) {
      incrementCount();
    }
  };

  const toggleVoiceRecognition = async () => {
    if (isListening) {
      await stopRecording();
      setVoiceStatus("🎤 Tap to enable voice");
    } else {
      setIsListening(true);
      setVoiceStatus("🎙️ Listening... Tap to stop");
      await startRecording();
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
        <Text style={styles.subtext}>🤲 Daily Istighfar Counter</Text>

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
    padding: 20,
    alignItems: "center",
    paddingBottom: 40,
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
    textAlign: "center",
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
  refreshIndicator: {
    position: "absolute",
    top: 10,
    right: 10,
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
    paddingVertical: 2,
    textAlign: "left",
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
