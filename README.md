# Brief app — moteur de génération (v0)

Première brique du projet : le générateur d'un bloc d'actualité pour un seul
sujet, testable en local avant de le répliquer sur les dix.

## Structure

```
brief-app/
├── shared/
│   └── types.ts       → format d'un bloc d'actualité (TopicBlock), partagé
│                         avec l'app plus tard
└── functions/
    ├── src/
    │   ├── topics.ts          → les 10 sujets + leur règle éditoriale
    │   └── generateTopic.ts   → génère le bloc du jour pour 1 sujet
    ├── package.json
    ├── tsconfig.json
    └── .env.example
```

## Pour tester en local

1. `cd functions && npm install`
2. Copie `.env.example` en `.env`, colle ta clé API Claude
   (console.anthropic.com → API Keys)
3. `npm run generate -- economie 2026-08-27`
   (remplace `economie` par n'importe quelle clé de `topics.ts` :
   international, france, societe, economie, environnement, sante,
   sciences, tech, culture, sport)
4. Le bloc généré s'affiche en JSON dans le terminal — vérifie que les
   bullets sont factuels, sourcés, et datés correctement.

## Important : où continuer à développer

Cette conversation tourne dans un environnement cloud temporaire (Cowork) —
tout ce qui est écrit ici disparaît à la fin de la session si tu ne le
récupères pas. Je te livre ce dossier en fichiers téléchargeables juste après.

Pour la suite du projet — itérer sur ce code sur plusieurs sessions, avoir un
vrai historique git, brancher Supabase et l'app Expo — le bon outil est
**Claude Code en local sur ton ordinateur**, pas Cowork. Cowork est pensé pour
des tâches ponctuelles (documents, recherche, automatisations), pas pour un
projet de code qui vit dans la durée. Concrètement : tu récupères ce dossier,
tu l'ouvres avec Claude Code sur ta machine, on continue à construire dessus
exactement comme on vient de le faire ici, mais avec un vrai repo git et la
persistance entre les sessions.

## Prochaines étapes (dans l'ordre)

1. ✅ Générateur pour un seul sujet (ce dossier)
2. Lancer les dix sujets en parallèle et comparer aux tests qu'on a faits à
   la main dans la conversation — vérifier qu'on retrouve un niveau de
   qualité équivalent
3. Brancher Supabase : stocker les blocs générés + les comptes utilisateurs
4. Fonction d'envoi des notifications (Expo push)
5. App Expo : écran d'inscription (10 cases à cocher) + écran du brief du
   jour avec sources cliquables
