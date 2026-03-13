Original prompt: Créer une application personnelle Kegel / plancher pelvien en React + TypeScript + Vite + Tailwind, mobile-first, PWA installable, offline, sans backend, prête pour GitHub Pages sous /KegelApp/, avec 4 exercices, génération de séances robuste, adaptation automatique par feedback, historique, réglages sobres et déploiement complet.

## 2026-03-13

- Dépôt local inspecté: repo vide avec remote GitHub déjà pointé vers `Thibisault/KegelApp`.
- Versions récentes vérifiées via npm pour React, Vite, TypeScript, Tailwind et `vite-plugin-pwa`.
- Projet livré: app React/TypeScript/Vite/Tailwind complète avec UI mobile-first, historique, réglages sobres, export/import JSON et PWA installable.
- Moteur métier ajouté: profils adaptatifs par exercice, génération de séance bornée par durée, sanitation des données, adaptation douce post-feedback.
- Déploiement ajouté: workflow GitHub Actions pour GitHub Pages, base path `/KegelApp/`, manifest et service worker compatibles Pages.
- Validation locale effectuée:
  - `npm install`
  - `npm run build`
  - `npm run lint`
  - inspection du build généré (`index.html`, `manifest.webmanifest`, `sw.js`)
  - test Playwright mobile: accueil, démarrage de séance, pause/reprise, quitter, feedback, retour accueil, mise à jour stats/historique
- Incident corrigé pendant la validation: crash runtime dans `SessionPlayer` causé par une mauvaise utilisation de `useEffectEvent`, remplacé par une boucle `requestAnimationFrame` plus sûre.
- Point restant à surveiller plus tard si besoin: `npm audit` signale 4 vulnérabilités hautes dans la chaîne de dépendances transitive, sans bloquer le build actuel.
- Ajout ultérieur: cues haptiques et sonores distincts pour `contract`, `release/exhale` et `fin de séance`, avec Web Audio API sans assets externes et nouveau réglage `Sons guidés`.
- Validation supplémentaire: simulation Playwright avec stub `navigator.vibrate` et faux `AudioContext`, confirmant les trois familles de cues et leurs patterns distincts.
