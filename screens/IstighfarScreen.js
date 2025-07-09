import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";

const STORAGE_KEY = "@istighfar_count";
const DATE_KEY = "@istighfar_date";
const YESTERDAY_KEY = "@istighfar_yesterday_count";

const ISTIGHFAR_DATA = [
  {
    arabic: "أستغفر الله",
    transliteration: "Astaghfirullah",
    meaning: "I seek forgiveness from Allah.",
  },
  {
    arabic: "أستغفر الله وأتوب إليه",
    transliteration: "Astaghfirullah wa atubu ilayh",
    meaning: "I seek forgiveness from Allah and turn to Him in repentance.",
  },
  {
    arabic: "أستغفر الله ربي من كل ذنب وأتوب إليه",
    transliteration: "Astaghfirullah Rabbi min kulli dhambin wa atubu ilayh",
    meaning:
      "I seek forgiveness from Allah, my Lord, for every sin and I repent to Him.",
  },
  {
    arabic: "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ",
    transliteration: "Rabbi ighfir li wa tub ‘alayya",
    meaning: "My Lord, forgive me and accept my repentance.",
  },
  {
    arabic:
      "لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
    transliteration: "La ilaha illa Anta, subhanaka inni kuntu minaz-zalimin",
    meaning:
      "There is no deity but You; glory be to You, I was indeed among the wrongdoers.",
  },
  {
    arabic: "أستغفر الله الذي لا إله إلا هو الحي القيوم وأتوب إليه",
    transliteration:
      "Astaghfirullaha alladhi la ilaha illa huwa al-hayyul qayyoom wa atubu ilayh",
    meaning:
      "I seek forgiveness from Allah, there is no god but He, the Ever-Living, the Sustainer, and I repent to Him.",
  },
  {
    arabic:
      "اللَّهُمَّ أَنْتَ رَبِّي، لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    transliteration:
      "Allahumma Anta Rabbi, la ilaha illa Anta, khalaqtani wa ana ‘abduka, wa ana ‘ala ‘ahdika wa wa’dika mastata’tu, a’udhu bika min sharri ma sana’tu, abu’u laka bini’matika ‘alayya, wa abu’u bidhanbi, faghfir li fa innahu la yaghfirudh-dhunuba illa Anta.",
    meaning:
      "O Allah! You are my Lord. There is no true deity except You. You created me and I am Your servant, and I am on Your covenant and promise as much as I can...",
  },
];

const IstighfarScreen = () => {
  const [count, setCount] = useState(0);
  const [previousCount, setPreviousCount] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentDate, setCurrentDate] = useState(moment().format("YYYY-MM-DD"));

  const selectedIstighfar = ISTIGHFAR_DATA[selectedIndex];

  useEffect(() => {
    initializeCount();
    const interval = setInterval(checkDateChange, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    saveCount();
  }, [count]);

  const initializeCount = async () => {
    const savedDate = await AsyncStorage.getItem(DATE_KEY);
    const today = moment().format("YYYY-MM-DD");

    if (savedDate !== today) {
      await handleDateChange();
    } else {
      const savedCount = await AsyncStorage.getItem(STORAGE_KEY);
      const savedYesterday = await AsyncStorage.getItem(YESTERDAY_KEY);
      if (savedCount !== null) setCount(parseInt(savedCount));
      if (savedYesterday !== null) setPreviousCount(parseInt(savedYesterday));
    }
  };

  const checkDateChange = async () => {
    const today = moment().format("YYYY-MM-DD");
    if (today !== currentDate) {
      setCurrentDate(today);
      await handleDateChange();
    }
  };

  const handleDateChange = async () => {
    const savedCount = await AsyncStorage.getItem(STORAGE_KEY);
    await AsyncStorage.setItem(DATE_KEY, moment().format("YYYY-MM-DD"));
    await AsyncStorage.setItem(YESTERDAY_KEY, savedCount || "0");
    await AsyncStorage.setItem(STORAGE_KEY, "0");
    setPreviousCount(parseInt(savedCount) || 0);
    setCount(0);
  };

  const saveCount = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, count.toString());
  };

  const incrementCount = () => {
    setCount((prev) => prev + 1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subtext}>🤲 Daily Istighfar Counter</Text>

      <ScrollView style={styles.duaBox}>
        <Text style={styles.arabic}>{selectedIstighfar.arabic}</Text>
        <Text style={styles.transliteration}>
          {selectedIstighfar.transliteration}
        </Text>
        <Text style={styles.meaning}>{selectedIstighfar.meaning}</Text>
      </ScrollView>

      <TouchableOpacity onPress={incrementCount} style={styles.counterButton}>
        <Text style={styles.counterText}>{count}</Text>
      </TouchableOpacity>

      <Text style={styles.yesterday}>
        Yesterday’s Count:{" "}
        <Text style={{ fontWeight: "bold" }}>{previousCount}</Text>
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

      <Text style={styles.note}>
        ✨ Counter resets daily at 12:00 AM. Keep seeking Allah’s forgiveness
        (Astaghfirullah)!
      </Text>
    </View>
  );
};

export default IstighfarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2f3",
    paddingTop: 20,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  subtext: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e3a8a",
    marginBottom: 20,
    backgroundColor: "#dbeafe",
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 14,
    textAlign: "center",
  },
  duaBox: {
    maxHeight: 220,
    width: "100%",
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
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
  },
  counterText: {
    fontSize: 50,
    fontWeight: "bold",
    color: "#fff",
  },
  yesterday: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 10,
  },
  selectorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  istighfarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#cbd5e1",
    justifyContent: "center",
    alignItems: "center",
    margin: 6,
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
  note: {
    marginTop: 25,
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    paddingHorizontal: 15,
  },
});
