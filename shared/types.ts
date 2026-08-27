/**
 * Types partagés entre le générateur (functions/) et l'app (app/, à venir).
 * Un "TopicBlock" est le contenu généré pour UN sujet, UN jour donné.
 * Il est généré une seule fois par sujet par jour, puis recomposé
 * par utilisateur selon ses sujets cochés — jamais régénéré par utilisateur.
 */

export type TopicKey =
  | "international"      // International, Europe & géopolitique
  | "france"              // France & institutions
  | "societe"             // Société & justice
  | "economie"            // Économie & pouvoir d'achat
  | "environnement"       // Environnement & climat
  | "sante"               // Santé
  | "sciences"            // Sciences & espace
  | "tech"                // Tech & IA
  | "culture"             // Culture
  | "sport";               // Sport

export interface SourceRef {
  title: string;
  url: string;
}

export interface BulletPoint {
  title: string;       // court titre factuel, en gras côté app
  body: string;         // 1-2 phrases factuelles
  sources: SourceRef[]; // au moins 1 source par bullet, affichée dans l'app
}

export interface TopicBlock {
  topic: TopicKey;
  date: string;           // format YYYY-MM-DD, date de génération
  generatedAt: string;    // ISO timestamp
  bullets: BulletPoint[]; // vide si rien de solide ce jour-là (jamais inventé)
  isEmpty: boolean;       // true si aucune info assez solide n'a été trouvée
  emptyReason?: string;   // explication courte si isEmpty === true
}

/**
 * Ce qu'un utilisateur reçoit le matin : la sélection de TopicBlock
 * correspondant à ses sujets cochés, dans l'ordre de ses préférences.
 */
export interface UserBrief {
  userId: string;
  date: string;
  blocks: TopicBlock[];
}
