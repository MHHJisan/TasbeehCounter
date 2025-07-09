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
    arabic: "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ",
    transliteration: "Rabbi ighfir li wa tub ‘alayya",
    meaning: "My Lord, forgive me and accept my repentance.",
  },
  {
    arabic:
      "لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
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
      "اللَّهُمَّ أَنْتَ رَبِّي، لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    transliteration:
      "Allahumma Anta Rabbi, la ilaha illa Anta, khalaqtani wa ana ‘abduka, wa ana ‘ala ‘ahdika wa wa’dika mastata’tu, a’udhu bika min sharri ma sana’tu, abu’u laka bini’matika ‘alayya, wa abu’u bidhanbi, faghfir li fa innahu la yaghfirudh-dhunuba illa Anta.",
    meaning:
      "O Allah! You are my Lord. There is no true deity except You. You created me and I am Your servant, and I am on Your covenant and promise as much as I can. I seek refuge in You from the evil of what I have done. I acknowledge Your blessings upon me and I confess my sins to You. So forgive me, for surely no one can forgive sins except You.",
  },
];

const IstighfarScreen = () => {
  const [count, setCount] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [weeklyHistory, setWeeklyHistory] = useState([]);

  const selectedIstighfar = ISTIGHFAR_DATA[selectedIndex];

  useEffect(() => {
    checkAndResetCount();
    loadWeeklyHistory();
  }, []);

  useEffect(() => {
    saveCount();
  }, [count]);

  const checkAndResetCount = async () => {
    const today = moment().format("YYYY-MM-DD");
    const savedDate = await AsyncStorage.getItem(DATE_KEY);

    if (savedDate !== today) {
      await AsyncStorage.setItem(DATE_KEY, today);
      await AsyncStorage.setItem(STORAGE_KEY, "0");
      setCount(0);
    } else {
      const savedCount = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedCount !== null) setCount(parseInt(savedCount));
    }
  };

  const saveCount = async () => {
    const today = moment().format("YYYY-MM-DD");
    await AsyncStorage.setItem(STORAGE_KEY, count.toString());
    await AsyncStorage.setItem(`@istighfar_count_${today}`, count.toString());
  };

  const loadWeeklyHistory = async () => {
    const history = [];
    for (let i = 6; i >= 0; i--) {
      const date = moment().subtract(i, "days").format("YYYY-MM-DD");
      const stored = await AsyncStorage.getItem(`@istighfar_count_${date}`);
      history.push({ date, count: stored ? parseInt(stored) : 0 });
    }
    setWeeklyHistory(history);
  };

  const incrementCount = () => {
    setCount((prev) => prev + 1);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.subtext}>🤲 Daily Istighfar Counter</Text>

      <View style={styles.duaBox}>
        <Text style={styles.arabic}>{selectedIstighfar.arabic}</Text>
        <Text style={styles.transliteration}>
          {selectedIstighfar.transliteration}
        </Text>
        <Text style={styles.meaning}>{selectedIstighfar.meaning}</Text>
      </View>

      <TouchableOpacity onPress={incrementCount} style={styles.counterButton}>
        <Text style={styles.counterText}>{count}</Text>
      </TouchableOpacity>

      <View style={styles.selectorRow}>
        {ISTIGHFAR_DATA.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.selectorButton,
              selectedIndex === index && styles.selectorActive,
            ]}
            onPress={() => setSelectedIndex(index)}
          >
            <Text
              style={[
                styles.selectorText,
                selectedIndex === index && styles.selectorTextActive,
              ]}
            >
              {index + 1}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.historyBox}>
        <Text style={styles.historyTitle}>📊 Weekly Istighfar Summary</Text>
        {weeklyHistory.map((item, index) => (
          <Text key={index} style={styles.historyText}>
            {moment(item.date).format("ddd, MMM D")}: {item.count}
          </Text>
        ))}
      </View>

      <Text style={styles.note}>
        Counter resets daily at 12:00 AM. Keep seeking Allah's forgiveness.
      </Text>
    </ScrollView>
  );
};

export default IstighfarScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#eef2f3",
    padding: 20,
    flex: 1,
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
  },
  counterButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#0284c7",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginVertical: 15,
  },
  counterText: {
    fontSize: 50,
    fontWeight: "bold",
    color: "#fff",
  },
  selectorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  selectorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#cbd5e1",
    justifyContent: "center",
    alignItems: "center",
    margin: 6,
  },
  selectorActive: {
    backgroundColor: "#1e40af",
  },
  selectorText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  selectorTextActive: {
    color: "#fff",
  },
  historyBox: {
    marginTop: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1f2937",
  },
  historyText: {
    fontSize: 14,
    color: "#374151",
    paddingVertical: 2,
  },
  note: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    paddingTop: 20,
  },
});
