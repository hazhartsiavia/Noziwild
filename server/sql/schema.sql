-- Base de données du site Noziwild
CREATE DATABASE IF NOT EXISTS noziwild
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE noziwild;

-- Comptes utilisateurs
--   password_hash : NULL si le compte a été créé avec Google
--   google_id     : identifiant Google ("sub"), NULL si compte email uniquement
--   email_verified_at : date à laquelle on a eu la preuve que l'email appartient à l'utilisateur
--                       (connexion Google ou lien de réinitialisation reçu par email)
--   session_version   : augmente à chaque changement de mot de passe, ce qui déconnecte
--                       toutes les anciennes sessions
--   disabled_at       : compte suspendu depuis l'admin (plus de connexion possible), NULL sinon
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NULL,
  google_id     VARCHAR(64)  NULL UNIQUE,
  avatar_url    VARCHAR(500) NULL,
  role          ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  email_verified_at TIMESTAMP NULL,
  session_version   INT UNSIGNED NOT NULL DEFAULT 0,
  disabled_at       TIMESTAMP    NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP    NULL
) ENGINE=InnoDB;

-- Liens "mot de passe oublié" : on ne stocke que l'empreinte SHA-256 du jeton envoyé par email
CREATE TABLE IF NOT EXISTS password_resets (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  token_hash CHAR(64)     NOT NULL UNIQUE,
  expires_at TIMESTAMP    NOT NULL,
  used_at    TIMESTAMP    NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reset_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Formulaire de la page Contact
--   user_id : compte connecté au moment de l'envoi (NULL si visiteur anonyme)
CREATE TABLE IF NOT EXISTS contact_messages (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED NULL,
  name         VARCHAR(120) NOT NULL,
  email        VARCHAR(190) NOT NULL,
  phone        VARCHAR(40)  NULL,
  inquiry_type VARCHAR(60)  NULL,
  message      TEXT         NOT NULL,
  status       ENUM('new', 'read', 'answered') NOT NULL DEFAULT 'new',
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_contact_created (created_at),
  INDEX idx_contact_user (user_id),
  CONSTRAINT fk_contact_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Demandes de voyage sur mesure (page Tailor Made)
CREATE TABLE IF NOT EXISTS tailor_made_requests (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED NULL,
  name         VARCHAR(120) NOT NULL,
  email        VARCHAR(190) NOT NULL,
  phone        VARCHAR(40)  NULL,
  interests    TEXT         NULL,
  trip_length  VARCHAR(60)  NULL,
  travel_month VARCHAR(30)  NULL,
  pace         VARCHAR(60)  NULL,
  comfort      VARCHAR(60)  NULL,
  travel_group VARCHAR(60)  NULL,
  notes        TEXT         NULL,
  status       ENUM('new', 'in_progress', 'done') NOT NULL DEFAULT 'new',
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tailor_created (created_at),
  INDEX idx_tailor_user (user_id),
  CONSTRAINT fk_tailor_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Petites demandes rapides envoyées depuis les autres pages :
--   place : question sur un lieu (PlaceDetail)
--   gear  : équipement manquant (EquipmentRentals)
--   food  : voyage gastronomique (FoodDining)
--   trip  : idée de voyage (Travelplanning)
--   circuit : réservation ou question sur un circuit (CircuitDetail)
CREATE TABLE IF NOT EXISTS quick_requests (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NULL,
  type       ENUM('place', 'gear', 'food', 'trip', 'circuit') NOT NULL,
  email      VARCHAR(190) NOT NULL,
  name       VARCHAR(120) NULL,
  subject    VARCHAR(190) NULL,
  message    TEXT         NULL,
  status     ENUM('new', 'in_progress', 'done') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_quick_type (type),
  INDEX idx_quick_created (created_at),
  INDEX idx_quick_user (user_id),
  CONSTRAINT fk_quick_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Demandes de devis de la page « Mon voyage » : tout ce que le visiteur a mis de côté sur le site,
-- envoyé en une seule fois. Les éléments sont dans quote_items.
--   estimate : total indicatif en euros au moment de l'envoi (NULL si aucun prix connu)
--   lang     : langue du site au moment de l'envoi, pour répondre dans la bonne langue
--   status   : new → quoted (devis envoyé) → accepted | declined
CREATE TABLE IF NOT EXISTS quote_requests (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED NULL,
  name           VARCHAR(120) NOT NULL,
  email          VARCHAR(190) NOT NULL,
  phone          VARCHAR(40)  NULL,
  arrival_date   DATE         NULL,
  departure_date DATE         NULL,
  travellers     TINYINT UNSIGNED NULL,
  budget         VARCHAR(60)  NULL,
  message        TEXT         NULL,
  lang           CHAR(2)      NOT NULL DEFAULT 'en',
  estimate       INT UNSIGNED NULL,
  status         ENUM('new', 'quoted', 'accepted', 'declined') NOT NULL DEFAULT 'new',
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_quote_created (created_at),
  INDEX idx_quote_user (user_id),
  CONSTRAINT fk_quote_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Éléments d'une demande de devis, dans l'ordre de `position`
--   kind : circuit | activity | excursion | cruise | longstay | place | stay | food | gear | ticket | photo | guide | transport | plan
--   ref  : identifiant de l'offre sur le site (slug d'un circuit, id d'une offre...)
--   title, details : copiés au moment de l'envoi, dans la langue du visiteur
--   unit : person (prix par personne × quantity) | night (prix par nuit × quantity) | unit (prix × quantity)
--          | fixed (prix total) ; NULL = sur devis
CREATE TABLE IF NOT EXISTS quote_items (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  quote_id   INT UNSIGNED NOT NULL,
  position   TINYINT UNSIGNED NOT NULL,
  kind       VARCHAR(20)  NOT NULL,
  ref        VARCHAR(120) NULL,
  title      VARCHAR(190) NOT NULL,
  details    VARCHAR(500) NULL,
  item_date  DATE         NULL,
  quantity   SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  unit       VARCHAR(10)  NULL,
  unit_price INT UNSIGNED NULL,
  note       VARCHAR(500) NULL,
  INDEX idx_item_quote (quote_id, position),
  CONSTRAINT fk_item_quote FOREIGN KEY (quote_id) REFERENCES quote_requests (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Inscriptions à la newsletter (page Guides)
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(190) NOT NULL UNIQUE,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Circuits (pages /circuits et /circuits/:slug)
--   Les listes (paragraphes, points forts, inclus, photos...) sont rangées en JSON :
--   elles s'affichent toujours en entier, jamais filtrées en SQL.
--   Les photos sont des chemins servis par l'API, ex. /uploads/circuits/ramena.jpg
--   Les textes sont en anglais ; translations contient les autres langues (fr, de, it, es),
--   jours de l'itinéraire compris : { "fr": { "title": ..., "itinerary": [{ "title": ... }] } }
CREATE TABLE IF NOT EXISTS circuits (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug           VARCHAR(120) NOT NULL UNIQUE,
  title          VARCHAR(190) NOT NULL,
  region         VARCHAR(60)  NOT NULL,
  days           TINYINT UNSIGNED NOT NULL,
  level          VARCHAR(40)  NOT NULL,
  price          INT UNSIGNED NOT NULL,
  stops          VARCHAR(255) NOT NULL,
  summary        VARCHAR(500) NOT NULL,
  group_size     VARCHAR(80)  NULL,
  tour_type      VARCHAR(80)  NULL,
  start_location VARCHAR(190) NOT NULL,
  end_location   VARCHAR(190) NOT NULL,
  best_time      VARCHAR(120) NULL,
  tip            TEXT         NULL,
  cover_image    VARCHAR(500) NOT NULL,
  gallery        JSON         NOT NULL,
  overview       JSON         NOT NULL,
  highlights     JSON         NOT NULL,
  included       JSON         NOT NULL,
  excluded       JSON         NOT NULL,
  translations   JSON         NULL,
  sort_order     INT          NOT NULL DEFAULT 0,
  is_published   TINYINT(1)   NOT NULL DEFAULT 1,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_circuits_order (is_published, sort_order)
) ENGINE=InnoDB;

-- Jours de l'itinéraire d'un circuit, dans l'ordre de `position`
--   day_label : "Day 1", "Days 4 – 5"...
CREATE TABLE IF NOT EXISTS circuit_days (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  circuit_id INT UNSIGNED NOT NULL,
  position   SMALLINT UNSIGNED NOT NULL,
  day_label  VARCHAR(40)  NOT NULL,
  title      VARCHAR(190) NOT NULL,
  text       TEXT         NOT NULL,
  stay       VARCHAR(120) NULL,
  meals      VARCHAR(120) NULL,
  images     JSON         NOT NULL,
  UNIQUE KEY uq_circuit_day (circuit_id, position),
  CONSTRAINT fk_day_circuit FOREIGN KEY (circuit_id) REFERENCES circuits (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Offres et catalogues des pages du site
--   kind : activity | excursion | cruise | longstay | idea (idées de voyage de la page Sur mesure)
--          stay (Hébergement) | transport | guide (équipe de guides) | food (expériences culinaires)
--          session (séances photo) | photo (galerie photo) | gear (location de matériel) | ticket (billets)
--   details : champs propres à chaque type (durée, niveau, région, port, points...), en anglais
--   translations : autres langues, { "fr": { "title": ..., "text": ..., "duration": ... } }
--   Les photos sont des chemins servis par l'API, ex. /uploads/circuits/ramena.jpg
CREATE TABLE IF NOT EXISTS offers (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  kind         ENUM('activity', 'excursion', 'cruise', 'longstay', 'idea', 'stay', 'transport', 'guide', 'food', 'session', 'photo', 'gear', 'ticket') NOT NULL,
  title        VARCHAR(190)  NOT NULL,
  text         VARCHAR(1000) NOT NULL,
  image        VARCHAR(500)  NOT NULL,
  price        INT UNSIGNED  NULL,
  details      JSON          NOT NULL,
  translations JSON          NULL,
  sort_order   INT           NOT NULL DEFAULT 0,
  is_published TINYINT(1)    NOT NULL DEFAULT 1,
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_offers_kind (kind, is_published, sort_order)
) ENGINE=InnoDB;

-- Textes du site modifiés depuis l'admin (page « Textes »)
--   namespace : fichier de textes du site (home, about, footer...), comme client/src/i18n/locales/<langue>/<namespace>.json
--   content   : seulement les textes modifiés, même forme que le fichier ; le reste vient du fichier
CREATE TABLE IF NOT EXISTS site_texts (
  namespace  VARCHAR(40) NOT NULL,
  lang       CHAR(2)     NOT NULL,
  content    JSON        NOT NULL,
  updated_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (namespace, lang)
) ENGINE=InnoDB;

-- Destinations (pages /destinations/:slug) et leurs lieux à visiter (/destinations/:slug/:lieu)
--   details      : tout le reste, en anglais : tagline, intro[], best, stay, getting, tip,
--                  todo[] { title, text, image } et visit[] (lieux : slug, name, text, image, price, rating, reviews,
--                  duration, groupSize, tourType, language, overview[], details[], highlights[], does[], included[], excluded[])
--   translations : autres langues, même forme, { "fr": { "name": ..., "todo": [{ "title": ... }], "visit": [...] } }
CREATE TABLE IF NOT EXISTS destinations (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug         VARCHAR(120) NOT NULL UNIQUE,
  name         VARCHAR(120) NOT NULL,
  region       VARCHAR(60)  NOT NULL,
  image        VARCHAR(500) NOT NULL,
  details      JSON         NOT NULL,
  translations JSON         NULL,
  sort_order   INT          NOT NULL DEFAULT 0,
  is_published TINYINT(1)   NOT NULL DEFAULT 1,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_destinations_order (is_published, sort_order)
) ENGINE=InnoDB;

-- Articles du blog (/blog et /blog/:slug)
--   body         : blocs du corps, en anglais : heading { text }, paragraph { text }, list { items[] { lead, text } },
--                  image { image, caption }, cta { image, title, subtitle, priceLabel, button, link }
--   translations : autres langues, { "fr": { "title": ..., "excerpt": ..., "body": [ { "text": ... } ] } }
--   minutes      : temps de lecture, calculé à l'enregistrement
CREATE TABLE IF NOT EXISTS blog_posts (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug         VARCHAR(160) NOT NULL UNIQUE,
  title        VARCHAR(190) NOT NULL,
  excerpt      VARCHAR(400) NOT NULL DEFAULT '',
  image        VARCHAR(500) NOT NULL,
  published_on DATE         NOT NULL,
  minutes      SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  body         JSON         NOT NULL,
  translations JSON         NULL,
  is_featured  TINYINT(1)   NOT NULL DEFAULT 0,
  is_published TINYINT(1)   NOT NULL DEFAULT 1,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_blog_published (is_published, published_on)
) ENGINE=InnoDB;

-- Photos des pages remplacées depuis l'admin (page « Photos ») : emplacement -> photo.
-- Un emplacement absent garde la photo d'origine du site.
CREATE TABLE IF NOT EXISTS site_images (
  slot       VARCHAR(80)  NOT NULL PRIMARY KEY,
  path       VARCHAR(500) NOT NULL,
  updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
