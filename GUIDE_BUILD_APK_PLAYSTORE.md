# 📱 GUIDE COMPLET : GÉNÉRER UN APK POUR LE GOOGLE PLAY STORE

## ✅ Préparation terminée
- ✅ app.json mis à jour avec les bonnes informations Android
- ✅ eas.json créé avec la configuration de build
- ✅ Package name : `com.timeswap.app`

---

## 🚀 MÉTHODE 1 : BUILD AVEC EAS (RECOMMANDÉ - GRATUIT)

### **Étape 1 : Créer un compte Expo**
```bash
# Sur votre machine locale (pas dans Emergent)
# Créez un compte sur : https://expo.dev
```

### **Étape 2 : Installer EAS CLI**
```bash
# Sur votre machine locale
npm install -g eas-cli

# Ou avec yarn
yarn global add eas-cli
```

### **Étape 3 : Se connecter à Expo**
```bash
eas login
# Entrez vos identifiants Expo
```

### **Étape 4 : Configurer le projet**
```bash
cd /chemin/vers/votre/projet/frontend
eas build:configure
```

### **Étape 5 : Générer l'APK**
```bash
# Pour un APK de production
eas build --platform android --profile production

# OU pour un APK de test (plus rapide)
eas build --platform android --profile preview
```

**⏱️ Durée : 10-15 minutes**

### **Étape 6 : Télécharger l'APK**
- Une fois le build terminé, EAS vous donnera un lien pour télécharger l'APK
- Ou allez sur : https://expo.dev/accounts/[votre-compte]/projects/timeswap/builds

---

## 📦 MÉTHODE 2 : BUILD LOCAL (AVANCÉ)

### **Prérequis**
- Android Studio installé
- SDK Android configuré
- Java JDK installé

### **Commandes**
```bash
cd frontend
eas build --platform android --local
```

---

## 🎯 CE QUE VOUS OBTIENDREZ

### **Fichiers générés :**
- ✅ **build-xxxxx.apk** (~50-100 MB)
- Package name : `com.timeswap.app`
- Version : 1.0.0 (versionCode: 1)

---

## 📤 PUBLICATION SUR GOOGLE PLAY STORE

### **Étape 1 : Créer un compte Google Play Console**
- Allez sur : https://play.google.com/console
- Coût unique : 25 $ (frais d'inscription)

### **Étape 2 : Créer une nouvelle application**
- Nom : TimeSwap
- Langue par défaut : Français
- Type : Application
- Gratuite ou payante : Gratuite

### **Étape 3 : Remplir les informations obligatoires**
- Description courte (80 caractères max)
- Description complète (4000 caractères max)
- Captures d'écran (min. 2)
- Icône de l'application (512x512 px)
- Image de présentation (1024x500 px)

### **Étape 4 : Uploader l'APK/AAB**
- Allez dans "Production" → "Créer une version"
- Uploadez votre fichier APK/AAB
- Remplissez les notes de version

### **Étape 5 : Soumettre pour examen**
- Vérifiez toutes les sections
- Soumettez pour examen
- **Délai d'approbation : 1-7 jours**

---

## ⚠️ IMPORTANT POUR LE PLAY STORE

### **1. Depuis août 2021, Google exige un AAB (Android App Bundle)**
Pour générer un AAB au lieu d'un APK :
```json
// Dans eas.json, changez :
"production": {
  "android": {
    "buildType": "app-bundle"  // au lieu de "apk"
  }
}
```

### **2. Signature de l'application**
EAS Build gère automatiquement la signature avec des keystore sécurisés.

### **3. Permissions Android**
Votre app.json contient déjà les permissions nécessaires :
- CAMERA (pour les photos)
- READ_EXTERNAL_STORAGE (pour les images)
- WRITE_EXTERNAL_STORAGE (pour sauvegarder)
- ACCESS_FINE_LOCATION (pour la localisation)
- ACCESS_COARSE_LOCATION (pour la localisation approximative)

---

## 🆘 COMMANDES UTILES

### **Voir l'état du build**
```bash
eas build:list
```

### **Annuler un build**
```bash
eas build:cancel
```

### **Voir les logs d'un build**
```bash
eas build:view [BUILD_ID]
```

---

## 💰 COÛTS

### **EAS Build (gratuit pour les open source)**
- ✅ Builds Android : GRATUIT (30 builds/mois avec le plan gratuit)
- ✅ Builds illimités avec plan payant (29$/mois)

### **Google Play Store**
- Inscription développeur : **25 $ (paiement unique)**
- Publication : Gratuite

---

## 📋 CHECKLIST AVANT PUBLICATION

- [ ] App testée sur plusieurs appareils Android
- [ ] Backend en production fonctionnel (www.timeswap.fr)
- [ ] Variables d'environnement correctement configurées
- [ ] Icônes et splash screen de bonne qualité
- [ ] Description et captures d'écran préparées
- [ ] Politique de confidentialité rédigée (obligatoire)
- [ ] Conditions d'utilisation rédigées
- [ ] APK/AAB généré et testé

---

## 🔗 RESSOURCES UTILES

- Documentation EAS Build : https://docs.expo.dev/build/introduction/
- Google Play Console : https://play.google.com/console
- Expo Dev Portal : https://expo.dev
- Guide Expo Publishing : https://docs.expo.dev/distribution/app-stores/

---

## ❓ VOUS AVEZ BESOIN D'AIDE ?

### **Problème de build ?**
- Vérifiez les logs avec `eas build:list`
- Consultez la documentation Expo
- Demandez de l'aide sur le Discord Expo

### **Configuration incorrecte ?**
- Tous les fichiers sont déjà configurés dans `/app/frontend`
- app.json ✅
- eas.json ✅

---

## 🎉 PROCHAINES ÉTAPES

1. **Créez un compte Expo** : https://expo.dev
2. **Installez EAS CLI** : `npm install -g eas-cli`
3. **Lancez le build** : `eas build --platform android --profile production`
4. **Téléchargez l'APK** et testez-le
5. **Créez un compte Google Play Console** (25$)
6. **Publiez votre application** 🚀

Bonne chance avec la publication de TimeSwap sur le Play Store ! 📱✨
