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
        description:
          "Au moins 3 informations factuelles et distinctes (voir la règle éditoriale du sujet pour le nombre " +
          "visé exact), chacune avec au moins une source.",
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

// Valide la forme du tool_use avant de faire confiance à son contenu — le
// modèle peut, rarement, renvoyer un input malformé (ex: bullets en chaîne
// de texte au lieu d'un tableau). Mieux vaut réessayer que publier ça tel quel.
function isWellFormed(input: unknown): input is { isEmpty: boolean; emptyReason?: string; bullets: BulletPoint[] } {
  if (typeof input !== "object" || input === null) return false;
  const candidate = input as Record<string, unknown>;
  if (typeof candidate.isEmpty !== "boolean") return false;
  if (!Array.isArray(candidate.bullets)) return false;
  return candidate.bullets.every(
    (b) =>
      typeof b === "object" &&
      b !== null &&
      typeof (b as BulletPoint).title === "string" &&
      typeof (b as BulletPoint).body === "string" &&
      Array.isArray((b as BulletPoint).sources)
  );
}

async function callOnce(topicKey: TopicKey, date: string) {
  const topic = getTopic(topicKey);

  const systemPrompt = `Tu es le générateur de contenu d'un brief d'actualité quotidien français, neutre et factuel.
Sujet du jour : "${topic.label}".
Périmètre : ${topic.scope}
Règle éditoriale impérative pour ce sujet : ${topic.rule}

Socle commun, valable pour tous les sujets (voir docs/regles_editoriales.md pour la version complète) :
- Format : bullet points uniquement, jamais de paragraphes de prose. Chaque bullet = un titre court et factuel,
  suivi d'1 à 2 phrases factuelles et précises dans le corps. Minimum 3 bullets par sujet.
- Fraîcheur et anti-répétition (règle la plus importante, car tu n'as pas de mémoire du brief de la veille) :
  privilégie des faits datés et concrets du jour même ou de la veille (date du ${date}) — annonce, résultat,
  décision, sortie précise, chiffre publié ce jour-là — plutôt que des "marronniers" qui restent vrais
  plusieurs jours sans rien de neuf. Un sujet de fond ne doit être repris que s'il y a un développement
  nouveau et identifiable depuis la veille (titre précis, prix décerné, polémique, chiffre mis à jour).
- Vérifie toujours la date exacte d'un événement avant de l'écrire : ne présente jamais un événement futur
  comme passé, ni l'inverse.
- Factualité : nomme explicitement les personnes, entreprises, lieux, scores, montants — jamais de référence
  vague. Si un chiffre varie selon les sources, précise-le brièvement.
- Effectue au moins une recherche web distincte par bullet avant de rédiger le contenu final — ne rédige
  jamais un bullet sans avoir vérifié la source via web_search.
- Chaque bullet doit avoir au moins une source vérifiable (titre + URL), pour que l'app puisse l'afficher
  cliquable.
- Si tu ne trouves rien d'assez solide et vérifiable après une recherche sérieuse, dis-le honnêtement
  (isEmpty: true) plutôt que d'inventer ou d'étirer une information ancienne ou vague.
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
    // On force le PREMIER tour sur web_search (jamais sur "publier_bloc") :
    // ça garantit qu'au moins une recherche a lieu avant toute publication,
    // même avec l'exigence renforcée de 3+ bullets sourcés. Le modèle reste
    // ensuite libre d'enchaîner d'autres recherches puis d'appeler
    // "publier_bloc" quand il est prêt — tool_choice ne contraint que le tout
    // premier appel d'outil de la réponse, pas les suivants.
    tool_choice: { type: "tool", name: "web_search" },
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

  if (!toolUse || !isWellFormed(toolUse.input)) {
    return null;
  }

  return toolUse.input;
}

export async function generateTopicBlock(topicKey: TopicKey, date: string): Promise<TopicBlock> {
  // Un input malformé est rare mais arrive (ex: le modèle renvoie bullets
  // en texte libre au lieu d'un tableau) — une seule tentative suffit à
  // corriger le tir dans l'immense majorité des cas.
  let input = await callOnce(topicKey, date);
  if (!input) input = await callOnce(topicKey, date);

  if (!input) {
    throw new Error(`Sortie structurée invalide pour le sujet ${topicKey} après deux tentatives`);
  }

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
