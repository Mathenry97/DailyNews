import AsyncStorage from "@react-native-async-storage/async-storage";
import type { TopicKey } from "../../../shared/types";

const TOPICS_KEY = "brief-app:selected-topics";

export async function getSavedTopics(): Promise<TopicKey[] | null> {
  const raw = await AsyncStorage.getItem(TOPICS_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as TopicKey[];
}

export async function saveTopics(topics: TopicKey[]): Promise<void> {
  await AsyncStorage.setItem(TOPICS_KEY, JSON.stringify(topics));
}
