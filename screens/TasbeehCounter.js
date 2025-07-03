import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Button,
} from "react-native";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const TasbeehCounter = ({ navigation }) => {
  const [targetCount, setTargetCount] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  const countRef = useRef(count);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    countRef.current = count;
  }, [count]);

  const startCounting = () => {
    if (!targetCount || !durationMinutes) {
      Alert.alert(
        "Missing Input",
        "Please set both target count and time duration."
      );
      return;
    }

    setCount(0);
    const totalSeconds = parseInt(durationMinutes, 10) * 60;
    setTimeLeft(totalSeconds);
    setIsRunning(true);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsRunning(false);
          if (countRef.current < parseInt(targetCount, 10)) {
            Alert.alert(
              "Time Up!",
              `You reached only ${countRef.current} out of ${targetCount}.`
            );
          } else {
            Alert.alert("Success!", "You reached your goal!");
          }
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const incrementCount = () => {
    if (!isRunning) return;
    setCount((prev) => prev + 1);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#eef2f3" }}>
      <View style={[styles.container, { paddingBottom: insets.bottom + 80 }]}>
        <Text style={styles.header}>Tasbeeh Counter with Alarm</Text>
        <Text style={styles.title}>Set Your Tasbeeh Goal</Text>
        <TextInput
          placeholder="Target Count (e.g. 500) times"
          value={targetCount}
          onChangeText={setTargetCount}
          keyboardType="numeric"
          style={styles.input}
          editable={!isRunning}
        />

        <TextInput
          placeholder="Time Limit (minutes)"
          value={durationMinutes}
          onChangeText={setDurationMinutes}
          keyboardType="numeric"
          style={styles.input}
          editable={!isRunning}
        />

        <TouchableOpacity
          onPress={startCounting}
          disabled={isRunning}
          style={[styles.startButton, isRunning && { backgroundColor: "#ccc" }]}
        >
          <Text style={styles.startButtonText}>Start Counting</Text>
        </TouchableOpacity>

        <View style={styles.info}>
          <Text style={styles.label}>Count: {count} times</Text>
          <Text style={styles.label}>Target: {targetCount} times</Text>
          <Text style={styles.label}>
            Time Left: {formatTime(timeLeft)} minutes
          </Text>
        </View>

        {isRunning && (
          <View style={styles.tasbeehContainer}>
            <Text style={styles.tasbeehLabel}>Tap to Count Tasbeeh</Text>
            <TouchableOpacity
              onPress={incrementCount}
              style={styles.tasbeehButton}
            >
              <Text style={styles.tasbeehCount}>{count}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* <View style={{ marginTop: 40 }}>
        <Button
          title="Go to Dhikr Screen"
          onPress={() => navigation.navigate("Dhikr")}
        />
      </View> */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // your existing styles here
  container: {
    flex: 1,
    backgroundColor: "#eef2f3",
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    color: "#4B0082",
    textAlign: "center",
    marginTop: 30,
    marginBottom: 25,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
    fontFamily: "System",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    backgroundColor: "white",
    padding: 12,
    fontSize: 16,
    marginVertical: 10,
    borderRadius: 8,
  },
  startButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  startButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
  info: { alignItems: "center", marginVertical: 30 },
  label: { fontSize: 18, marginVertical: 5 },
  tasbeehContainer: { alignItems: "center", marginTop: 30 },
  tasbeehLabel: { fontSize: 16, marginBottom: 10, color: "#333" },
  tasbeehButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#00a86b",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  tasbeehCount: { fontSize: 40, fontWeight: "bold", color: "#fff" },
});

export default TasbeehCounter;
