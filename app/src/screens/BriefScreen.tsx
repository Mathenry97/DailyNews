import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TOPIC_META } from "../../../shared/topicMeta";
import type { TopicBlock, TopicKey } from "../../../shared/types";
import { supabase } from "../lib/supabase";

interface Props {
  topics: TopicKey[];
  onEditTopics: () => void;
}

interface DbRow {
  topic: TopicKey;
  date: string;
  generated_at: string;
  is_empty: boolean;
  empty_reason: string | null;
  bullets: TopicBlock["bullets"];
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function BriefScreen({ topics, onEditTopics }: Props) {
  const [blocks, setBlocks] = useState<DbRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErrorMsg(null);
    const { data, error } = await supabase
      .from("topic_blocks")
      .select("topic, date, generated_at, is_empty, empty_reason, bullets")
      .eq("date", todayISO())
      .in("topic", topics);

    if (error) {
      setErrorMsg("Impossible de charger le brief du jour.");
      console.error(error);
      return;
    }

    const order = new Map(topics.map((t, i) => [t, i]));
    const sorted = [...(data ?? [])].sort((a, b) => (order.get(a.topic) ?? 0) - (order.get(b.topic) ?? 0));
    setBlocks(sorted);
  }, [topics]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Le brief du jour</Text>
        <TouchableOpacity onPress={onEditTopics}>
          <Text style={styles.editLink}>Mes sujets</Text>
        </TouchableOpacity>
      </View>

      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}

      {!errorMsg && blocks?.length === 0 && (
        <Text style={styles.empty}>Rien à afficher pour l'instant — reviens un peu plus tard.</Text>
      )}

      {blocks?.map((block) => {
        const meta = TOPIC_META.find((t) => t.key === block.topic);
        return (
          <View key={block.topic} style={styles.topicBlock}>
            <Text style={styles.topicTitle}>
              {meta?.emoji} {meta?.label ?? block.topic}
            </Text>

            {block.is_empty ? (
              <Text style={styles.emptyReason}>
                Rien d'assez solide aujourd'hui{block.empty_reason ? ` — ${block.empty_reason}` : ""}.
              </Text>
            ) : (
              block.bullets.map((bullet, i) => (
                <View key={i} style={styles.bullet}>
                  <Text style={styles.bulletTitle}>{bullet.title}</Text>
                  <Text style={styles.bulletBody}>{bullet.body}</Text>
                  {bullet.sources.map((source, j) => (
                    <TouchableOpacity key={j} onPress={() => Linking.openURL(source.url)}>
                      <Text style={styles.source}>{source.title} ↗</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { paddingTop: 64, paddingHorizontal: 20, paddingBottom: 40 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 26, fontWeight: "700" },
  editLink: { color: "#2563eb", fontSize: 14, fontWeight: "600" },
  error: { color: "#dc2626", marginBottom: 16 },
  empty: { color: "#666", marginTop: 40, textAlign: "center" },
  topicBlock: { marginBottom: 28 },
  topicTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  emptyReason: { color: "#888", fontStyle: "italic" },
  bullet: { marginBottom: 14 },
  bulletTitle: { fontSize: 15, fontWeight: "600", marginBottom: 3 },
  bulletBody: { fontSize: 14, color: "#333", lineHeight: 20, marginBottom: 4 },
  source: { fontSize: 12, color: "#2563eb", marginTop: 2 },
});
