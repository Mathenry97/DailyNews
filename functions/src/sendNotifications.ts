import { getSupabaseClient } from "./supabase";
import type { TopicKey } from "../../shared/types";

/**
 * Envoie une notification push (via l'API Expo Push, pas de clé requise pour
 * l'usage basique) à chaque utilisateur dont au moins un sujet coché a un
 * bloc non vide pour la date donnée.
 */

interface AppUser {
  id: string;
  device_id: string;
  expo_push_token: string | null;
  topics: TopicKey[];
}

interface ExpoPushMessage {
  to: string;
  sound: "default";
  title: string;
  body: string;
  data: { date: string };
}

async function main() {
  const date = process.argv[2] ?? new Date().toISOString().slice(0, 10);
  const supabase = getSupabaseClient();

  const { data: users, error: usersError } = await supabase
    .from("app_users")
    .select("id, device_id, expo_push_token, topics")
    .not("expo_push_token", "is", null);
  if (usersError) throw new Error(`Échec lecture app_users: ${usersError.message}`);

  const { data: blocks, error: blocksError } = await supabase
    .from("topic_blocks")
    .select("topic, is_empty")
    .eq("date", date);
  if (blocksError) throw new Error(`Échec lecture topic_blocks: ${blocksError.message}`);

  const nonEmptyTopics = new Set(blocks.filter((b) => !b.is_empty).map((b) => b.topic as TopicKey));

  const messages: ExpoPushMessage[] = [];
  for (const user of users as AppUser[]) {
    if (!user.expo_push_token) continue;
    const relevantCount = user.topics.filter((t) => nonEmptyTopics.has(t)).length;
    if (relevantCount === 0) continue;

    messages.push({
      to: user.expo_push_token,
      sound: "default",
      title: "Ton brief du jour est prêt",
      body: `${relevantCount} sujet(s) mis à jour aujourd'hui.`,
      data: { date },
    });
  }

  console.log(`${users.length} utilisateur(s) avec un token push, ${messages.length} notification(s) à envoyer.`);

  if (messages.length === 0) return;

  // L'API Expo Push limite à 100 messages par requête.
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(chunk),
    });
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
  }
}

main().catch((err) => {
  console.error("Échec de l'envoi des notifications:", err);
  process.exit(1);
});
