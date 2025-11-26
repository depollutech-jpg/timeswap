# 📱 Guide Complet - Système de Messagerie TimeSwap

## 🎯 Vue d'Ensemble

Le système de messagerie permet aux utilisateurs de :
- Voir les détails complets d'une annonce
- Contacter directement le créateur d'une annonce
- Échanger des messages en temps réel
- Retrouver toutes leurs conversations

---

## 🚀 Flow Utilisateur Complet

### 1️⃣ Découvrir une Annonce

**Page :** Accueil (onglet Home)

**Actions disponibles :**
- Parcourir le feed d'annonces
- Voir les informations de base (titre, durée, localisation, distance)
- **NOUVEAU :** Cliquer sur n'importe quelle annonce pour voir les détails

**Changement :** Les annonces ne sont plus des cartes statiques, elles sont maintenant entièrement cliquables !

---

### 2️⃣ Voir les Détails de l'Annonce

**Page :** `/service-details?id={serviceId}`

**Informations affichées :**
- 🏷️ Badge de type (OFFRE ou DEMANDE)
- 📝 Titre complet du service
- ⏱️ Durée en heures
- 📍 Localisation
- 🏷️ Catégorie
- 📄 Description complète
- 👤 **Profil du créateur :**
  - Nom complet
  - Photo de profil (ou initiales)
  - Note moyenne ⭐
  - XP accumulé ⚡
  - Badge "Vérifié" ✓ (si applicable)
- 📏 Distance (si géolocalisation activée)

**Action disponible :**
- 💬 Bouton **"Contacter pour un échange"**

**Sécurité :**
- Le bouton n'apparaît pas si c'est votre propre annonce
- Redirection automatique si l'annonce n'existe pas

---

### 3️⃣ Contacter le Créateur

**Action :** Clic sur "Contacter pour un échange"

**Ce qui se passe (backend) :**
1. Vérification que le service existe
2. Vérification qu'un chat n'existe pas déjà pour ce service entre vous deux
3. **Si chat existe :** Récupère le chat existant
4. **Si chat n'existe pas :** Crée un nouveau chat
5. Redirection automatique vers la conversation

**Sécurité :**
- Impossible de se contacter soi-même
- Impossible de créer plusieurs chats pour le même service
- Seuls les participants peuvent accéder au chat

---

### 4️⃣ Converser en Temps Réel

**Page :** `/chat?id={chatId}`

**Interface :**
- 📋 **Carte rappel** en haut : "Au sujet de : [Titre du service]"
- 💬 **Zone de messages :**
  - Vos messages : Bulles bleues à droite
  - Messages de l'autre : Bulles blanches à gauche
  - Timestamp pour chaque message (HH:MM)
- ⌨️ **Input de saisie** en bas :
  - Champ de texte multi-lignes
  - Bouton d'envoi (désactivé si vide)
  - Indicateur de chargement pendant l'envoi

**Fonctionnalités :**
- ✅ Scroll automatique vers le dernier message
- ✅ Messages s'affichent instantanément après envoi
- ✅ Limite de 500 caractères par message
- ✅ Design responsive (fonctionne sur mobile et web)

---

### 5️⃣ Retrouver Ses Conversations

**Page :** Onglet Messages (navigation du bas)

**Ce qui est affiché :**
- Liste de toutes vos conversations
- Pour chaque conversation :
  - 👤 Photo/initiales de l'autre utilisateur
  - 📝 Nom de l'autre utilisateur
  - 💬 Dernier message échangé
  - 📋 Titre du service concerné
  - ⏰ Timestamp ("Il y a Xh", "Hier", etc.)

**Fonctionnalités :**
- ✅ Pull-to-refresh pour actualiser
- ✅ Barre de recherche pour filtrer
- ✅ Clic sur une conversation → Reprend le chat
- ✅ Tri par activité récente

---

## 🔧 API Endpoints (Backend)

### Créer/Récupérer un Chat
```
POST /api/chats
Body: {
  "serviceId": "uuid",
  "participantId": "uuid"
}
```
**Réponse :** Objet chat (nouveau ou existant)

### Lister Mes Conversations
```
GET /api/chats
```
**Réponse :** Array de chats avec infos enrichies

### Récupérer les Messages d'un Chat
```
GET /api/chats/{chatId}/messages
```
**Réponse :** Array de messages triés par date

### Envoyer un Message
```
POST /api/chats/{chatId}/messages
Body: {
  "content": "Mon message"
}
```
**Réponse :** Message créé

---

## 📊 Structure des Données

### Collection `chats`
```json
{
  "_id": "uuid",
  "serviceId": "uuid",
  "serviceTitle": "Titre du service",
  "participants": ["userId1", "userId2"],
  "createdAt": "ISO date",
  "lastMessage": "Dernier message texte",
  "lastMessageAt": "ISO date"
}
```

### Collection `messages`
```json
{
  "_id": "uuid",
  "chatId": "uuid",
  "senderId": "uuid",
  "senderName": "Nom complet",
  "content": "Texte du message",
  "createdAt": "ISO date"
}
```

---

## 🔒 Règles de Sécurité

### Protection Anti-Spam
- ✅ Un seul chat par service entre 2 utilisateurs
- ✅ Impossible de créer plusieurs chats pour le même service

### Contrôle d'Accès
- ✅ Seuls les participants peuvent lire les messages
- ✅ Seuls les participants peuvent envoyer des messages
- ✅ Vérification du token JWT pour chaque requête

### Validation des Données
- ✅ Service doit exister avant création du chat
- ✅ Messages limités à 500 caractères
- ✅ Vérification que les participants existent

---

## 🧪 Scénarios de Test

### Test 1 : Flux Complet (Utilisateur A)
1. Se connecter
2. Parcourir les annonces sur l'accueil
3. Cliquer sur une annonce créée par un autre utilisateur
4. Vérifier que les détails s'affichent correctement
5. Cliquer sur "Contacter pour un échange"
6. Vérifier la redirection vers la page de chat
7. Envoyer un message : "Bonjour, je suis intéressé !"
8. Vérifier que le message s'affiche
9. Aller dans l'onglet Messages
10. Vérifier que la conversation apparaît

### Test 2 : Réponse (Utilisateur B)
1. Se connecter avec le compte du créateur de l'annonce
2. Aller dans l'onglet Messages
3. Voir la nouvelle conversation
4. Cliquer dessus
5. Lire le message de l'Utilisateur A
6. Répondre : "Bonjour ! Oui, disponible demain ?"
7. Vérifier que la réponse s'affiche

### Test 3 : Protection Anti-Doublon
1. Utilisateur A retourne sur l'annonce
2. Clique à nouveau sur "Contacter pour un échange"
3. Vérifier qu'il est redirigé vers le chat EXISTANT
4. Vérifier que les messages précédents sont toujours là

### Test 4 : Propre Annonce
1. Créer une nouvelle annonce
2. Aller sur l'accueil
3. Cliquer sur sa propre annonce
4. Vérifier que le bouton "Contacter" N'APPARAIT PAS
5. Vérifier que seul le bouton "Supprimer" est visible (si c'est votre annonce)

---

## 🎨 Design & UX

### Couleurs
- **Mes messages :** Fond rose (Colors.primary), texte blanc
- **Messages reçus :** Fond blanc, texte noir
- **Carte service :** Fond beige (#FFF7ED), texte marron

### Animations
- Scroll automatique vers le bas à l'envoi
- Indicateur de chargement pendant l'envoi
- Pull-to-refresh sur la liste des conversations

### Accessibilité
- Contraste suffisant pour la lisibilité
- Touch targets d'au moins 44x44px
- Messages scrollables avec geste naturel

---

## 🐛 Résolution de Problèmes

### "Service introuvable"
**Cause :** Le service a été supprimé ou l'ID est invalide  
**Solution :** Redirection automatique vers l'accueil

### "Impossible de créer la conversation"
**Cause :** Problème de connexion ou permissions  
**Solution :** Vérifier la connexion et réessayer

### Les conversations ne s'affichent pas
**Cause :** Aucun chat créé encore  
**Solution :** Contacter quelqu'un via une annonce d'abord

### Les messages ne s'envoient pas
**Cause :** Token expiré ou connexion perdue  
**Solution :** Se reconnecter

---

## ✅ Checklist de Validation

- [ ] Les annonces sont cliquables depuis l'accueil
- [ ] La page de détails affiche toutes les informations
- [ ] Le bouton "Contacter" crée bien un chat
- [ ] La redirection vers le chat fonctionne
- [ ] Les messages s'envoient et s'affichent
- [ ] La liste des conversations se charge
- [ ] On peut reprendre une conversation existante
- [ ] Pas de doublon de chat pour le même service
- [ ] Impossible de contacter sa propre annonce
- [ ] Le scroll automatique fonctionne
- [ ] Les timestamps sont corrects

---

**🎉 Le système de messagerie est complet et fonctionnel !**
