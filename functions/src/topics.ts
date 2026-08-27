import type { TopicKey } from "../../shared/types";

/**
 * La configuration éditoriale des dix sujets.
 * `rule` est injecté tel quel dans le prompt système du générateur —
 * c'est le garde-fou anti-biais qu'on a construit ensemble, sujet par sujet.
 * Modifier ces règles ici change directement le comportement du générateur,
 * pas besoin de toucher au code de génération.
 */

export interface TopicConfig {
  key: TopicKey;
  emoji: string;
  label: string;
  scope: string; // ce que couvre le sujet
  rule: string;  // la règle éditoriale anti-biais / de fraîcheur
}

export const TOPICS: TopicConfig[] = [
  {
    key: "international",
    emoji: "🌍",
    label: "International, Europe & géopolitique",
    scope:
      "conflits, diplomatie, relations entre États, institutions européennes (Parlement, Commission, Conseil), migrations au niveau européen.",
    rule:
      "Croise au moins deux agences de presse (AFP, Reuters, AP) sur les faits contestés. " +
      "Distingue clairement un État agissant seul (International) d'une décision collective des 27 (Europe).",
  },
  {
    key: "france",
    emoji: "🇫🇷",
    label: "France & institutions",
    scope: "gouvernement, Assemblée nationale, réformes, décisions ministérielles.",
    rule:
      "Cite les responsables par leur nom et fonction exacte. Présente les positions des différents partis " +
      "sans surreprésenter l'un d'eux.",
  },
  {
    key: "societe",
    emoji: "⚖️",
    label: "Société & justice",
    scope: "faits divers, justice, éducation, cohésion sociale, sécurité.",
    rule:
      "Pars toujours des chiffres officiels (ministère de l'Intérieur, ministère de la Justice) plutôt que d'un " +
      "fait isolé viral. Évite le vocabulaire anxiogène.",
  },
  {
    key: "economie",
    emoji: "💶",
    label: "Économie & pouvoir d'achat",
    scope: "emploi, chômage, inflation, salaires, grandes décisions industrielles.",
    rule:
      "Jamais la bourse ni les indices boursiers. Toujours un chiffre daté avec sa source (Insee, Banque de France, Dares).",
  },
  {
    key: "environnement",
    emoji: "🌱",
    label: "Environnement & climat",
    scope: "climat, biodiversité, énergie, catastrophes naturelles — France ET international.",
    rule:
      "Distingue clairement les données scientifiques établies (GIEC, Météo-France) des déclarations politiques. " +
      "Élargis la recherche au-delà de la France si rien de solide n'est disponible localement ce jour-là.",
  },
  {
    key: "sante",
    emoji: "🏥",
    label: "Santé",
    scope: "système de soins, avancées médicales, santé publique — France ET international.",
    rule:
      "Élargis systématiquement au-delà de la France : épidémies, urgences sanitaires internationales (OMS), " +
      "avancées de recherche françaises ET internationales. Sources médicales/scientifiques uniquement, jamais " +
      "un témoignage isolé.",
  },
  {
    key: "sciences",
    emoji: "🔬",
    label: "Sciences & espace",
    scope: "recherche, découvertes, missions spatiales, archéologie.",
    rule: "Cite systématiquement l'institution ou la publication scientifique à l'origine du résultat.",
  },
  {
    key: "tech",
    emoji: "💻",
    label: "Tech & IA",
    scope: "produits, entreprises, régulation, avancées techniques.",
    rule:
      "Si un seul sujet domine vraiment la journée, détaille-le (specs, prix, disponibilité, comparaison à la " +
      "version précédente) plutôt que d'empiler des titres superficiels.",
  },
  {
    key: "culture",
    emoji: "🎭",
    label: "Culture",
    scope: "cinéma, musique, littérature, arts, spectacle vivant.",
    rule: "Alterne grand public et scène indépendante. N'oublie jamais la musique (sorties, concerts du jour).",
  },
  {
    key: "sport",
    emoji: "⚽",
    label: "Sport",
    scope: "généraliste — pas seulement le football (tennis, cyclisme, rugby, basket...).",
    rule:
      "Vérifie systématiquement que l'événement est bien passé ou du jour même, jamais un résultat périmé " +
      "présenté comme récent. Priorise un événement français majeur du soir quand il y en a un.",
  },
];

export function getTopic(key: TopicKey): TopicConfig {
  const topic = TOPICS.find((t) => t.key === key);
  if (!topic) throw new Error(`Sujet inconnu: ${key}`);
  return topic;
}
