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
      "Vise 3 à 4 informations distinctes et non répétitives : un conflit armé, une catastrophe naturelle, " +
      "une actualité diplomatique, un fait politique majeur dans un grand pays. Sur les conflits en cours " +
      "(Ukraine, Gaza), cherche le développement précis des dernières 24-48h (frappe datée avec bilan chiffré, " +
      "statut de négociation, déclaration officielle nommée), pas l'état général. Distingue clairement un fait " +
      "daté d'aujourd'hui/hier d'un contexte de fond plus ancien. Croise au moins deux agences de presse " +
      "(AFP, Reuters, AP) sur les faits contestés. Distingue clairement un État agissant seul (International) " +
      "d'une décision collective des 27 (Europe).",
  },
  france: {
    scope: "gouvernement, Assemblée nationale, réformes, décisions ministérielles.",
    rule:
      "Sujet prioritaire : ne le laisse jamais vide sans recherche approfondie. Diversifie les angles : le " +
      "budget ne doit être qu'UN sujet parmi d'autres, jamais dominant ni répété sur plusieurs bullets — au " +
      "maximum 1 bullet sur 3 peut porter sur le budget. Creuse aussi les réformes hors budget, l'activité " +
      "parlementaire, les décisions ministérielles, la vie politique (candidatures, rentrée politique des " +
      "partis, tensions internes), la justice ou l'administration si pertinent. Cite les responsables par " +
      "leur nom et fonction exacte. Vise 3 informations distinctes et non redondantes entre elles : par " +
      "exemple une actualité électorale/partisane, une décision gouvernementale concrète (hors budget si " +
      "possible), un événement politique daté. Présente les positions des différents partis sans " +
      "surreprésenter l'un d'eux.",
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
      "Exclus totalement la bourse et les indices (CAC 40, marchés, cours de l'action). Concentre-toi sur " +
      "l'économie réelle : emploi/chômage, inflation, pouvoir d'achat, salaires, plans sociaux, résultats " +
      "d'entreprise en termes d'activité, prises de position patronales/syndicales. Toujours un chiffre daté " +
      "avec sa source (Insee, Banque de France, Dares). Vise 3 informations : une décision d'entreprise " +
      "concrète, un indicateur macro daté, un fait de contexte.",
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
      "version précédente) plutôt que d'empiler des titres superficiels. Ne te limite pas à l'IA générative : " +
      "hardware, résultats d'entreprises tech en termes d'activité/demande (jamais la bourse), annonces " +
      "produit, régulation/procès tech. Vise 3 informations distinctes.",
  },
  culture: {
    scope: "cinéma, musique, littérature, arts, spectacle vivant.",
    rule:
      "Diversifie les angles, France ET international : cinéma, musique, littérature (seulement avec un fait " +
      "précis et nouveau), arts/expositions, spectacle vivant, jeux vidéo si pertinent. Ne te rabats jamais " +
      "systématiquement sur le même repère récurrent d'un jour à l'autre. Vise 3 informations dans des " +
      "sous-catégories différentes. N'oublie jamais la musique (sorties, concerts du jour).",
  },
  sport: {
    scope: "généraliste — pas seulement le football (tennis, cyclisme, rugby, basket...).",
    rule:
      "Traite toujours une actualité sportive générale, pas seulement le football (tennis, cyclisme, rugby, " +
      "basket, etc. selon l'actualité réelle du jour). Ne traite pas systématiquement le même sport comme " +
      "référence par défaut — varie d'un jour à l'autre. Vérifie systématiquement que l'événement est bien " +
      "passé ou du jour même, jamais un résultat périmé présenté comme récent. Priorise un événement français " +
      "majeur du soir quand il y en a un. Vise 3 informations dans des sports différents.",
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
