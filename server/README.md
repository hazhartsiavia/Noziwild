# API Noziwild (Express + MySQL)

Cette API enregistre dans MySQL les formulaires envoyés depuis le site React (dossier `client/`).

## Démarrer en local

1. Démarrer **MySQL** dans le panneau XAMPP.
2. Dans le dossier `server/` :

```bash
npm install
cp .env.example .env     # puis remplir ADMIN_TOKEN (et DB_PASSWORD si besoin)
npm run db:init          # crée la base "noziwild", ses tables et les circuits de départ (à relancer après une mise à jour : sans risque)
npm run dev              # lance l'API sur http://localhost:5002 (redémarre à chaque modification)
```

3. Dans un autre terminal, dans `client/` : `npm run dev`.
   Vite redirige automatiquement les appels `/api/...` vers le port 5002.

Vérification rapide : ouvrir http://localhost:5002/api/health, qui doit répondre `{"ok":true,"database":"connected"}`.

## Organisation

```
server/
├── sql/schema.sql              Tables MySQL
├── sql/circuits.seed.json      Circuits de départ (chargés par db:init si la table est vide)
├── uploads/circuits/           Photos des circuits de départ (servies sur /uploads/...)
├── uploads/files/              Photos envoyées par l'admin (hors git)
└── src/
    ├── server.js               Point d'entrée (Express, CORS, JSON)
    ├── config/db.js            Connexion MySQL (pool)
    ├── routes/index.js         Liste des routes /api/...
    ├── controllers/            Logique de chaque route
    ├── middlewares/            Erreurs, anti-spam, session, accès admin
    └── utils/                  Validation, session (JWT), création de la base
```

## Routes

| Méthode | Route | Page du site | Corps JSON |
|---|---|---|---|
| GET  | `/api/health` | | |
| POST | `/api/contact` | Contact | `name`, `email`, `message`, `phone?`, `inquiry?` |
| POST | `/api/tailor-made` | Tailor Made | `name`, `email`, `phone?`, `interests[]`, `length`, `month`, `pace`, `comfort`, `group`, `notes?` |
| POST | `/api/requests` | PlaceDetail, Equipment, Food, Travel planning, CircuitDetail | `type` (`place`, `gear`, `food`, `trip`, `circuit`), `email`, `name?`, `subject?`, `message?` |
| POST | `/api/newsletter` | Guides | `email` |
| GET  | `/api/admin/:resource` | Équipe Noziwild | `resource` = `contacts`, `tailor-made`, `requests`, `newsletter`, `users` |

Les routes `/api/admin/...` sont réservées aux comptes `admin`, ou à l'en-tête `Authorization: Bearer <ADMIN_TOKEN>`.
Elles acceptent `?page=1&limit=20`.

```bash
curl http://localhost:5002/api/admin/contacts -H "Authorization: Bearer TON_TOKEN"
```

Les formulaires sont limités à 20 envois par adresse IP toutes les 10 minutes.

## Circuits

Les circuits (textes, prix, itinéraire jour par jour, photos) sont dans MySQL :
table `circuits`, et table `circuit_days` pour les jours de l'itinéraire.
Au premier `npm run db:init`, les 6 circuits de `sql/circuits.seed.json` sont ajoutés.

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/circuits` | Liste des circuits publiés (cartes de /circuits) |
| GET | `/api/circuits/:slug` | Détail complet + `related` (3 autres circuits, même région d'abord) |
| GET | `/api/admin/circuits` | Tous les circuits, publiés ou non |
| GET | `/api/admin/circuits/:slug` | Détail d'un circuit, même non publié |
| POST | `/api/admin/circuits` | Crée un circuit |
| PUT | `/api/admin/circuits/:slug` | Remplace un circuit (le slug peut changer) |
| DELETE | `/api/admin/circuits/:slug` | Supprime un circuit et ses jours |
| POST | `/api/admin/uploads` | Envoie une photo (champ `image`, JPEG/PNG/WebP, 8 Mo max) et renvoie son chemin |

Les routes `/api/admin/...` demandent un compte `admin` ou l'en-tête `Authorization: Bearer <ADMIN_TOKEN>`.

Pour modifier un circuit, le plus simple est de partir de sa version actuelle :

```bash
# 1. Récupérer le circuit
curl http://localhost:5002/api/admin/circuits/nosy-be-and-nosy-iranja -H "Authorization: Bearer TON_TOKEN" -o circuit.json
# 2. Garder seulement l'objet "circuit" du fichier, le modifier, puis le renvoyer
curl -X PUT http://localhost:5002/api/admin/circuits/nosy-be-and-nosy-iranja   -H "Authorization: Bearer TON_TOKEN" -H "Content-Type: application/json" --data-binary @circuit.json
```

Ajouter une photo puis l'utiliser dans un circuit (`image`, `gallery` ou `itinerary[].images`) :

```bash
curl http://localhost:5002/api/admin/uploads -H "Authorization: Bearer TON_TOKEN" -F "image=@baobabs.jpg"
# → {"ok":true,"path":"/uploads/files/1791888122484-1bf76ec67841.jpg"}
```

Champs d'un circuit : `slug`, `title`, `region`, `days`, `level`, `price` (euros, entier), `stops`, `summary`,
`groupSize`, `tourType`, `start`, `end`, `bestTime`, `tip`, `image`, `gallery[]`, `overview[]`, `highlights[]`,
`included[]`, `excluded[]`, `sortOrder`, `isPublished`, et `itinerary[]` avec pour chaque jour
`day` ("Day 1"), `title`, `text`, `stay`, `meals`, `images[]`. Un champ invalide renvoie une erreur 400 qui le nomme.

Les réservations et questions envoyées depuis une page circuit arrivent dans `quick_requests` (type `circuit`).

## Authentification

| Méthode | Route | Corps JSON | Rôle |
|---|---|---|---|
| POST | `/api/auth/register` | `name`, `email`, `password` | Crée un compte et connecte |
| POST | `/api/auth/login` | `email`, `password` | Connexion par email |
| POST | `/api/auth/google` | `credential` | Connexion avec Google |
| POST | `/api/auth/logout` | | Déconnexion |
| GET  | `/api/auth/me` | | Utilisateur connecté, ou `null` |
| GET  | `/api/auth/config` | | Indique au site si Google est configuré |
| POST | `/api/auth/forgot-password` | `email` | Envoie un lien de réinitialisation (valable 1 h) |
| POST | `/api/auth/reset-password` | `token`, `password` | Nouveau mot de passe, puis connecte |

Compte de l'utilisateur connecté (page `/account`) :

| Méthode | Route | Corps JSON | Rôle |
|---|---|---|---|
| PATCH  | `/api/account` | `name` | Modifie le nom |
| POST   | `/api/account/password` | `currentPassword?`, `newPassword` | Change le mot de passe, ou en crée un (compte Google) |
| POST   | `/api/account/google` | `credential` | Relie un compte Google |
| DELETE | `/api/account/google` | | Détache Google (seulement s'il y a un mot de passe) |
| GET    | `/api/account/requests` | | Demandes envoyées (contact, sur mesure, demandes rapides) |
| DELETE | `/api/account` | `password` ou `confirmEmail` | Supprime le compte |

Fonctionnement :

- La session est un jeton JWT rangé dans un cookie `httpOnly`, valable `SESSION_DAYS` jours.
- Les mots de passe sont hachés avec bcrypt. Ils ne sont jamais renvoyés par l'API.
- Changer ou réinitialiser son mot de passe déconnecte tous les autres appareils (`users.session_version`).
- Avec Google, le serveur vérifie le jeton auprès de Google avant de connecter. Si un compte existe déjà avec le même email, Google y est rattaché.
  Si ce compte avait un mot de passe mais que son email n'avait jamais été vérifié, ce mot de passe est retiré :
  sinon quelqu'un aurait pu créer un compte à l'adresse d'autrui avant lui et en garder l'accès.
  L'utilisateur peut ensuite en définir un nouveau depuis sa page Compte.
- Un email est considéré vérifié après une connexion Google ou un lien de réinitialisation utilisé.
  Les demandes envoyées auparavant avec cette adresse sont alors rattachées au compte.
- Les formulaires envoyés en étant connecté sont rattachés au compte (`user_id`) et visibles sur `/account`.
- Les requêtes qui modifient des données sont refusées si elles viennent d'un autre site (en-tête `Origin`, protection CSRF).
- Les routes de connexion sont limitées à 10 tentatives par adresse IP toutes les 15 minutes, « mot de passe oublié » à 5 par heure.

### Emails « mot de passe oublié »

Sans configuration, le lien est affiché dans la console du serveur (pratique en local).
Pour de vrais envois, remplir `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` et `MAIL_FROM` dans `.env`.
Avec Gmail : activer la validation en deux étapes, puis créer un « mot de passe d'application » dans
Compte Google > Sécurité, et l'utiliser comme `SMTP_PASS` (`SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`).

Pour rendre un compte administrateur :

```sql
UPDATE users SET role = 'admin' WHERE email = 'ton.email@exemple.com';
```

### Activer la connexion Google

1. Aller sur https://console.cloud.google.com et créer un projet.
2. Menu **API et services > Écran de consentement OAuth** : type « Externe », remplir le nom de l'application et l'email.
3. Menu **API et services > Identifiants > Créer des identifiants > ID client OAuth** :
   - type : **Application Web** ;
   - **Origines JavaScript autorisées** : `http://localhost:5173` et `http://localhost`, plus l'adresse du site en production.
4. Copier l'**ID client** (il finit par `.apps.googleusercontent.com`) dans `server/.env` :

```
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
```

5. Redémarrer l'API. Le bouton « Continue with Google » apparaît sur `/login`, `/register` et `/account`.
6. Tant que l'application est « En test » dans l'écran de consentement, seuls les **utilisateurs test** listés peuvent se connecter.
   Pour ouvrir à toutes les adresses Google : **Écran de consentement > Publier l'application**.
   Avec seulement l'email, le nom et la photo (les autorisations par défaut), Google ne demande pas de vérification.

Aucun secret client n'est nécessaire : le site reçoit un jeton d'identité de Google, et le serveur le vérifie avec l'ID client.

### En production

- Mettre `COOKIE_SECURE=true` (le site doit être en HTTPS).
- Mettre l'adresse du site dans `CLIENT_URL` (plusieurs adresses possibles, séparées par des virgules ; la première sert aux liens envoyés par email).
- Si l'API est sur un autre domaine que le site, définir `VITE_API_URL` côté client.
