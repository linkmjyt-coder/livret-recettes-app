# 📱 Livret de Recettes — Application mobile

Application mobile (Android / iOS / web) pour partager, consulter et gérer les recettes de famille. Les membres se connectent, ajoutent leurs recettes (saisie complète ou simple lien) et sont prévenus par notification quand une nouvelle recette est publiée.

> 🌐 Une version web existe aussi : [livret-recettes](https://github.com/linkmjyt-coder/livret-recettes).

---

## 🚀 Fonctionnalités

- 🔐 **Authentification** : connexion par e-mail et mot de passe, création de compte, ou connexion avec Google (`Login.jsx`, `register.jsx`). L'application n'est accessible qu'aux utilisateurs connectés.
- 🏠 **Accueil** : recettes affichées en cartes, recherche (titre, description, ingrédients), filtres par catégorie, compteurs de recettes (total et de la semaine) et actualisation par tirage de l'écran.
- 📝 **Ajout manuel** : titre, description, photo, temps de préparation et de cuisson, portions, catégorie, difficulté, liste d'ingrédients, étapes et astuces (`ManualRecipeForm.jsx`).
- 🔗 **Ajout par lien** : enregistre une recette trouvée en ligne avec son lien, un nom, une description, une catégorie, une difficulté et une image (`UrlRecipeForm.jsx`). Le détail de la recette propose ensuite un bouton **« Voir la recette originale »**.
- 📷 **Photos** : choix d'une image depuis la galerie (envoyée vers Supabase Storage) ou à partir d'un lien.
- 📖 **Détail d'une recette** : image, catégorie, temps, portions, ingrédients, étapes numérotées et astuce (`app/recipe/[id].jsx`).
- ✏️ **Modification et suppression** : édition d'une recette existante, avec demande de confirmation avant suppression (`app/edit/[id].jsx`).
- 🔔 **Notifications push** : tous les appareils enregistrés sont notifiés lorsqu'une recette est ajoutée (`utils/notifications.js`).
- 👤 **Profil** : informations du compte, déconnexion et journal des erreurs de l'application (`app/profile.jsx`).

### Catégories et difficultés

| Catégories | Difficultés |
|---|---|
| Entrée, Préparation, Plat principal, Dessert, Apéritif, Boisson, Sauce, Accompagnement | Facile, Moyenne, Difficile |

---

## 🛠️ Stack technique

| Domaine | Technologies |
|---|---|
| **Framework** | Expo SDK 54, React Native 0.81, React 19 |
| **Navigation** | Expo Router (routage par fichiers, barre d'onglets Accueil / Ajouter / Profil) |
| **Interface** | NativeWind (Tailwind CSS), Lucide icons, Reanimated |
| **Authentification et base de données** | Firebase Authentication (e-mail et Google), Cloud Firestore |
| **Stockage des images** | Supabase Storage |
| **Notifications** | expo-notifications, Expo Push |
| **Build et mises à jour** | EAS Build, EAS Update, expo-dev-client |
| **Langages** | JavaScript (JSX), TypeScript |

---

## 📁 Structure du projet

```text
.
├── app/                         # Écrans (Expo Router)
│   ├── _layout.tsx              # Layout racine : connexion et barre d'onglets
│   ├── index.jsx                # Accueil : liste, recherche, filtres
│   ├── add-recipe.jsx           # Ajout manuel ou par lien
│   ├── profile.jsx              # Profil, déconnexion, logs
│   ├── recipe/[id].jsx          # Détail d'une recette
│   └── edit/[id].jsx            # Modification et suppression
├── components/
│   ├── Login.jsx                # Connexion (e-mail et Google)
│   ├── register.jsx             # Création de compte
│   ├── RecipeCard.jsx           # Carte de recette
│   ├── ManualRecipeForm.jsx     # Formulaire d'ajout manuel
│   ├── UrlRecipeForm.jsx        # Formulaire d'ajout par lien
│   └── ui/                      # Composants d'interface génériques
├── services/
│   └── recipesService.js        # Accès Firestore (lecture, ajout, suppression)
├── utils/
│   ├── notifications.js         # Enregistrement et envoi des notifications push
│   └── uploadImage.js           # Envoi des images vers Supabase
├── constants/                   # Constantes (thème, etc.)
├── hooks/                       # Hooks personnalisés
├── assets/                      # Icônes, images, splash screen
├── firebase.js                  # Initialisation Firebase
├── supabase.js                  # Initialisation Supabase
├── app.json                     # Configuration Expo
├── eas.json                     # Profils de build EAS
├── tailwind.config.js           # Configuration Tailwind / NativeWind
└── google-services.json         # Configuration Firebase pour Android
```

---

## 💻 Installation locale

### Prérequis

- [Node.js](https://nodejs.org/) et npm
- [Git](https://git-scm.com/)
- Un émulateur Android ([Android Studio](https://developer.android.com/studio)) ou un téléphone connecté en USB
- Un compte [Expo](https://expo.dev/) pour les builds EAS

### Étapes

1. **Cloner le dépôt**

   ```bash
   git clone https://github.com/linkmjyt-coder/livret-recettes-app.git
   cd livret-recettes-app
   ```

2. **Installer les dépendances**

   ```bash
   npm install
   ```

3. **Lancer l'application**

   ```bash
   npx expo start
   ```

### Commandes utiles

| Commande | Description |
|---|---|
| `npm start` | Démarre le serveur de développement Expo |
| `npm run android` | Compile et lance l'application sur Android |
| `npm run ios` | Compile et lance l'application sur iOS (macOS requis) |
| `npm run web` | Lance la version web |
| `npm run lint` | Vérifie le code avec ESLint |

> ⚠️ La connexion Google et les notifications push utilisent des modules natifs : l'application ne fonctionne pas entièrement dans **Expo Go**. Utilise un *development build* (`npm run android`, ou un build EAS avec le profil `development`).

---

## 📦 Builds avec EAS

Les profils de `eas.json` sont :

| Profil | Usage |
|---|---|
| `development` | Build de développement (`expo-dev-client`), distribution interne |
| `preview` | APK Android à partager et tester |
| `production` | Build de production |

```bash
npx eas build --profile preview --platform android
```

---

## ⚙️ Configuration

Pour utiliser ton propre projet, remplace les valeurs suivantes :

- **Firebase** : configuration dans `firebase.js` et fichier `google-services.json` (Android), avec Authentication (e-mail et Google) et Firestore activés. Les collections utilisées sont `recipes` et `pushTokens`.
- **Google Sign-In** : identifiant client web renseigné dans `components/Login.jsx`.
- **Supabase** : URL et clé publique (`anon`) dans `supabase.js`, avec un bucket public nommé `recipe`.
- **Expo / EAS** : identifiant de projet dans `app.json` et `utils/notifications.js`, et identifiant Android `com.linkmj.livretrecettes`.

---

## 👤 Auteur

Projet développé par [linkmjyt-coder](https://github.com/linkmjyt-coder).
