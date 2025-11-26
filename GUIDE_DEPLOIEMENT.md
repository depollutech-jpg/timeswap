# 🚀 Guide de Déploiement Backend TimeSwap sur Emergent

## ✅ Pré-vérification (Déjà fait)
- ✅ Aucun hardcoding d'URLs détecté
- ✅ Variables d'environnement correctement configurées
- ✅ requirements.txt à jour
- ✅ Backend fonctionnel en développement

---

## 📋 Étape 1 : Déployer sur Emergent

### Dans l'interface Emergent :

1. **Localisez le bouton "Deploy"** dans l'interface
2. **Cliquez sur "Deploy Now"**
3. **Attendez 10-15 minutes** pendant le processus de déploiement
4. **Notez l'URL** de votre backend déployé (format : `https://votre-app.emergent.sh`)

### Variables d'environnement à configurer après déploiement :

Les variables suivantes sont déjà dans votre `.env` et seront automatiquement utilisées :
- `MONGO_URL` → Sera configuré automatiquement par Emergent
- `DB_NAME=timeswap`
- `JWT_SECRET=timeswap_secret_key_change_in_production_2025`
- `STRIPE_API_KEY=sk_test_emergent`

⚠️ **Important :** Changez `JWT_SECRET` après le déploiement pour la production !

---

## 📱 Étape 2 : Configurer votre App Mobile

### Une fois votre backend déployé, vous devrez :

1. **Obtenir l'URL de votre backend déployé**
   - Exemple : `https://timeswap-api.emergent.sh`

2. **Mettre à jour le fichier frontend/.env**
   ```bash
   EXPO_PUBLIC_BACKEND_URL=https://votre-backend.emergent.sh
   ```

3. **Redémarrer Expo**
   ```bash
   cd /app/frontend
   sudo supervisorctl restart expo
   ```

---

## 🧪 Étape 3 : Tester votre Backend Déployé

### Test avec curl :
```bash
# Test de santé
curl https://votre-backend.emergent.sh/api/health

# Test d'enregistrement
curl -X POST https://votre-backend.emergent.sh/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

---

## 📊 Coûts

- **Déploiement Backend** : 50 crédits/mois
- **Inclus** : 
  - Backend FastAPI hébergé
  - Base de données MongoDB
  - URL publique HTTPS
  - Certificat SSL automatique

---

## 🔐 Sécurité - À FAIRE APRÈS LE DÉPLOIEMENT

### 1. Changer le JWT_SECRET
Dans l'interface Emergent, configurez une nouvelle variable :
```
JWT_SECRET=votre_secret_super_securise_ici_xxxxx
```

### 2. Configurer CORS si nécessaire
Si vous rencontrez des problèmes de CORS, vérifiez dans `server.py` :
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À restreindre en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📱 Distribution de l'App Mobile

### Option A : Tests avec Expo Go (Actuel)
1. Partagez le QR code Expo avec vos testeurs
2. Ils scannent avec Expo Go
3. L'app se connecte à votre backend déployé

### Option B : Build Production (Futur)
Pour publier sur les stores :
```bash
# Installer EAS CLI
npm install -g eas-cli

# Login
eas login

# Configurer le projet
eas build:configure

# Build Android
eas build --platform android

# Build iOS (nécessite compte Apple Developer)
eas build --platform ios
```

---

## 🆘 Troubleshooting

### Problème : L'app mobile ne se connecte pas au backend
**Solution :**
1. Vérifiez que `EXPO_PUBLIC_BACKEND_URL` est correctement configuré
2. Assurez-vous que l'URL se termine par `/api` pour les appels API
3. Redémarrez Expo : `sudo supervisorctl restart expo`

### Problème : Erreur 500 sur le backend
**Solution :**
1. Vérifiez les logs dans l'interface Emergent
2. Assurez-vous que MongoDB est bien connecté
3. Vérifiez que toutes les variables d'environnement sont configurées

### Problème : CORS errors
**Solution :**
1. Vérifiez la configuration CORS dans `server.py`
2. Assurez-vous que l'origine de votre app mobile est autorisée

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans l'interface Emergent
2. Testez les endpoints avec curl
3. Contactez le support Emergent si nécessaire

---

## ✅ Checklist Finale

Avant de considérer le déploiement comme réussi :

- [ ] Backend déployé et accessible via l'URL publique
- [ ] Endpoints API répondent correctement (test avec curl)
- [ ] App mobile configurée avec la nouvelle URL
- [ ] Tests de connexion réussis (login/register)
- [ ] JWT_SECRET changé en production
- [ ] Données de test créées
- [ ] QR Code Expo partagé avec les testeurs

---

🎉 **Votre backend TimeSwap sera prêt pour la production !**
