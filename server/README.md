# API Noziwild (Express + MySQL)

Cette API enregistre dans MySQL les formulaires envoyés depuis le site React (dossier `client/`).

## Démarrer en local

1. Démarrer **MySQL** dans le panneau XAMPP.
2. Dans le dossier `server/` :

```bash
npm install
cp .env.example .env     # puis remplir JWT_SECRET, ADMIN_TOKEN (et DB_PASSWORD si besoin)
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
├── uploads/files/              Photos envoyées par l'admin (hors git ; dossier réglable, voir UPLOADS_FILES_DIR)
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

## Espace admin du site (/admin)

Le site a un espace d'administration sur `/admin`, réservé aux comptes `admin` :

- **Circuits** : publier / masquer, changer l'ordre, créer, modifier (textes, photos, itinéraire jour par jour), supprimer.
- **Inbox** : demandes reçues (formulaires, demandes de circuits, sur-mesure, contact), newsletter, comptes.

Pour donner l'accès à un compte (il doit d'abord exister : inscription sur `/register` ou connexion Google) :

```bash
npm run make-admin -- ton.email@exemple.com
npm run make-admin -- ton.email@exemple.com --remove   # retirer l'accès
```

Le rôle est relu à chaque requête : il suffit de recharger la page, pas besoin de se reconnecter.

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
| PATCH | `/api/admin/circuits/:slug` | Réglages rapides : `isPublished`, `sortOrder` |
| DELETE | `/api/admin/circuits/:slug` | Supprime un circuit et ses jours |
| GET | `/api/admin/uploads` | Bibliothèque : toutes les photos disponibles |
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

## Langues du site

Le site public existe en anglais, français, allemand, italien et espagnol. Le visiteur choisit la langue
dans la barre du haut ; elle est gardée dans son navigateur (à la première visite : la langue du navigateur).
Les adresses des pages ne changent pas. L'espace `/admin` reste en une seule langue.

**Textes des pages** : `client/src/i18n/locales/<langue>/<page>.json` (`en`, `fr`, `de`, `it`, `es`).
L'anglais est la référence : un texte absent dans une langue s'affiche en anglais.
Après avoir ajouté ou modifié un texte, vérifier qu'il existe dans toutes les langues :

```bash
cd client
npm run i18n:check
```

**Circuits** : la version anglaise est dans les champs habituels, les autres langues dans la colonne
`circuits.translations` (JSON, par langue : mêmes champs que le circuit + `itinerary[]` jour par jour).
Dans l'admin, l'onglet *Traductions* de l'éditeur de circuit permet de les remplir ; un champ vide
s'affiche en anglais. L'API publique prend la langue en paramètre : `/api/circuits?lang=fr`,
`/api/circuits/:slug?lang=de`.

Les traductions des 6 circuits de départ sont dans `sql/circuits.translations/<langue>.json` ;
`npm run db:init` (et le démarrage du serveur) les ajoute aux circuits de départ qui n'en ont pas encore,
sans toucher aux traductions déjà saisies dans l'admin.

Les informations envoyées à l'équipe (formulaires, réservations) restent en anglais, quelle que soit la langue du visiteur.

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

## Mise en ligne (Hostinger ou tout hébergeur Node.js)

En production, **un seul serveur Node** sert tout : le site React construit (`client/dist`),
l'API (`/api/...`) et les photos (`/uploads/...`), sur la même adresse.
Les deux commandes sont à la racine du dépôt :

| Réglage | Valeur |
|---|---|
| Dossier racine | la racine du dépôt (pas `client/`) |
| Version de Node | 22 (Vite 8 demande au moins 22.12 ou 20.19) |
| Commande de build | `npm run build` (installe et construit le site, installe l'API) |
| Commande de démarrage | `npm start` (fichier d'entrée : `server/src/server.js`) |

Variables d'environnement à définir dans le panneau de l'hébergeur (pas de fichier `.env` en ligne) :

| Variable | Valeur |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | la base MySQL créée dans le panneau |
| `JWT_SECRET` | longue chaîne aléatoire (voir ci-dessous) |
| `ADMIN_TOKEN` | autre longue chaîne aléatoire |
| `CLIENT_URL` | l'adresse publique du site, ex. `https://darkslategray-mouse-542044.hostingersite.com` |
| `COOKIE_SECURE` | `true` |
| `GOOGLE_CLIENT_ID` | le même que en local |
| `SMTP_*`, `MAIL_FROM` | pour les emails « mot de passe oublié » (sinon, liens seulement dans les journaux) |
| `UPLOADS_FILES_DIR` | facultatif : dossier des photos envoyées depuis l'admin, **hors** du dossier déployé (voir ci-dessous) |

```bash
# Générer une chaîne aléatoire pour JWT_SECRET ou ADMIN_TOKEN
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Au démarrage, le serveur crée les tables et les 6 circuits de départ si la base est vide.
Vérification : `https://ton-site/api/health` doit répondre `{"ok":true,"database":"connected","uploads":"persistent"}`.

Sans accès en ligne de commande, pour donner le rôle admin, dans phpMyAdmin :

```sql
UPDATE users SET role = 'admin' WHERE email = 'ton.email@exemple.com';
```

Connexion Google en ligne : ajouter l'adresse publique (`https://...`) dans
**Origines JavaScript autorisées** du client OAuth (console Google Cloud).

### Photos envoyées depuis l'admin

Elles sont servies sur `/uploads/files/...` mais ne sont pas dans le dépôt : elles doivent vivre
dans un dossier que les déploiements n'effacent pas. Le serveur choisit, dans l'ordre :

1. `UPLOADS_FILES_DIR` s'il est défini (chemin absolu, ou relatif au dossier `server/`) ;
2. chez Hostinger, détecté tout seul (chaque déploiement arrive dans un dossier neuf
   `<domaine>/hbuilds/versions/<id>/`) : `<domaine>/noziwild-uploads`, à côté de `hbuilds/`.
   Au démarrage, les photos restées dans les anciennes versions y sont recopiées ;
3. sinon `server/uploads/files/` (en local).

Le dossier est créé au démarrage. `/api/health` indique `"uploads"` : `"persistent"` (hors du dossier
de l'application, conservé), `"local"` (dans `server/`, perdu si l'hébergeur repart du dépôt) ou `"not writable"`.
Sur un autre hébergeur qui repart du dépôt à chaque déploiement, définir `UPLOADS_FILES_DIR`
vers un dossier persistant. Les photos de départ (`uploads/circuits/`) sont dans le dépôt.

Si un jour l'API est sur un autre domaine que le site : `VITE_API_URL` côté client,
et `COOKIE_SAMESITE=none` côté serveur.
