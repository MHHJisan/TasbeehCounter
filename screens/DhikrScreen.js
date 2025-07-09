import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  ScrollView,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { StatusBar } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

const DhikrScreen = () => {
  const [count, setCount] = useState(0);
  const [currentDhikr, setCurrentDhikr] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const buttonRotateAnim = useRef(new Animated.Value(0)).current;
  const textScaleAnim = useRef(new Animated.Value(1)).current;
  const confettiRef = useRef(null);
  const headerAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const targetCount = 33;

  const dhikrs = [
    { label: "SubhanAllah", color: "#4caf50" },
    { label: "Alhamdulillah", color: "#2196f3" },
    { label: "Allahu akbar", color: "#f44336" },
  ];

  // Add pulse animation when button is idle
  useEffect(() => {
    if (currentDhikr && !isPressed && count < targetCount) {
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
  }, [currentDhikr, isPressed, count, targetCount]);

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

  const startCounting = (dhikr) => {
    setCurrentDhikr(dhikr);
    setCount(0);
    setShowConfetti(false);
    setIsPressed(false);
  };

  const handlePressIn = () => {
    if (count >= targetCount) return;
    setIsPressed(true);
    // Stop pulse animation when pressed
    pulseAnim.setValue(1);

    // Native animations (scale, opacity, rotation, text scale)
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonRotateAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(textScaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (count >= targetCount) return;
    setIsPressed(false);

    // Native animations
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
      Animated.timing(buttonRotateAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(textScaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const incrementCount = () => {
    if (count < targetCount) {
      setCount(count + 1);
    }
  };

  const getButtonColor = () => {
    if (!currentDhikr) return "#00a86b";
    const progress = count / targetCount;
    if (progress >= 0.8) return "#ff6b6b"; // Red when close to target
    if (progress >= 0.6) return "#ffa726"; // Orange when 60%+ complete
    if (progress >= 0.4) return "#66bb6a"; // Light green when 40%+ complete
    return "#00a86b"; // Default green
  };

  useEffect(() => {
    if (count === targetCount) {
      setShowConfetti(true);

      if (currentDhikr === "Allahu akbar") {
        Alert.alert(
          "MashaAllah!",
          `You've completed Allahu Akbar 33 times!\n\n` +
            "Now recite:\n\n" +
            "🕋 Arabic:\nلَا إِلَـٰهَ إِلَّا ٱللَّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ ٱلْمُلْكُ وَلَهُ ٱلْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ\n\n" +
            "🔤 Transliteration:\nLa ilaha ill-Allah wahdahu la sharika lah, lahu'l-mulk wa lahu'l-hamd wa huwa 'ala kulli shay-in qadir\n\n" +
            "🌍 English Meaning:\nThere is no god but Allah alone. He has no partner. To Him belongs the dominion and all praise. And He is capable of all things.\n\n" +
            "🌐 বাংলা উচ্চারণ:\nলা ইলাহা ইল্লাল্লাহু ওয়াহদাহু লা শারীকালাহু, লাহুল মুলকু ওয়ালাহুল হামদু ওয়া হুয়া আলা কুল্লি শাই'ইন ক্বদীর\n\n" +
            "📘 বাংলা অর্থ:\nআল্লাহ ছাড়া কোনো উপাস্য নেই। তিনি এক ও অদ্বিতীয়। তাঁরই রাজত্ব, তাঁরই সকল প্রশংসা এবং তিনি সব কিছুর উপর সক্ষম।"
        );
      } else {
        Alert.alert("MashaAllah!", `You completed ${currentDhikr} 33 times!`);
      }
    }
  }, [count]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#eef2f3",
        paddingTop: StatusBar.currentHeight || 40,
      }}
    >
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
                      outputRange: [0, 0],
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
                  <Text style={styles.header}>🕌 Dhikr Counter</Text>
                  <Text style={styles.subHeader}>Count Your Remembrance</Text>
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
            <Text style={styles.title}>Choose Your Dhikr</Text>
            <View style={styles.titleUnderline} />
            <Text style={styles.titleSubtext}>
              Begin your spiritual journey
            </Text>
          </Animated.View>

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
                      color:
                        currentDhikr === dhikr.label ? "#fff" : dhikr.color,
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
              <Text style={styles.counterLabel}>
                Tap to Count {currentDhikr}
              </Text>
              <Animated.View
                style={[
                  styles.countButton,
                  {
                    transform: [
                      { scale: isPressed ? scaleAnim : pulseAnim },
                      {
                        rotate: buttonRotateAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "5deg"],
                        }),
                      },
                    ],
                    opacity: opacityAnim,
                    backgroundColor: getButtonColor(),
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={incrementCount}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  style={styles.countTouchable}
                  activeOpacity={1}
                  disabled={count >= targetCount}
                >
                  <Animated.Text
                    style={[
                      styles.countText,
                      {
                        transform: [
                          {
                            scale: textScaleAnim,
                          },
                        ],
                      },
                    ]}
                  >
                    {count}
                  </Animated.Text>
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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 10,
    paddingTop: 2,
  },
  container: {
    flex: 1,
    backgroundColor: "#eef2f3",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 8,
    marginTop: 0,
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
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  dhikrButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  counterContainer: {
    alignItems: "center",
    marginTop: 15,
    marginBottom: 20,
    minHeight: 150,
  },
  counterLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: "#333",
  },
  countButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#00a86b",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  countTouchable: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  countText: {
    fontSize: 48,
    fontWeight: "900",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 1,
  },
  targetText: {
    fontSize: 16,
    color: "#555",
  },
});

export default DhikrScreen;
