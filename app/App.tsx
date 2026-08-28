import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import type { TopicKey } from "../shared/types";
import { getSavedTopics } from "./src/lib/preferences";
import { getDeviceId } from "./src/lib/device";
import { registerForPushNotificationsAsync } from "./src/lib/pushNotifications";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import BriefScreen from "./src/screens/BriefScreen";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<TopicKey[] | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    getSavedTopics()
      .then(setTopics)
      .finally(() => setLoading(false));
  }, []);

  // Une fois l'utilisateur onboardé (au moins un sujet choisi), on tente
  // d'enregistrer le token push — no-op silencieux sur web/simulateur ou si
  // la permission est refusée.
  useEffect(() => {
    if (!topics || topics.length === 0) return;
    getDeviceId()
      .then(registerForPushNotificationsAsync)
      .catch((err) => console.error("Push registration failed:", err));
  }, [topics]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const needsOnboarding = !topics || topics.length === 0 || editing;

  return (
    <>
      {needsOnboarding ? (
        <OnboardingScreen
          initialSelection={topics ?? []}
          onDone={(selected) => {
            setTopics(selected);
            setEditing(false);
          }}
        />
      ) : (
        <BriefScreen topics={topics!} onEditTopics={() => setEditing(true)} />
      )}
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
});
