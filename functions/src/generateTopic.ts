import Anthropic from "@anthropic-ai/sdk";
import { getTopic } from "./topics";
import type { TopicBlock, TopicKey, BulletPoint } from "../../shared/types";

/**
 * Génère le bloc du jour pour UN sujet.
 * C'est la brique qu'on teste seule avant de la répliquer sur les dix —
 * mécaniquement, c'est exactement ce qu'on a fait à la main dans nos échanges,
 * transposé en appel API avec l'outil de recherche web natif de Claude.
 */

const anthropic = new Anthropic(); // lit ANTHROPIC_API_KEY dans l'environnement

// Schéma attendu en sortie — on force le modèle à répondre dans ce format
// via un outil dédié plutôt que de parser du texte libre, pour éviter
// toute dérive de format une fois qu'on tournera sur dix sujets en parallèle.
const OUTPUT_TOOL = {
  name: "publier_bloc",
  description: "Publie le bloc d'actualité généré pour ce sujet et cette date.",
  input_schema: {
    type: "object" as const,
    properties: {
      isEmpty: {
        type: "boolean",
        description:
          "true si aucune information assez solide et fraîche n'a été trouvée pour ce sujet aujourd'hui.",
      },
      emptyReason: {
        type: "string",
        description: "Si isEmpty est true, explique brièvement pourquoi (une phrase).",
      },
      bullets: {
        type: "array",
        description: "2 à 3 informations factuelles maximum, chacune avec au moins une source.",
        items: {
          type: "object",
          properties: {
            title: { type: "string", description: "Titre court et factuel" },
            body: { type: "string", description: "1 à 2 phrases factuelles et précises" },
            sources: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  url: { type: "string" },
                },
                required: ["title", "url"],
              },
            },
          },
          required: ["title", "body", "sources"],
        },
      },
    },
    required: ["isEmpty", "bullets"],
  },
};

export async function generateTopicBlock(topicKey: TopicKey, date: string): Promise<TopicBlock> {
  const topic = getTopic(topicKey);

  const systemPrompt = `Tu es le générateur de contenu d'un brief d'actualité quotidien français, neutre et factuel.
Sujet du jour : "${topic.label}".
Périmètre : ${topic.scope}
Règle éditoriale impérative pour ce sujet : ${topic.rule}

Règles générales, valables pour tous les sujets :
- Recherche les informations marquantes des dernières ~18h à la date du ${date}.
- Sois factuel et précis : noms, chiffres, lieux, dates exactes. Jamais de référence vague.
- Chaque bullet doit avoir au moins une source vérifiable (titre + URL).
- Si tu ne trouves rien d'assez solide et vérifiable, dis-le honnêtement (isEmpty: true) plutôt que d'inventer
  ou d'étirer une information ancienne ou vague.
- Ne présente jamais un événement futur comme passé, ni l'inverse.
- Réponds uniquement via l'outil "publier_bloc".`;

  const response = await anthropic.messages.create({
    // Vérifie le nom de modèle exact disponible sur ton compte au moment
    // où tu testes — la nomenclature évolue. "claude-sonnet-5" est le modèle
    // courant au moment où on écrit ce code (août 2026).
    model: "claude-sonnet-5",
    max_tokens: 4096,
    system: systemPrompt,
    tools: [
      // Recherche web native — c'est le même mécanisme qu'on a utilisé
      // à la main tout au long de cette conversation.
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 8,
        user_location: { type: "approximate", country: "FR" },
      } as any,
      OUTPUT_TOOL,
    ],
    tool_choice: { type: "tool", name: "publier_bloc" },
    messages: [
      {
        role: "user",
        content: `Génère le bloc "${topic.label}" pour le ${date}.`,
      },
    ],
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use" && block.name === "publier_bloc"
  );

  if (!toolUse) {
    throw new Error(`Aucune sortie structurée reçue pour le sujet ${topicKey}`);
  }

  const input = toolUse.input as { isEmpty: boolean; emptyReason?: string; bullets: BulletPoint[] };

  return {
    topic: topicKey,
    date,
    generatedAt: new Date().toISOString(),
    isEmpty: input.isEmpty,
    emptyReason: input.emptyReason,
    bullets: input.bullets ?? [],
  };
}

// Exécution directe : `npx tsx src/generateTopic.ts economie 2026-08-27`
if (require.main === module) {
  const [, , topicArg, dateArg] = process.argv;
  const topicKey = (topicArg ?? "economie") as TopicKey;
  const date = dateArg ?? new Date().toISOString().slice(0, 10);

  generateTopicBlock(topicKey, date)
    .then((block) => {
      console.log(JSON.stringify(block, null, 2));
    })
    .catch((err) => {
      console.error("Échec de la génération:", err);
      process.exit(1);
    });
}
