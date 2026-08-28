import type { TopicKey } from "./types";

/**
 * Emoji + libellé de chaque sujet — partagé entre le générateur (functions/)
 * et l'app (app/), pour ne pas dupliquer/désynchroniser ces libellés.
 * Les règles éditoriales complètes restent dans functions/src/topics.ts,
 * elles n'ont rien à faire dans le bundle mobile.
 */
export interface TopicMeta {
  key: TopicKey;
  emoji: string;
  label: string;
}

export const TOPIC_META: TopicMeta[] = [
  { key: "international", emoji: "🌍", label: "International, Europe & géopolitique" },
  { key: "france", emoji: "🇫🇷", label: "France & institutions" },
  { key: "societe", emoji: "⚖️", label: "Société & justice" },
  { key: "economie", emoji: "💶", label: "Économie & pouvoir d'achat" },
  { key: "environnement", emoji: "🌱", label: "Environnement & climat" },
  { key: "sante", emoji: "🏥", label: "Santé" },
  { key: "sciences", emoji: "🔬", label: "Sciences & espace" },
  { key: "tech", emoji: "💻", label: "Tech & IA" },
  { key: "culture", emoji: "🎭", label: "Culture" },
  { key: "sport", emoji: "⚽", label: "Sport" },
];
