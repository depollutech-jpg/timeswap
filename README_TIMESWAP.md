# TimeSwap - Application d'\u00e9change de services mobile

## \ud83d\ude80 Vue d'ensemble

TimeSwap est une application mobile (iOS & Android) permettant d'\u00e9changer des services sans argent, avec un syst\u00e8me de gamification (XP, niveaux, badges).

### Fonctionnalit\u00e9s principales impl\u00e9ment\u00e9es (MVP)

\u2705 **Authentification**
- Inscription / Connexion avec email & mot de passe
- 2 heures gratuites \u00e0 l'inscription
- JWT token pour s\u00e9curisation

\u2705 **Profils utilisateurs**
- Gestion de profil (nom, email, t\u00e9l\u00e9phone, bio, localisation)
- Photos de profil (base64)
- Syst\u00e8me de v\u00e9rification d'identit\u00e9 (upload pi\u00e8ce d'identit\u00e9)
- Profils v\u00e9rifi\u00e9s ont plus de visibilit\u00e9

\u2705 **Services (Offres/Demandes)**
- Cr\u00e9ation d'offres et demandes de services
- Cat\u00e9gories multiples (bricolage, jardinage, cuisine, etc.)
- G\u00e9olocalisation et recherche par distance
- Algorithme de visibilit\u00e9 (profils v\u00e9rifi\u00e9s en priorit\u00e9)
- Filtres par cat\u00e9gorie, type, localisation

\u2705 **\u00c9changes**
- Syst\u00e8me de matching entre offres/demandes
- Gestion du statut (pending, accepted, completed)
- Attribution automatique de XP apr\u00e8s \u00e9change
- Mise \u00e0 jour des cr\u00e9dits (heures)

\u2705 **Gamification**
- Syst\u00e8me XP (10 XP par heure d'\u00e9change)
- Niveaux (1 niveau = 100 XP)
- Badges pr\u00e9d\u00e9finis (Premier \u00c9change, V\u00e9rifi\u00e9, Mentor, etc.)
- Statistiques RPG (Force, Sagesse, Dext\u00e9rit\u00e9)
- Leaderboard

\u2705 **Paiements (Stripe)**
- 3 forfaits pr\u00e9d\u00e9finis (Small: 5h/5\u20ac, Medium: 10h/9\u20ac, Large: 20h/15\u20ac)
- Int\u00e9gration Stripe via emergentintegrations
- Webhook pour mise \u00e0 jour automatique des cr\u00e9dits
- Polling du statut de paiement

\u2705 **Interface Mobile**
- Navigation avec 5 tabs (Accueil, Recherche, Messages, R\u00e9compenses, Profil)
- Design moderne avec gradient rose/violet
- Responsive et optimis\u00e9 pour mobile
- Safe area handling (iPhone notch, etc.)

---

## \ud83d\udcbb Stack Technique

### Frontend
- **Framework**: React Native + Expo Router (v54)
- **Navigation**: Expo Router (file-based routing) + Bottom Tabs
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Storage**: AsyncStorage
- **UI**: Custom components avec Ionicons
- **Librairies**:
  - `@shopify/flash-list` - Listes performantes
  - `expo-location` - G\u00e9olocalisation
  - `expo-image-picker` - Upload photos
  - `expo-linear-gradient` - Gradients
  - `react-native-maps` - Cartes (pr\u00eat pour phase 2)

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Database**: MongoDB (Motor pour async)
- **Auth**: JWT + bcrypt
- **Paiements**: Stripe via emergentintegrations
- **API**: RESTful avec documentation Swagger

### Infrastructure
- **Serveur**: Uvicorn (port 8001)
- **Database**: MongoDB (port 27017)
- **Frontend Dev**: Expo Tunnel (port 3000)
- **Proxy**: Toutes les requ\u00eates `/api/*` sont redirig\u00e9es vers le backend

---

## \ud83d\udccf Structure du projet

```
/app
\u251c\u2500\u2500 backend/
\u2502   \u251c\u2500\u2500 server.py              # API FastAPI compl\u00e8te
\u2502   \u251c\u2500\u2500 .env                   # Variables d'environnement
\u2502   \u2514\u2500\u2500 requirements.txt       # D\u00e9pendances Python
\u2502
\u251c\u2500\u2500 frontend/
\u2502   \u251c\u2500\u2500 app/
\u2502   \u2502   \u251c\u2500\u2500 (tabs)/             # Navigation tabs
\u2502   \u2502   \u2502   \u251c\u2500\u2500 home.tsx
\u2502   \u2502   \u2502   \u251c\u2500\u2500 search.tsx
\u2502   \u2502   \u2502   \u251c\u2500\u2500 messages.tsx
\u2502   \u2502   \u2502   \u251c\u2500\u2500 rewards.tsx
\u2502   \u2502   \u2502   \u2514\u2500\u2500 profile.tsx
\u2502   \u2502   \u251c\u2500\u2500 auth/
\u2502   \u2502   \u2502   \u251c\u2500\u2500 login.tsx
\u2502   \u2502   \u2502   \u2514\u2500\u2500 register.tsx
\u2502   \u2502   \u251c\u2500\u2500 buy-hours.tsx      # Page achat d'heures
\u2502   \u2502   \u251c\u2500\u2500 index.tsx          # Page d'accueil
\u2502   \u2502   \u2514\u2500\u2500 _layout.tsx        # Layout global
\u2502   \u2502
\u2502   \u251c\u2500\u2500 src/
\u2502   \u2502   \u251c\u2500\u2500 store/
\u2502   \u2502   \u2502   \u2514\u2500\u2500 authStore.ts      # Store Zustand
\u2502   \u2502   \u251c\u2500\u2500 utils/
\u2502   \u2502   \u2502   \u2514\u2500\u2500 api.ts            # Client Axios
\u2502   \u2502   \u2514\u2500\u2500 constants/
\u2502   \u2502       \u251c\u2500\u2500 colors.ts
\u2502   \u2502       \u2514\u2500\u2500 categories.ts
\u2502   \u2502
\u2502   \u251c\u2500\u2500 package.json
\u2502   \u2514\u2500\u2500 app.json              # Config Expo
```

---

## \ud83d\udce6 Mod\u00e8les de donn\u00e9es MongoDB

### users
```json
{
  \"_id\": \"uuid\",
  \"email\": \"user@example.com\",
  \"password_hash\": \"bcrypt_hash\",
  \"profile\": {
    \"firstName\": \"Jean\",
    \"lastName\": \"Dupont\",
    \"phone\": \"+33612345678\",
    \"bio\": \"...\",
    \"location\": \"Paris\",
    \"photo_base64\": \"...\"
  },
  \"verification\": {
    \"isVerified\": false,
    \"idDocument_base64\": null,
    \"verifiedAt\": null
  },
  \"credits\": {
    \"available\": 2.0,
    \"given\": 0,
    \"received\": 0
  },
  \"gamification\": {
    \"xp\": 0,
    \"level\": 1,
    \"badges\": [],
    \"stats\": {
      \"force\": 0,
      \"sagesse\": 0,
      \"dexterite\": 0
    }
  },
  \"interests\": [],
  \"createdAt\": \"ISO_DATE\",
  \"updatedAt\": \"ISO_DATE\"
}
```

### services
```json
{
  \"_id\": \"uuid\",
  \"userId\": \"user_id\",
  \"title\": \"Cours de cuisine v\u00e9g\u00e9tarienne\",
  \"description\": \"...\",
  \"category\": \"cuisine\",
  \"duration\": 2.0,
  \"type\": \"offer\",  // ou \"request\"
  \"location\": \"Paris 11e\",
  \"coordinates\": {\"lat\": 48.8566, \"lng\": 2.3522},
  \"status\": \"active\",
  \"boostedScore\": 10,  // 10 si v\u00e9rifi\u00e9, 1 sinon
  \"createdAt\": \"ISO_DATE\"
}
```

### exchanges
```json
{
  \"_id\": \"uuid\",
  \"serviceId\": \"service_id\",
  \"providerId\": \"user_id\",
  \"receiverId\": \"user_id\",
  \"duration\": 2.0,
  \"status\": \"pending\",  // pending, accepted, completed, cancelled
  \"xpAwarded\": 0,
  \"rating\": null,
  \"review\": null,
  \"createdAt\": \"ISO_DATE\",
  \"completedAt\": null
}
```

### payment_transactions
```json
{
  \"_id\": \"uuid\",
  \"userId\": \"user_id\",
  \"sessionId\": \"stripe_session_id\",
  \"packageId\": \"small\",
  \"amount\": 5.0,
  \"currency\": \"usd\",
  \"hours\": 5,
  \"status\": \"pending\",
  \"payment_status\": \"pending\",
  \"metadata\": {},
  \"createdAt\": \"ISO_DATE\"
}
```

---

## \ud83d\udd11 Endpoints API

### Auth
- `POST /api/auth/register` - Inscription (+ 2h gratuites)
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil actuel (protected)

### Profile
- `PUT /api/profile` - Mettre \u00e0 jour le profil (protected)
- `POST /api/profile/verification` - Upload pi\u00e8ce d'identit\u00e9 (protected)
- `GET /api/users/:id` - Voir un profil public

### Services
- `POST /api/services` - Cr\u00e9er un service (protected)
- `GET /api/services` - Liste des services (filtres: type, category, location)
- `GET /api/services/:id` - D\u00e9tails d'un service
- `GET /api/services/my/all` - Mes services (protected)

### Exchanges
- `POST /api/exchanges` - Cr\u00e9er un \u00e9change (protected)
- `PUT /api/exchanges/:id/accept` - Accepter (protected)
- `PUT /api/exchanges/:id/complete` - Compl\u00e9ter (protected)
- `GET /api/exchanges/my/all` - Mes \u00e9changes (protected)

### Payments
- `GET /api/payments/packages` - Liste des forfaits
- `POST /api/payments/checkout` - Cr\u00e9er session Stripe (protected)
- `GET /api/payments/status/:session_id` - Statut paiement (protected)
- `POST /api/webhook/stripe` - Webhook Stripe

### Gamification
- `GET /api/leaderboard` - Classement XP
- `GET /api/badges` - Liste des badges

---

## \ud83d\ude80 Lancer le projet

### Backend
```bash
cd /app/backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend
```bash
cd /app/frontend
yarn install
yarn start
```

### Variables d'environnement

**Backend (.env)**
```
MONGO_URL=mongodb://localhost:27017/
DB_NAME=timeswap
STRIPE_API_KEY=sk_test_emergent
JWT_SECRET=timeswap_secret_key_change_in_production_2025
```

**Frontend (.env)**
```
EXPO_PUBLIC_BACKEND_URL=<URL_BACKEND>
```

---

## \ud83c\udfaf Fonctionnalit\u00e9s \u00e0 impl\u00e9menter (Phase 2)

\u2610 **Messagerie temps r\u00e9el**
- Firebase Firestore pour chat
- Notifications push
- Liste des conversations

\u2610 **G\u00e9olocalisation avanc\u00e9e**
- Int\u00e9gration Google Maps API
- Recherche par distance (rayon)
- Affichage sur carte

\u2610 **V\u00e9rification d'identit\u00e9**
- Dashboard admin pour valider les documents
- Workflow de v\u00e9rification

\u2610 **Partenaires et Commerces**
- Syst\u00e8me de bons d'achat
- R\u00e9compenses par niveau
- Gestion des partenaires

\u2610 **Admin Dashboard**
- Gestion utilisateurs
- Mod\u00e9ration des services
- Statistiques

\u2610 **Associations**
- Comptes professionnels
- Dons d'heures
- Dons financiers (commission 20%)

\u2610 **Am\u00e9liorations UX**
- Syst\u00e8me de notation apr\u00e8s \u00e9change
- Favoris
- Historique des \u00e9changes
- Notifications

---

## \ud83d\udc65 Utilisateurs cibles

1. **Principale**: Adultes 25-45 ans, zones p\u00e9ri-urbaines/rurales
2. **C\u0153ur de cible**: Utilisateurs r\u00e9guliers motiv\u00e9s par gamification
3. **Relais**: Associations, commerces locaux, artisans

---

## \ud83d\udd10 S\u00e9curit\u00e9

- \u2705 Mots de passe hash\u00e9s avec bcrypt
- \u2705 JWT avec expiration (30 jours)
- \u2705 Protection des routes avec middleware
- \u2705 Validation des donn\u00e9es avec Pydantic
- \u2705 CORS configur\u00e9
- \u2705 Paiements s\u00e9curis\u00e9s via Stripe
- \u2610 Rate limiting (TODO)
- \u2610 RGPD compliance (TODO)

---

## \ud83e\uddd1\u200d\ud83d\udcbb Contact

**Projet**: TimeSwap
**Contact PO/Tech**: quentin (quentinraffalli@hotmail.com)
**Date**: Janvier 2025

---

## \ud83d\udcdd Notes techniques importantes

### Images
- Toutes les images sont stock\u00e9es en **base64** dans MongoDB
- Photos de profil, pi\u00e8ces d'identit\u00e9, photos de services
- Pas de service de stockage externe pour MVP

### Algorithme de visibilit\u00e9
- Les profils v\u00e9rifi\u00e9s ont un `boostedScore` de 10
- Les profils non v\u00e9rifi\u00e9s ont un `boostedScore` de 1
- Les services sont tri\u00e9s par `boostedScore` d\u00e9croissant

### Gamification
- 10 XP par heure d'\u00e9change donn\u00e9e
- 5 XP par heure d'\u00e9change re\u00e7ue
- 1 niveau = 100 XP
- Les stats RPG augmentent \u00e0 chaque \u00e9change

### Paiements
- Cl\u00e9 Stripe de test: `sk_test_emergent` (via emergentintegrations)
- 3 forfaits fixes d\u00e9finis c\u00f4t\u00e9 backend (s\u00e9curit\u00e9)
- Polling du statut de paiement toutes les 2s (max 5 tentatives)
- Webhook Stripe pour mise \u00e0 jour automatique

---

\ud83c\udf89 **Application pr\u00eate pour la d\u00e9mo et les tests !**
