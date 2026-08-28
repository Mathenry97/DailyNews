import { getSupabaseClient } from "./supabase";
import type { TopicBlock } from "../../shared/types";

/**
 * Écrit les blocs générés dans topic_blocks, un upsert par (topic, date) —
 * relancer la génération pour un jour déjà stocké remplace le bloc existant
 * plutôt que d'en créer un doublon.
 */
export async function persistBlocks(blocks: TopicBlock[]): Promise<void> {
  if (blocks.length === 0) return;

  const supabase = getSupabaseClient();

  const rows = blocks.map((b) => ({
    topic: b.topic,
    date: b.date,
    generated_at: b.generatedAt,
    is_empty: b.isEmpty,
    empty_reason: b.emptyReason ?? null,
    bullets: b.bullets,
  }));

  const { error } = await supabase.from("topic_blocks").upsert(rows, { onConflict: "topic,date" });

  if (error) {
    throw new Error(`Échec de l'écriture dans Supabase: ${error.message}`);
  }
}
