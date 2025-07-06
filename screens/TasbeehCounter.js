import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Audio } from "expo-audio";
import ConfettiCannon from "react-native-confetti-cannon";
import {
  useSafeAreaInsets,
  SafeAreaView,
} from "react-native-safe-area-context";

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
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
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
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#eef2f3" }}>
      <View style={[styles.container, { paddingBottom: insets.bottom + 20 }]}>
        <Text style={styles.header}>Tasbeeh Counter with Alarm</Text>
        <Text style={styles.title}>Set Your Tasbeeh Goal</Text>

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
          style={[styles.startButton, isRunning && { backgroundColor: "#ccc" }]}
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
                  transform: [
                    { scale: Animated.multiply(scaleAnim, pulseAnim) },
                  ],
                  opacity: opacityAnim,
                  backgroundColor: getButtonColor(),
                  shadowOpacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0.6],
                  }),
                  shadowRadius: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [4, 8],
                  }),
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2f3",
    // paddingTop: 20,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    color: "#4B0082",
    textAlign: "center",
    // marginTop: 20,
    marginBottom: 20,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginVertical: 10,
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
  startButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  info: {
    alignItems: "center",
    marginVertical: 20,
  },
  label: {
    fontSize: 18,
    marginVertical: 5,
  },
  tasbeehContainer: {
    alignItems: "center",
    marginTop: 10,
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
});

export default TasbeehCounter;
