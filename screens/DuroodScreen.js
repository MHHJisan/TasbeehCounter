import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "react-native";
import moment from "moment";

const STORAGE_PREFIX = "@durood_";
const BREAKDOWN_PREFIX = "@breakdown_";
const DUROOD_OPTIONS = [
  "Allahumma salli wa sallim ala nabiyyina Muhammad ﷺ",
  "As-salatu was-salamu ala Rasulullah ﷺ",
  "Allahumma salli ala Muhammad ﷺ",
];

const DuroodScreen = () => {
  const [count, setCount] = useState(0);
  const [yesterdayCount, setYesterdayCount] = useState(0);
  const [selectedDurood, setSelectedDurood] = useState(DUROOD_OPTIONS[0]);
  const [history, setHistory] = useState([]);
  const [breakdown, setBreakdown] = useState({});
  const [showSummary, setShowSummary] = useState(false);

  const today = moment().format("YYYY-MM-DD");

  useEffect(() => {
    loadTodayCount();
    loadYesterdayCount();
    loadBreakdown();
  }, []);

  useEffect(() => {
    saveTodayCount();
    saveBreakdown();
    if (showSummary) {
      loadWeeklyHistory();
    }
  }, [count, breakdown, showSummary]);

  const loadTodayCount = async () => {
    try {
      const savedCount = await AsyncStorage.getItem(STORAGE_PREFIX + today);
      setCount(savedCount ? parseInt(savedCount) : 0);
    } catch (error) {
      console.error("Failed to load today's count:", error);
    }
  };

  const saveTodayCount = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_PREFIX + today, count.toString());
    } catch (error) {
      console.error("Failed to save today's count:", error);
    }
  };

  const loadYesterdayCount = async () => {
    try {
      const yesterday = moment().subtract(1, "day").format("YYYY-MM-DD");
      const savedCount = await AsyncStorage.getItem(STORAGE_PREFIX + yesterday);
      setYesterdayCount(savedCount ? parseInt(savedCount) : 0);
    } catch (error) {
      console.error("Failed to load yesterday's count:", error);
    }
  };

  const loadBreakdown = async () => {
    try {
      const savedBreakdown = await AsyncStorage.getItem(
        BREAKDOWN_PREFIX + today
      );
      if (savedBreakdown) {
        setBreakdown(JSON.parse(savedBreakdown));
      } else {
        // Initialize breakdown with zeros
        const initialBreakdown = {};
        DUROOD_OPTIONS.forEach((durood) => {
          initialBreakdown[durood] = 0;
        });
        setBreakdown(initialBreakdown);
      }
    } catch (error) {
      console.error("Failed to load breakdown:", error);
    }
  };

  const saveBreakdown = async () => {
    try {
      await AsyncStorage.setItem(
        BREAKDOWN_PREFIX + today,
        JSON.stringify(breakdown)
      );
    } catch (error) {
      console.error("Failed to save breakdown:", error);
    }
  };

  const loadWeeklyHistory = async () => {
    try {
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = moment().subtract(i, "days").format("YYYY-MM-DD");
        const stored = await AsyncStorage.getItem(STORAGE_PREFIX + date);
        const storedBreakdown = await AsyncStorage.getItem(
          BREAKDOWN_PREFIX + date
        );

        last7Days.push({
          date,
          total: stored ? parseInt(stored) : 0,
          breakdown: storedBreakdown ? JSON.parse(storedBreakdown) : {},
        });
      }
      setHistory(last7Days);
    } catch (error) {
      console.error("Failed to load weekly history:", error);
    }
  };

  const incrementCount = () => {
    setCount((prev) => prev + 1);
    setBreakdown((prev) => ({
      ...prev,
      [selectedDurood]: (prev[selectedDurood] || 0) + 1,
    }));
  };

  const toggleSummary = () => {
    setShowSummary((prev) => !prev);
  };

  const getDuroodShortName = (durood) => {
    const firstWords = durood.split(" ").slice(0, 2).join(" ");
    return `${firstWords}...`;
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: "#f3fdfb",
        paddingTop: StatusBar.currentHeight || 40,
      }}
    >
      <View style={styles.container}>
        <Text style={styles.subtext}>🕌 Daily Durood Counter</Text>
        <Text style={styles.intro}>
          Send more and more Salawat upon the Prophet ﷺ
        </Text>

        <Text style={styles.header}>{selectedDurood}</Text>

        <View style={styles.mainRow}>
          <TouchableOpacity
            onPress={incrementCount}
            style={styles.counterButton}
          >
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

        <View style={styles.breakdownContainer}>
          <Text style={styles.breakdownTitle}>Today's Breakdown:</Text>
          {DUROOD_OPTIONS.map((item, index) => (
            <View key={index} style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>
                {index + 1}. {getDuroodShortName(item)}
              </Text>
              <Text style={styles.breakdownValue}>{breakdown[item] || 0}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.yesterdayText}>
          📆 Yesterday's Count: {yesterdayCount}
        </Text>

        <TouchableOpacity onPress={toggleSummary} style={styles.summaryButton}>
          <Text style={styles.summaryButtonText}>
            {showSummary ? "Hide Summary" : "📊 Show Weekly Summary"}
          </Text>
        </TouchableOpacity>

        {showSummary && (
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>📅 Weekly Summary</Text>
            {history.map((entry) => (
              <View key={entry.date} style={styles.historyCard}>
                <Text style={styles.historyDate}>
                  {moment(entry.date).format("ddd, MMM D")}: {entry.total}
                </Text>
                <View style={styles.historyBreakdown}>
                  {DUROOD_OPTIONS.map((durood, idx) => (
                    <View key={idx} style={styles.breakdownItem}>
                      <Text style={styles.breakdownNumber}>{idx + 1}.</Text>
                      <Text style={styles.breakdownCount}>
                        {entry.breakdown[durood] || 0}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.note}>
          ✨ This counter resets at midnight (12:00 AM). Keep sending blessings
          upon the Prophet
          <Text style={{ fontSize: 14, color: "#065f46" }}> ﷺ </Text>!
        </Text>
      </View>
    </ScrollView>
  );
};

export default DuroodScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3fdfb",
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 40,
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
    marginVertical: 20,
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
  breakdownContainer: {
    backgroundColor: "#e0f2fe",
    padding: 15,
    borderRadius: 12,
    width: "100%",
    marginVertical: 15,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0369a1",
    marginBottom: 10,
    textAlign: "center",
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  breakdownLabel: {
    fontSize: 14,
    color: "#0c4a6e",
    flex: 1,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0c4a6e",
    minWidth: 30,
    textAlign: "right",
  },
  yesterdayText: {
    fontSize: 14,
    color: "#374151",
    marginTop: 10,
    marginBottom: 8,
    fontStyle: "italic",
    textAlign: "center",
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
  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  historyDate: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
    textAlign: "center",
  },
  historyBreakdown: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 5,
  },
  breakdownItem: {
    alignItems: "center",
    marginHorizontal: 5,
  },
  breakdownNumber: {
    fontSize: 12,
    color: "#64748b",
  },
  breakdownCount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e40af",
  },
  note: {
    marginTop: 10,
    color: "#555",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    fontStyle: "italic",
  },
});
