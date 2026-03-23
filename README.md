# DADO

Flux d'inscription et de connexion pour la marketplace DADO avec Firebase Phone Auth, Firestore et dashboard par rôle.

## Structure

```txt
public/
  index.html
  register.html
  login.html
  dashboard.html
  profile.html
  assets/
    css/
    js/
      core/
      pages/
backend/
  config/
  routes/
  controllers/
  services/
  middlewares/
```

## Flow d'inscription

1. L'utilisateur remplit `register.html`.
2. Firebase envoie un OTP au numéro renseigné.
3. L'utilisateur valide le code.
4. Le frontend récupère le `uid` Firebase.
5. Le frontend appelle `POST /api/auth/register-profile` avec le token Firebase.
6. Le backend crée `users/{uid}` dans Firestore.
7. Redirection vers `profile.html` si le profil est incomplet, sinon `dashboard.html`.

## Variables / prérequis backend

Le backend utilise `firebase-admin` avec `applicationDefault()`. Configurez au minimum :

- `GOOGLE_APPLICATION_CREDENTIALS=/chemin/service-account.json`
- `PORT=3000` (optionnel)

## Lancer le projet

```bash
npm install
npm run dev
```
