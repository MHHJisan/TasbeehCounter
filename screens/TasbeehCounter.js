import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import { Audio } from "expo-audio";
import ConfettiCannon from "react-native-confetti-cannon";
import {
  useSafeAreaInsets,
  SafeAreaView,
} from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const TasbeehCounter = () => {
  const [targetCount, setTargetCount] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const timerRef = useRef(null);
  const countRef = useRef(count);
  const soundRef = useRef(null);
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    countRef.current = count;
  }, [count]);

  useEffect(() => {
    if (isRunning && !isPressed) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRunning, isPressed]);

  const playBlastSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/blast-sound.mp3")
      );
      await sound.playAsync();
    } catch (error) {
      console.log("🔴 Sound playback error:", error?.message || error);
      Alert.alert(
        "Sound Error",
        "Could not play sound. Check console for details."
      );
    }
  };

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
    setShowConfetti(false);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1 || countRef.current >= parseInt(targetCount, 10)) {
          clearInterval(timerRef.current);
          setIsRunning(false);
          if (countRef.current >= parseInt(targetCount, 10)) {
            setShowConfetti(true);
            playBlastSound();
            Alert.alert("MashaAllah..", "You reached your Tasbeeh goal!");
          } else {
            Alert.alert(
              "Time Up!",
              `You reached only ${countRef.current} out of ${targetCount}.`
            );
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (soundRef.current) soundRef.current.unloadAsync();
    };
  }, []);

  const getButtonColor = () => {
    if (!targetCount) return "#00a86b";
    const progress = count / parseInt(targetCount, 10);
    if (progress >= 0.8) return "#ff6b6b"; // Red when close to target
    if (progress >= 0.6) return "#ffa726"; // Orange when 60%+ complete
    if (progress >= 0.4) return "#66bb6a"; // Light green when 40%+ complete
    return "#00a86b"; // Default green
  };

  const handlePressIn = () => {
    setIsPressed(true);
    pulseAnim.setValue(1);
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const incrementCount = () => {
    if (!isRunning) return;
    setCount((prev) => prev + 1);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Header entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#eef2f3" }}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.container, { paddingBottom: insets.bottom + 20 }]}>
          {/* Enhanced Header */}
          <Animated.View
            style={[
              styles.headerContainer,
              {
                transform: [
                  {
                    translateY: headerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-50, 0],
                    }),
                  },
                  {
                    scale: headerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
                opacity: headerAnim,
              },
            ]}
          >
            <View style={styles.headerGradient}>
              <View style={styles.headerRow}>
                <Text style={styles.decorationText}>☪️</Text>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.header}>🕌 Tasbeeh Counter</Text>
                  <Text style={styles.subHeader}>Count Your Blessings</Text>
                </View>
                <Text style={styles.decorationText}>☪️</Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.titleContainer,
              {
                transform: [
                  {
                    translateY: titleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
                opacity: titleAnim,
              },
            ]}
          >
            <Text style={styles.title}>Set Your Tasbeeh Goal</Text>
            <View style={styles.titleUnderline} />
            <Text style={styles.titleSubtext}>
              Begin your spiritual journey
            </Text>
          </Animated.View>

          <TextInput
            placeholder="Target Count (e.g. 500)"
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
            style={[
              styles.startButton,
              isRunning && { backgroundColor: "#ccc" },
            ]}
          >
            <Text style={styles.startButtonText}>Start Counting</Text>
          </TouchableOpacity>

          <View style={styles.info}>
            <Text style={styles.label}>Count: {count}</Text>
            <Text style={styles.label}>Target: {targetCount}</Text>
            <Text style={styles.label}>Time Left: {formatTime(timeLeft)}</Text>
          </View>

          {isRunning && (
            <View style={styles.tasbeehContainer}>
              <Text style={styles.tasbeehLabel}>Tap to Count Tasbeeh</Text>
              <Animated.View
                style={[
                  styles.tasbeehButton,
                  {
                    transform: [{ scale: isPressed ? scaleAnim : pulseAnim }],
                    opacity: opacityAnim,
                    backgroundColor: getButtonColor(),
                    shadowOpacity: isPressed ? 0.6 : 0.3,
                    shadowRadius: isPressed ? 8 : 4,
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={incrementCount}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  style={styles.tasbeehTouchable}
                  activeOpacity={1}
                >
                  <Text style={styles.tasbeehCount}>{count}</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}

          {showConfetti && (
            <ConfettiCannon
              count={150}
              origin={{ x: -10, y: 0 }}
              fadeOut={true}
              onAnimationEnd={() => setShowConfetti(false)}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2f3",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  headerGradient: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(75, 0, 130, 0.1)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  headerTextContainer: {
    flexDirection: "column",
    alignItems: "center",
  },
  decorationText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4B0082",
    opacity: 0.8,
  },
  header: {
    fontSize: 16,
    fontWeight: "900",
    color: "#4B0082",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
    marginVertical: 0,
  },
  subHeader: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6a4c93",
    textAlign: "center",
    marginTop: 1,
    fontStyle: "italic",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 12,
    marginTop: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4B0082",
    textAlign: "center",
    marginBottom: 2,
  },
  titleUnderline: {
    height: 2,
    width: "40%",
    backgroundColor: "#4B0082",
    marginTop: 3,
    borderRadius: 1,
  },
  titleSubtext: {
    fontSize: 12,
    fontWeight: "400",
    color: "#6a4c93",
    textAlign: "center",
    marginTop: 3,
    opacity: 0.8,
  },
  input: {
    backgroundColor: "white",
    padding: 10,
    fontSize: 14,
    marginVertical: 5,
    borderRadius: 8,
  },
  startButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 5,
    alignItems: "center",
  },
  startButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  info: {
    alignItems: "center",
    marginVertical: 10,
  },
  label: {
    fontSize: 14,
    marginVertical: 2,
  },
  tasbeehContainer: {
    alignItems: "center",
    marginTop: 15,
    marginBottom: 20,
    minHeight: 150,
  },
  tasbeehLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: "#333",
  },
  tasbeehButton: {
    width: 120,
    height: 120,
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
  tasbeehTouchable: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  tasbeehCount: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 10,
    paddingTop: 5,
  },
});

export default TasbeehCounter;
