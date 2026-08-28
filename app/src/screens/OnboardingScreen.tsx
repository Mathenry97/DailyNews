import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert } from "react-native";
import { TOPIC_META } from "../../../shared/topicMeta";
import type { TopicKey } from "../../../shared/types";
import { supabase } from "../lib/supabase";
import { getDeviceId } from "../lib/device";
import { saveTopics } from "../lib/preferences";

interface Props {
  initialSelection: TopicKey[];
  onDone: (topics: TopicKey[]) => void;
}

export default function OnboardingScreen({ initialSelection, onDone }: Props) {
  const [selected, setSelected] = useState<Set<TopicKey>>(new Set(initialSelection));
  const [saving, setSaving] = useState(false);

  function toggle(key: TopicKey) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleContinue() {
    const topics = Array.from(selected);
    if (topics.length === 0) {
      Alert.alert("Choisis au moins un sujet", "Coche au moins une case pour recevoir un brief.");
      return;
    }

    setSaving(true);
    try {
      const deviceId = await getDeviceId();
      const { error } = await supabase
        .from("app_users")
        .upsert({ device_id: deviceId, topics }, { onConflict: "device_id" });

      if (error) throw error;

      await saveTopics(topics);
      onDone(topics);
    } catch (err) {
      Alert.alert("Erreur", "Impossible d'enregistrer tes préférences. Réessaie.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choisis tes sujets</Text>
      <Text style={styles.subtitle}>Tu recevras chaque jour un brief pour les sujets cochés.</Text>

      <ScrollView contentContainerStyle={styles.list}>
        {TOPIC_META.map((topic) => {
          const checked = selected.has(topic.key);
          return (
            <TouchableOpacity
              key={topic.key}
              style={[styles.row, checked && styles.rowChecked]}
              onPress={() => toggle(topic.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.emoji}>{topic.emoji}</Text>
              <Text style={styles.label}>{topic.label}</Text>
              <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                {checked && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={[styles.button, saving && styles.buttonDisabled]}
        onPress={handleContinue}
        disabled={saving}
      >
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continuer</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 64, paddingHorizontal: 20 },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 20 },
  list: { paddingBottom: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 10,
  },
  rowChecked: { borderColor: "#2563eb", backgroundColor: "#eff6ff" },
  emoji: { fontSize: 20, marginRight: 12 },
  label: { flex: 1, fontSize: 15, color: "#111" },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  checkmark: { color: "#fff", fontSize: 14, fontWeight: "700" },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
