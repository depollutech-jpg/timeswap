# 📘 GUIDE COMPLET : HÉBERGER SUR GITHUB PAGES

## 🎯 OBJECTIF
Héberger gratuitement privacy.html et terms.html sur GitHub Pages pour obtenir les URLs :
- https://[votre-username].github.io/timeswap-legal/privacy.html
- https://[votre-username].github.io/timeswap-legal/terms.html

---

## 📋 ÉTAPE 1 : CRÉER LE REPO GITHUB

### 1.1 Créer un compte GitHub (si vous n'en avez pas)
- Allez sur : https://github.com/signup
- Créez un compte gratuit

### 1.2 Créer le nouveau repo
1. **Cliquez sur le "+" en haut à droite**
2. **Sélectionnez "New repository"**
3. **Remplissez** :
   - **Repository name** : `timeswap-legal`
   - **Description** : "Legal documents for TimeSwap app"
   - **Public** ✅ (obligatoire pour GitHub Pages gratuit)
   - **Add a README file** ✅ (cochez cette case)
4. **Cliquez sur "Create repository"**

---

## 📤 ÉTAPE 2 : UPLOADER LES FICHIERS HTML

### Méthode A : Upload via interface web (PLUS SIMPLE)

1. **Dans votre repo, cliquez sur "Add file" → "Upload files"**

2. **Glissez-déposez ces 2 fichiers** :
   - `/app/privacy.html` (depuis votre machine locale)
   - `/app/terms.html` (depuis votre machine locale)

3. **Ajoutez un message de commit** :
   ```
   Add legal documents (privacy policy and terms of service)
   ```

4. **Cliquez sur "Commit changes"**

### Méthode B : Via Git (si vous êtes à l'aise)

```bash
# 1. Cloner le repo
git clone https://github.com/[votre-username]/timeswap-legal.git
cd timeswap-legal

# 2. Copier les fichiers HTML
cp /app/privacy.html .
cp /app/terms.html .

# 3. Ajouter et commiter
git add privacy.html terms.html
git commit -m "Add legal documents"

# 4. Pousser
git push origin main
```

---

## 🌐 ÉTAPE 3 : ACTIVER GITHUB PAGES

1. **Dans votre repo, cliquez sur "Settings"** (⚙️ en haut à droite)

2. **Dans le menu de gauche, cliquez sur "Pages"**

3. **Sous "Source", sélectionnez** :
   - **Branch** : `main`
   - **Folder** : `/ (root)`

4. **Cliquez sur "Save"**

5. **Attendez 2-3 minutes** ⏱️

6. **Rafraîchissez la page**

7. **Vous verrez un message** :
   ```
   ✅ Your site is live at https://[votre-username].github.io/timeswap-legal/
   ```

---

## ✅ ÉTAPE 4 : VÉRIFIER LES URLs

Testez que vos pages fonctionnent :

**Politique de confidentialité :**
```
https://[votre-username].github.io/timeswap-legal/privacy.html
```

**Conditions d'utilisation :**
```
https://[votre-username].github.io/timeswap-legal/terms.html
```

**Si ça ne marche pas immédiatement** :
- Attendez 5 minutes de plus (propagation DNS)
- Vérifiez que les fichiers sont bien à la racine du repo
- Vérifiez que le repo est bien public

---

## 📝 ÉTAPE 5 : AMÉLIORER (OPTIONNEL)

### 5.1 Créer une page d'index (optionnel)

Créez un fichier `index.html` pour avoir une page d'accueil :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documents Légaux - TimeSwap</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            text-align: center;
        }
        h1 {
            color: #3EADAD;
        }
        a {
            display: block;
            padding: 15px;
            margin: 10px 0;
            background: #3EADAD;
            color: white;
            text-decoration: none;
            border-radius: 5px;
        }
        a:hover {
            background: #2c8f8f;
        }
    </style>
</head>
<body>
    <h1>📄 Documents Légaux TimeSwap</h1>
    <p>Documents légaux pour l'application mobile TimeSwap</p>
    <a href="privacy.html">🔒 Politique de Confidentialité</a>
    <a href="terms.html">📜 Conditions Générales d'Utilisation</a>
    <p style="margin-top: 50px; color: #666;">
        <a href="https://timeswap.fr" style="background: transparent; color: #3EADAD;">← Retour sur TimeSwap.fr</a>
    </p>
</body>
</html>
```

### 5.2 Ajouter un nom de domaine personnalisé (avancé)

Si vous voulez utiliser votre propre domaine :
1. Settings → Pages → Custom domain
2. Entrez : `legal.timeswap.fr`
3. Configurez le DNS chez votre fournisseur

---

## 🎯 RÉCAPITULATIF FINAL

Une fois GitHub Pages activé, vous aurez :

✅ **URL Politique de confidentialité** :
```
https://[votre-username].github.io/timeswap-legal/privacy.html
```

✅ **URL Conditions d'utilisation** :
```
https://[votre-username].github.io/timeswap-legal/terms.html
```

**Ces URLs sont à mettre dans Google Play Console** lors de la publication de votre app.

---

## 💡 AVANTAGES DE GITHUB PAGES

✅ **Gratuit** : Hébergement illimité
✅ **Rapide** : Déploiement automatique
✅ **Fiable** : Infrastructure GitHub
✅ **HTTPS** : Sécurisé par défaut
✅ **Simple** : Aucune configuration serveur nécessaire

---

## ❓ PROBLÈMES COURANTS

### "404 - File not found"
- Vérifiez que les fichiers sont à la racine du repo
- Vérifiez l'orthographe des noms de fichiers (sensible à la casse)
- Attendez 5 minutes de plus

### "Your site is not published yet"
- Le repo est-il public ?
- Avez-vous bien sélectionné la branch "main" ?
- Attendez 5 minutes

### "403 Forbidden"
- Le repo doit être public pour GitHub Pages gratuit
- Settings → Danger Zone → Change repository visibility → Public

---

## 📞 BESOIN D'AIDE ?

- Documentation GitHub Pages : https://pages.github.com/
- Support GitHub : https://github.com/contact

---

**Temps estimé : 10-15 minutes** ⏱️

Bonne chance ! 🚀
