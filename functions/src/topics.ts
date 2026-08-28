import type { TopicKey } from "../../shared/types";
import { TOPIC_META } from "../../shared/topicMeta";

/**
 * La configuration éditoriale des dix sujets.
 * `rule` est injecté tel quel dans le prompt système du générateur —
 * c'est le garde-fou anti-biais qu'on a construit ensemble, sujet par sujet.
 * Modifier ces règles ici change directement le comportement du générateur,
 * pas besoin de toucher au code de génération.
 * emoji/label viennent de shared/topicMeta.ts, partagé avec l'app mobile.
 */

export interface TopicConfig {
  key: TopicKey;
  emoji: string;
  label: string;
  scope: string; // ce que couvre le sujet
  rule: string;  // la règle éditoriale anti-biais / de fraîcheur
}

const SCOPE_AND_RULE: Record<TopicKey, { scope: string; rule: string }> = {
  international: {
    scope:
      "conflits, diplomatie, relations entre États, institutions européennes (Parlement, Commission, Conseil), migrations au niveau européen.",
    rule:
      "Croise au moins deux agences de presse (AFP, Reuters, AP) sur les faits contestés. " +
      "Distingue clairement un État agissant seul (International) d'une décision collective des 27 (Europe).",
  },
  france: {
    scope: "gouvernement, Assemblée nationale, réformes, décisions ministérielles.",
    rule:
      "Cite les responsables par leur nom et fonction exacte. Présente les positions des différents partis " +
      "sans surreprésenter l'un d'eux.",
  },
  societe: {
    scope: "faits divers, justice, éducation, cohésion sociale, sécurité.",
    rule:
      "Pars toujours des chiffres officiels (ministère de l'Intérieur, ministère de la Justice) plutôt que d'un " +
      "fait isolé viral. Évite le vocabulaire anxiogène.",
  },
  economie: {
    scope: "emploi, chômage, inflation, salaires, grandes décisions industrielles.",
    rule:
      "Jamais la bourse ni les indices boursiers. Toujours un chiffre daté avec sa source (Insee, Banque de France, Dares).",
  },
  environnement: {
    scope: "climat, biodiversité, énergie, catastrophes naturelles — France ET international.",
    rule:
      "Distingue clairement les données scientifiques établies (GIEC, Météo-France) des déclarations politiques. " +
      "Élargis la recherche au-delà de la France si rien de solide n'est disponible localement ce jour-là.",
  },
  sante: {
    scope: "système de soins, avancées médicales, santé publique — France ET international.",
    rule:
      "Élargis systématiquement au-delà de la France : épidémies, urgences sanitaires internationales (OMS), " +
      "avancées de recherche françaises ET internationales. Sources médicales/scientifiques uniquement, jamais " +
      "un témoignage isolé.",
  },
  sciences: {
    scope: "recherche, découvertes, missions spatiales, archéologie.",
    rule: "Cite systématiquement l'institution ou la publication scientifique à l'origine du résultat.",
  },
  tech: {
    scope: "produits, entreprises, régulation, avancées techniques.",
    rule:
      "Si un seul sujet domine vraiment la journée, détaille-le (specs, prix, disponibilité, comparaison à la " +
      "version précédente) plutôt que d'empiler des titres superficiels.",
  },
  culture: {
    scope: "cinéma, musique, littérature, arts, spectacle vivant.",
    rule: "Alterne grand public et scène indépendante. N'oublie jamais la musique (sorties, concerts du jour).",
  },
  sport: {
    scope: "généraliste — pas seulement le football (tennis, cyclisme, rugby, basket...).",
    rule:
      "Vérifie systématiquement que l'événement est bien passé ou du jour même, jamais un résultat périmé " +
      "présenté comme récent. Priorise un événement français majeur du soir quand il y en a un.",
  },
};

export const TOPICS: TopicConfig[] = TOPIC_META.map((meta) => ({
  ...meta,
  ...SCOPE_AND_RULE[meta.key],
}));

export function getTopic(key: TopicKey): TopicConfig {
  const topic = TOPICS.find((t) => t.key === key);
  if (!topic) throw new Error(`Sujet inconnu: ${key}`);
  return topic;
}
