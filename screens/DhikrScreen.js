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
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";

const DhikrScreen = () => {
  const [count, setCount] = useState(0);
  const [currentDhikrIndex, setCurrentDhikrIndex] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [completedDhikrs, setCompletedDhikrs] = useState([]);
  const [totalCompletions, setTotalCompletions] = useState(0);
  const [weeklyCompletions, setWeeklyCompletions] = useState(0);
  const [showWeeklyStats, setShowWeeklyStats] = useState(false);
  const [cycleHistory, setCycleHistory] = useState([]);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const buttonRotateAnim = useRef(new Animated.Value(0)).current;
  const textScaleAnim = useRef(new Animated.Value(1)).current;
  const confettiRef = useRef(null);
  const headerAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const targetCount = 33;
  const COMPLETION_STORAGE_KEY = "@dhikr_completions";

  const dhikrs = [
    { label: "SubhanAllah", color: "#4caf50" },
    { label: "Alhamdulillah", color: "#2196f3" },
    { label: "Allahu akbar", color: "#f44336" },
  ];

  // Get current dhikr based on index
  const currentDhikr =
    currentDhikrIndex !== null ? dhikrs[currentDhikrIndex] : null;

  // Load saved data on mount
  useEffect(() => {
    loadCompletions();
  }, []);

  const loadCompletions = async () => {
    try {
      const savedData = await AsyncStorage.getItem(COMPLETION_STORAGE_KEY);
      if (savedData) {
        const { completions, history } = JSON.parse(savedData);
        setTotalCompletions(completions || 0);
        setCycleHistory(history || []);
        calculateWeeklyCompletions(history || []);
      }
    } catch (error) {
      console.error("Failed to load completions:", error);
    }
  };

  const saveCompletions = async () => {
    try {
      const data = JSON.stringify({
        completions: totalCompletions,
        history: cycleHistory,
      });
      await AsyncStorage.setItem(COMPLETION_STORAGE_KEY, data);
    } catch (error) {
      console.error("Failed to save completions:", error);
    }
  };

  const calculateWeeklyCompletions = (history) => {
    const oneWeekAgo = moment().subtract(7, "days");
    const recentCompletions = history.filter((entry) =>
      moment(entry.date).isAfter(oneWeekAgo)
    );
    setWeeklyCompletions(recentCompletions.length);
  };

  // Add pulse animation when button is idle
  useEffect(() => {
    if (currentDhikrIndex !== null && !isPressed && count < targetCount) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [currentDhikrIndex, isPressed, count, targetCount]);

  // Header entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Start counting a specific dhikr
  const startCounting = (index) => {
    // Prevent switching if current dhikr isn't completed
    if (currentDhikrIndex !== null && count < targetCount) {
      return;
    }

    setCurrentDhikrIndex(index);
    setCount(0);
    setShowConfetti(false);
    setIsPressed(false);

    // Reset progress animation
    progressAnim.setValue(0);
  };

  // Handle press in animation
  const handlePressIn = () => {
    if (count >= targetCount) return;
    setIsPressed(true);
    pulseAnim.setValue(1);

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonRotateAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(textScaleAnim, {
        toValue: 1.08,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle press out animation
  const handlePressOut = () => {
    if (count >= targetCount) return;
    setIsPressed(false);

    Animated.parallel([
      Animated.timing(scaleAnim, {
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

  // Increment the count
  const incrementCount = () => {
    if (count < targetCount) {
      const newCount = count + 1;
      setCount(newCount);

      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: newCount / targetCount,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  // Get button color based on progress
  const getButtonColor = () => {
    if (!currentDhikr) return "#8d6e63";
    const progress = count / targetCount;
    if (progress >= 0.8) return "#795548";
    if (progress >= 0.6) return "#a1887f";
    if (progress >= 0.4) return "#bcaaa4";
    return "#d7ccc8";
  };

  // Record a completed cycle
  const recordCompletion = () => {
    const newTotal = totalCompletions + 1;
    setTotalCompletions(newTotal);

    const newEntry = {
      date: moment().format(),
      dhikrs: dhikrs.map((d) => d.label),
    };

    const updatedHistory = [...cycleHistory, newEntry];
    setCycleHistory(updatedHistory);
    calculateWeeklyCompletions(updatedHistory);

    // Save to storage
    saveCompletions();
  };

  // Reset current session
  const resetSession = () => {
    setCurrentDhikrIndex(null);
    setCount(0);
    setCompletedDhikrs([]);
    setShowConfetti(false);
  };

  // Check if dhikr is completed and advance to next
  useEffect(() => {
    if (count === targetCount && currentDhikrIndex !== null) {
      // Mark this dhikr as completed
      const completed = [...completedDhikrs, currentDhikrIndex];
      setCompletedDhikrs(completed);

      // Check if all dhikrs are completed
      if (completed.length === dhikrs.length) {
        recordCompletion();
        setShowConfetti(true);

        // Automatically reset after 2 seconds
        setTimeout(() => {
          resetSession();
        }, 2000);
      } else {
        // Automatically advance to next dhikr after a delay
        setTimeout(() => {
          const nextIndex = (currentDhikrIndex + 1) % dhikrs.length;
          startCounting(nextIndex);
        }, 1000);
      }

      // Show special alert only for Allahu akbar
      if (currentDhikr.label === "Allahu akbar") {
        setTimeout(() => {
          Alert.alert(
            "MashaAllah!",
            `You've completed after prayer dhikr cycle!\n\n` +
              "Now recite:\n\n" +
              "🕋 Arabic:\nلَا إِلَـٰهَ إِلَّا ٱللَّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ ٱلْمُلْكُ وَلَهُ ٱلْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ\n\n" +
              "🔤 Transliteration:\nLa ilaha ill-Allah wahdahu la sharika lah, lahu'l-mulk wa lahu'l-hamd wa huwa 'ala kulli shay-in qadir\n\n" +
              "🌍 English Meaning:\nThere is no god but Allah alone. He has no partner. To Him belongs the dominion and all praise. And He is capable of all things.\n\n" +
              "🌐 বাংলা উচ্চারণ:\nলা ইলাহা ইল্লাল্লাহু ওয়াহদাহু লা শারীকালাহু, লাহুল মুলকু ওয়ালাহুল হামদু ওয়া হুয়া আলা কুল্লি শাই'ইন ক্বদীর\n\n" +
              "📘 বাংলা অর্থ:\nআল্লাহ ছাড়া কোনো উপাস্য নেই। তিনি এক ও অদ্বিতীয়। তাঁরই রাজত্ব, তাঁরই সকল প্রশংসা এবং তিনি সব কিছুর উপর সক্ষম।"
          );
        }, 500);
      }
    }
  }, [count, currentDhikrIndex]);

  // Toggle stats view animation
  useEffect(() => {
    Animated.timing(statsAnim, {
      toValue: showWeeklyStats ? 1 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [showWeeklyStats]);

  const toggleStatsView = () => {
    setShowWeeklyStats(!showWeeklyStats);
  };

  // Determine if a dhikr button should be enabled
  const isDhikrEnabled = (index) => {
    // If no dhikr is active, all are enabled to start
    if (currentDhikrIndex === null) return true;

    // If current dhikr is completed, next one is enabled
    if (count >= targetCount && index === currentDhikrIndex + 1) return true;

    // Current active dhikr is always enabled
    if (index === currentDhikrIndex) return true;

    // Completed dhikrs are disabled
    if (completedDhikrs.includes(index)) return false;

    // Otherwise disabled
    return false;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerDecoration} />
        <Text style={styles.headerText}>Dhikr Counter</Text>
        <View style={styles.headerDecoration} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleAnim,
              transform: [
                {
                  translateY: titleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.title}>Choose Your Dhikr</Text>
          <View style={styles.divider} />
          <Text style={styles.subtitle}>Complete them in sequence</Text>
        </Animated.View>

        <View style={styles.buttonsContainer}>
          {dhikrs.map((dhikr, index) => (
            <TouchableOpacity
              key={dhikr.label}
              onPress={() => startCounting(index)}
              style={[
                styles.dhikrButton,
                {
                  borderColor: completedDhikrs.includes(index)
                    ? "#4CAF50"
                    : currentDhikrIndex === index
                    ? dhikr.color
                    : "#d7ccc8",
                  backgroundColor: completedDhikrs.includes(index)
                    ? "#E8F5E9"
                    : "#efebe9",
                  opacity: isDhikrEnabled(index) ? 1 : 0.6,
                },
              ]}
              activeOpacity={0.8}
              disabled={!isDhikrEnabled(index)}
            >
              <View style={styles.buttonContent}>
                <Text
                  style={[
                    styles.buttonText,
                    {
                      color: completedDhikrs.includes(index)
                        ? "#388E3C"
                        : currentDhikrIndex === index
                        ? dhikr.color
                        : "#5d4037",
                    },
                  ]}
                >
                  {dhikr.label}
                </Text>
                {completedDhikrs.includes(index) && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#388E3C"
                    style={styles.checkIcon}
                  />
                )}
                {!isDhikrEnabled(index) && !completedDhikrs.includes(index) && (
                  <Ionicons
                    name="lock-closed"
                    size={16}
                    color="#b71c1c"
                    style={styles.lockIcon}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {currentDhikrIndex !== null && (
          <View style={styles.counterContainer}>
            <View style={styles.dhikrHeader}>
              <Text style={styles.counterLabel}>
                Reciting: {currentDhikr.label}
              </Text>
              <Text style={styles.sequenceText}>
                {currentDhikrIndex + 1} of {dhikrs.length}
              </Text>
            </View>

            <Animated.View
              style={[
                styles.countButton,
                {
                  transform: [
                    { scale: isPressed ? scaleAnim : pulseAnim },
                    {
                      rotate: buttonRotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "3deg"],
                      }),
                    },
                  ],
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
                      transform: [{ scale: textScaleAnim }],
                    },
                  ]}
                >
                  {count}
                </Animated.Text>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.targetContainer}>
              <Text style={styles.targetText}>Goal: {targetCount} times</Text>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }),
                      backgroundColor: currentDhikr.color,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        )}

        {/* Completion Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statsHeader}>
            <Text style={styles.statsTitle}>Cycle Completion</Text>
            <TouchableOpacity
              onPress={toggleStatsView}
              style={styles.toggleButton}
            >
              <Text style={styles.toggleText}>
                {showWeeklyStats ? "Show Total" : "Show Weekly"}
              </Text>
            </TouchableOpacity>
          </View>

          <Animated.View
            style={[
              styles.statsContent,
              {
                opacity: statsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1],
                }),
                transform: [
                  {
                    translateY: statsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {showWeeklyStats ? (
              <Text style={styles.statsValue}>
                This Week: {weeklyCompletions}
              </Text>
            ) : (
              <Text style={styles.statsValue}>Total: {totalCompletions}</Text>
            )}

            {totalCompletions > 0 && (
              <View style={styles.historyContainer}>
                <Text style={styles.historyTitle}>Recent Completions:</Text>
                {cycleHistory.slice(0, 3).map((entry, index) => (
                  <Text key={index} style={styles.historyEntry}>
                    {moment(entry.date).format("MMM D, h:mm a")}
                  </Text>
                ))}
              </View>
            )}
          </Animated.View>
        </View>

        {showConfetti && (
          <ConfettiCannon
            count={200}
            origin={{ x: -10, y: 0 }}
            fadeOut={true}
            autoStart={true}
            onAnimationEnd={() => setShowConfetti(false)}
            ref={confettiRef}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5d4037",
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
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
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#5d4037",
    fontFamily: "serif",
  },
  subtitle: {
    fontSize: 16,
    color: "#795548",
    marginTop: 5,
    fontStyle: "italic",
  },
  divider: {
    height: 2,
    width: 80,
    backgroundColor: "#8d6e63",
    marginVertical: 10,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  dhikrButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 10,
    borderWidth: 2,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    borderRadius: 8,
  },
  checkIcon: {
    marginLeft: 5,
  },
  lockIcon: {
    marginLeft: 5,
  },
  counterContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
    padding: 25,
    backgroundColor: "#fff",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  dhikrHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  counterLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#5d4037",
  },
  sequenceText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#795548",
    fontStyle: "italic",
  },
  countButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: "#efebe9",
  },
  countTouchable: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  countText: {
    fontSize: 50,
    fontWeight: "800",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  targetContainer: {
    marginTop: 25,
    width: "100%",
    alignItems: "center",
  },
  targetText: {
    fontSize: 16,
    color: "#5d4037",
    marginBottom: 8,
    fontWeight: "500",
  },
  progressBar: {
    height: 10,
    width: "80%",
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },
  statsContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5d4037",
  },
  toggleButton: {
    backgroundColor: "#d7ccc8",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5d4037",
  },
  statsContent: {
    alignItems: "center",
  },
  statsValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#5d4037",
    marginVertical: 10,
  },
  historyContainer: {
    marginTop: 15,
    width: "100%",
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#795548",
    marginBottom: 8,
    textAlign: "center",
  },
  historyEntry: {
    fontSize: 14,
    color: "#8d6e63",
    textAlign: "center",
    paddingVertical: 3,
    fontStyle: "italic",
  },
});

export default DhikrScreen;
