# Kegel App

Application personnelle de sessions Kegel / plancher pelvien, mobile-first, installable en PWA, pensée pour un usage rapide sur téléphone et déployable sur GitHub Pages sous `/KegelApp/`.

Important: cette application est conçue pour une routine de bien-être personnelle. Ce n’est pas un dispositif médical. En cas de douleur ou de gêne inhabituelle, interrompez la séance.

## Points forts

- React + TypeScript + Vite + Tailwind CSS v4
- PWA installable et usage hors ligne après installation
- Compatible GitHub Pages avec base path `/KegelApp/`
- Aucun backend, aucun compte, aucun service distant
- Persistance locale via `localStorage`
- Vibrations guidées et sons distincts pour contraction, relâchement et fin de séance
- 4 exercices uniquement: `Rapides`, `Longues`, `Relaxation`, `Mixte`
- Génération de séance pure et adaptation douce par exercice
- Historique léger, préférences simples, export/import JSON, reset par exercice ou global

## Lancer en local

```bash
npm install
npm run dev
```

Application locale: [http://localhost:5173](http://localhost:5173) ou le port affiché par Vite.

## Vérifications utiles

```bash
npm run lint
npm run build
npm run preview
```

## Déploiement GitHub Pages

Le projet est déjà configuré pour produire un build avec le bon `base path` pour ce dépôt:

- dépôt cible: `Thibisault/KegelApp`
- base de build: `/KegelApp/`
- manifest PWA et service worker compatibles avec ce sous-chemin

### Option recommandée: GitHub Actions

1. Poussez le projet sur la branche `main`.
2. Dans GitHub, ouvrez `Settings > Pages`.
3. Dans `Build and deployment`, choisissez `Source: GitHub Actions`.
4. Le workflow `.github/workflows/deploy.yml` publiera automatiquement le contenu de `dist/`.
5. L’application sera ensuite disponible sur:
   `https://thibisault.github.io/KegelApp/`

## Installation PWA sur téléphone

### Android / Chrome

1. Ouvrez l’application déployée sur GitHub Pages.
2. Attendez le premier chargement complet.
3. Utilisez le bouton `Installer` si le navigateur le propose, ou le menu `Ajouter à l’écran d’accueil`.
4. Une fois installée, l’application peut fonctionner hors ligne pour les assets déjà mis en cache.

### Notes

- Orientation prioritaire: portrait
- Safe areas prises en compte
- Vibrations guidées activables si le navigateur les supporte
- Sons guidés générés via Web Audio API, sans fichier audio externe
- Sans vibration ou sans son, l’application fonctionne normalement

## Scripts npm

- `npm run dev`: lancement local Vite
- `npm run build`: type-check + build production
- `npm run lint`: lint ESLint
- `npm run preview`: aperçu local du build production
- `npm run check`: lint + build

## Structure du projet

```text
KegelApp/
├─ .github/
│  └─ workflows/
│     └─ deploy.yml
├─ public/
│  ├─ apple-touch-icon.png
│  ├─ favicon.svg
│  ├─ maskable-icon-512.png
│  ├─ pwa-192.png
│  ├─ pwa-512.png
│  └─ robots.txt
├─ src/
│  ├─ components/
│  │  ├─ DurationPicker.tsx
│  │  ├─ ExerciseCard.tsx
│  │  ├─ FeedbackPanel.tsx
│  │  ├─ HistoryList.tsx
│  │  ├─ InstallPromptCard.tsx
│  │  ├─ SessionPlayer.tsx
│  │  └─ SettingsPanel.tsx
│  ├─ domain/
│  │  ├─ adaptation.ts
│  │  ├─ constants.ts
│  │  ├─ defaults.ts
│  │  ├─ generation.ts
│  │  ├─ insights.ts
│  │  └─ profiles.ts
│  ├─ hooks/
│  │  ├─ useAppState.ts
│  │  ├─ usePwaInstall.ts
│  │  └─ useSessionPlayback.ts
│  ├─ lib/
│  │  ├─ format.ts
│  │  ├─ math.ts
│  │  └─ theme.ts
│  ├─ storage/
│  │  └─ appStorage.ts
│  ├─ styles/
│  │  └─ app.css
│  ├─ types/
│  │  └─ app.ts
│  ├─ App.tsx
│  ├─ main.tsx
│  └─ vite-env.d.ts
├─ eslint.config.js
├─ index.html
├─ package.json
├─ progress.md
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts
```

## Logique métier

### Exercices

- `Rapides`: contractions courtes, relâchements courts, plusieurs répétitions
- `Longues`: maintien plus long, récupération ample
- `Relaxation`: respiration guidée et relâchement
- `Mixte`: bloc rapide + bloc maintien

### Adaptation automatique

Après chaque séance, l’utilisateur choisit:

- `Trop facile`
- `Bien`
- `Trop dur`

Chaque exercice possède son profil interne propre dans le stockage local. L’adaptation est douce, bornée et indépendante:

- `Rapides`: priorité aux répétitions, puis au relâchement, puis aux séries
- `Longues`: priorité au temps de maintien, puis aux répétitions, puis au repos inter-séries
- `Relaxation`: priorité aux cycles, puis à l’expiration
- `Mixte`: ajuste surtout le bloc dominant tout en gardant l’équilibre global

### Garde-fous

- Tous les profils sont sanitizés au chargement
- Les bornes min/max sont réappliquées automatiquement
- En cas de `localStorage` corrompu, des valeurs saines sont restaurées
- Les séances sont générées pour rentrer dans la durée choisie

## Données stockées localement

- préférences utilisateur
- durée favorite
- activation des sons guidés
- profils adaptatifs par exercice
- historique des séances
- derniers ressentis via l’historique

Le stockage est sérialisé en JSON dans `localStorage`, et peut être exporté/importé via l’interface.

## Validation effectuée

- `npm run lint`
- `npm run build`
- vérification du build avec base `/KegelApp/`
- contrôle visuel mobile
- test du flux d’accueil
- test de démarrage de séance
- test pause / reprise / quitter
- test accéléré jusqu’à l’écran de feedback
- test d’enregistrement dans l’historique et mise à jour des statistiques
- test simulé des vibrations et des sons distincts pour contraction, relâchement et fin de séance
