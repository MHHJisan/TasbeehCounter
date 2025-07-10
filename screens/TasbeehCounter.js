import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Animated,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";
import { StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ConfettiCannon from "react-native-confetti-cannon";

const dhikrs = [
  {
    label: "SubhanAllah",
    value: "subhanallah",
    arabic: "سُبْحَانَ اللَّهِ",
    transliteration: "Subḥān Allāh",
    english: "Glory be to Allah",
  },
  {
    label: "Alhamdulillah",
    value: "alhamdulillah",
    arabic: "الْحَمْدُ لِلَّهِ",
    transliteration: "Al-ḥamdu lillāh",
    english: "Praise be to Allah",
  },
  {
    label: "Allahu Akbar",
    value: "allahu_akbar",
    arabic: "اللَّهُ أَكْبَر",
    transliteration: "Allāhu Akbar",
    english: "Allah is the Greatest",
  },
  {
    label: "La ilaha illallah",
    value: "la_ilaha_illallah",
    arabic: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ",
    transliteration: "Lā ilāha illa llāh",
    english: "There is no god but Allah",
  },
  {
    label: "Astaghfirullah",
    value: "astaghfirullah",
    arabic: "أَسْتَغْفِرُ ٱللَّٰه",
    transliteration: "Astaghfirullāh",
    english: "I seek forgiveness from Allah",
  },
];

const TasbeehCounter = () => {
  const [targetCount, setTargetCount] = useState("100");
  const [count, setCount] = useState(0);
  const [selectedDhikr, setSelectedDhikr] = useState(dhikrs[0]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [showDhikrModal, setShowDhikrModal] = useState(false);
  const [editingTarget, setEditingTarget] = useState(false);
  const [reachedTarget, setReachedTarget] = useState(false);

  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const buttonRotateAnim = useRef(new Animated.Value(0)).current;
  const textScaleAnim = useRef(new Animated.Value(1)).current;
  const counterAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (count > 0 && !reachedTarget) {
      Animated.timing(counterAnim, {
        toValue: count,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    const targetNum = parseInt(targetCount, 10) || 0;
    if (count >= targetNum && targetNum > 0) {
      setReachedTarget(true);
      setShowConfetti(true);
      Alert.alert(
        "MashaAllah!",
        `You've completed ${selectedDhikr.label} ${targetNum} times!`
      );
    }
  }, [count]);

  useEffect(() => {
    if (editingTarget) {
      setCount(0);
      setReachedTarget(false);
    }
  }, [targetCount]);

  useEffect(() => {
    if (!isPressed) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
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
  }, [isPressed]);

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

  const getButtonColor = () => {
    const targetNum = parseInt(targetCount, 10) || 100;
    const progress = count / targetNum;
    if (progress >= 0.8) return "#795548";
    if (progress >= 0.6) return "#a1887f";
    if (progress >= 0.4) return "#bcaaa4";
    return "#d7ccc8";
  };

  const handlePressIn = () => {
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

  const handlePressOut = () => {
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

  const incrementCount = () => {
    setCount((prev) => prev + 1);
  };

  const resetCounter = () => {
    setCount(0);
    setReachedTarget(false);
    setShowConfetti(false);
  };

  const handleDhikrSelect = (dhikr) => {
    setSelectedDhikr(dhikr);
    setShowDhikrModal(false);
    resetCounter();
  };

  const handleTargetPress = () => {
    setEditingTarget(true);
  };

  const handleTargetSubmit = () => {
    setEditingTarget(false);
    resetCounter();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerDecoration} />
        <Text style={styles.headerText}>Tasbeeh Counter</Text>
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
          <Text style={styles.title}>Count Your Blessings</Text>
          <View style={styles.divider} />
          <Text style={styles.subtitle}>Select Dhikr and Count</Text>
        </Animated.View>

        {/* Large Counter Display */}
        <View style={styles.counterDisplay}>
          <Animated.Text
            style={[
              styles.counterText,
              {
                transform: [
                  {
                    scale: counterAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: [1, 1.2],
                      extrapolate: "clamp",
                    }),
                  },
                ],
              },
            ]}
          >
            {count}
          </Animated.Text>

          <TouchableOpacity onPress={handleTargetPress}>
            {editingTarget ? (
              <TextInput
                value={targetCount}
                onChangeText={setTargetCount}
                keyboardType="numeric"
                style={styles.targetInput}
                autoFocus={true}
                onSubmitEditing={handleTargetSubmit}
                onBlur={handleTargetSubmit}
              />
            ) : (
              <Text style={styles.targetText}>Target: {targetCount}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Dhikr Selection */}
        <TouchableOpacity
          style={styles.dhikrSelector}
          onPress={() => setShowDhikrModal(true)}
        >
          <View style={styles.dhikrTextContainer}>
            <Text style={styles.arabicText}>{selectedDhikr.arabic}</Text>
            <Text style={styles.transliterationText}>
              {selectedDhikr.transliteration}
            </Text>
            <Text style={styles.englishText}>{selectedDhikr.english}</Text>
          </View>
          <Ionicons name="chevron-down" size={24} color="#5d4037" />
        </TouchableOpacity>

        {/* Count Button with Reset and Summary Icons */}
        <View style={styles.countButtonRow}>
          {/* Reset Icon */}
          <TouchableOpacity
            onPress={resetCounter}
            style={styles.iconButton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Ionicons name="refresh" size={32} color="#5d4037" />
          </TouchableOpacity>

          {/* Count Button */}
          <View style={styles.countButtonContainer}>
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
              >
                <Text style={styles.buttonIcon}>+1</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Summary Icon */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() =>
              Alert.alert(
                "Dhikr Summary",
                `You've completed ${count} ${selectedDhikr.label}\nTarget: ${targetCount}`
              )
            }
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Ionicons name="stats-chart" size={32} color="#5d4037" />
          </TouchableOpacity>
        </View>

        {/* Tap to Count Label */}
        <Text style={styles.countLabel}>Tap to Count</Text>

        {showConfetti && (
          <ConfettiCannon
            count={200}
            origin={{ x: -10, y: 0 }}
            fadeOut={true}
            autoStart={true}
            onAnimationEnd={() => setShowConfetti(false)}
          />
        )}
      </ScrollView>

      {/* Dhikr Selection Modal */}
      <Modal
        visible={showDhikrModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDhikrModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Dhikr</Text>
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              {dhikrs.map((dhikr) => (
                <TouchableOpacity
                  key={dhikr.value}
                  style={[
                    styles.dhikrOption,
                    selectedDhikr.value === dhikr.value &&
                      styles.selectedOption,
                  ]}
                  onPress={() => handleDhikrSelect(dhikr)}
                >
                  <Text style={styles.arabicText}>{dhikr.arabic}</Text>
                  <Text style={styles.transliterationText}>
                    {dhikr.transliteration}
                  </Text>
                  <Text style={styles.englishText}>{dhikr.english}</Text>
                  {selectedDhikr.value === dhikr.value && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#5d4037"
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDhikrModal(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    alignItems: "center",
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
  counterDisplay: {
    alignItems: "center",
    marginVertical: 20,
  },
  counterText: {
    fontSize: 72,
    fontWeight: "800",
    color: "#5d4037",
    marginBottom: 10,
  },
  targetText: {
    fontSize: 18,
    color: "#795548",
    padding: 8,
    borderRadius: 5,
    backgroundColor: "#efebe9",
  },
  targetInput: {
    fontSize: 18,
    color: "#795548",
    padding: 8,
    borderRadius: 5,
    backgroundColor: "#efebe9",
    minWidth: 80,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#5d4037",
  },
  dhikrSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#efebe9",
    padding: 15,
    borderRadius: 10,
    width: "90%",
    borderWidth: 1,
    borderColor: "#d7ccc8",
    marginBottom: 25,
  },
  dhikrTextContainer: {
    flex: 1,
  },
  arabicText: {
    fontSize: 22,
    textAlign: "center",
    color: "#5d4037",
    marginBottom: 5,
    fontFamily: "Traditional Arabic",
  },
  transliterationText: {
    fontSize: 16,
    textAlign: "center",
    color: "#795548",
    fontStyle: "italic",
    marginBottom: 3,
  },
  englishText: {
    fontSize: 14,
    textAlign: "center",
    color: "#8d6e63",
  },
  countButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%",
    marginTop: 20,
    marginBottom: 10,
  },
  iconButton: {
    padding: 10,
  },
  countButtonContainer: {
    alignItems: "center",
  },
  countLabel: {
    fontSize: 18,
    color: "#5d4037",
    marginTop: 10,
    marginBottom: 15,
  },
  countButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
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
  buttonIcon: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  modalScrollContent: {
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#5d4037",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "serif",
  },
  dhikrOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    alignItems: "center",
    marginBottom: 10,
    borderRadius: 8,
  },
  selectedOption: {
    backgroundColor: "#f5f5f5",
    borderColor: "#5d4037",
    borderWidth: 1,
  },
  checkIcon: {
    marginTop: 10,
  },
  closeButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "#5d4037",
    borderRadius: 8,
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default TasbeehCounter;
