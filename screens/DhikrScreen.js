import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

const DhikrScreen = () => {
  const [count, setCount] = useState(0);
  const [currentDhikr, setCurrentDhikr] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const confettiRef = useRef(null);

  const targetCount = 33;

  const dhikrs = [
    { label: "SubhanAllah", color: "#4caf50" },
    { label: "Alhamdulillah", color: "#2196f3" },
    { label: "Allahu akbar", color: "#f44336" },
  ];

  const startCounting = (dhikr) => {
    setCurrentDhikr(dhikr);
    setCount(0);
    setShowConfetti(false);
  };

  const incrementCount = () => {
    if (count < targetCount) {
      // Animate button scale on tap
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.85,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      setCount(count + 1);
    }
  };

  useEffect(() => {
    if (count === targetCount) {
      setShowConfetti(true);
      Alert.alert("Mashallah!", `You completed ${currentDhikr} 33 times!`);
    }
  }, [count]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dhikr Counter</Text>

      <View style={styles.buttonsRow}>
        {dhikrs.map((dhikr) => (
          <TouchableOpacity
            key={dhikr.label}
            onPress={() => startCounting(dhikr.label)}
            style={[
              styles.dhikrButton,
              {
                backgroundColor:
                  currentDhikr === dhikr.label ? dhikr.color : "#ddd",
                borderColor: dhikr.color,
              },
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.buttonText,
                {
                  color: currentDhikr === dhikr.label ? "#fff" : dhikr.color,
                  fontWeight: currentDhikr === dhikr.label ? "700" : "500",
                },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >
              {dhikr.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {currentDhikr && (
        <View style={styles.counterContainer}>
          <Text style={styles.counterLabel}>{currentDhikr}</Text>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[
                styles.countButton,
                count >= targetCount && { backgroundColor: "#bbb" },
              ]}
              onPress={incrementCount}
              disabled={count >= targetCount}
              activeOpacity={0.7}
            >
              <Text style={styles.countText}>{count}</Text>
            </TouchableOpacity>
          </Animated.View>
          <Text style={styles.targetText}>Goal: {targetCount} times</Text>
        </View>
      )}

      {showConfetti && (
        <ConfettiCannon
          count={150}
          origin={{ x: -10, y: 0 }}
          fadeOut={true}
          autoStart={true}
          onAnimationEnd={() => setShowConfetti(false)}
          ref={confettiRef}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#eef2f3",
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#4B0082",
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap", // allow wrapping on small screens
    gap: 10, // use margin if gap isn't supported
    marginBottom: 40,
  },
  dhikrButton: {
    flex: 1, // allows buttons to take equal width
    marginHorizontal: 5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 2,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  counterContainer: {
    alignItems: "center",
  },
  counterLabel: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 15,
    color: "#333",
  },
  countButton: {
    backgroundColor: "#00a86b",
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
    marginBottom: 20,
  },
  countText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
  },
  targetText: {
    fontSize: 18,
    color: "#555",
  },
});

export default DhikrScreen;
