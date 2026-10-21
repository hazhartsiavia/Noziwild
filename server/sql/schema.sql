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

-- Inscriptions à la newsletter (page Guides)
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(190) NOT NULL UNIQUE,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Circuits (pages /circuits et /circuits/:slug)
--   Les listes (paragraphes, points forts, inclus, photos...) sont rangées en JSON :
--   elles s'affichent toujours en entier, jamais filtrées en SQL.
--   Les photos sont des chemins servis par l'API, ex. /uploads/circuits/ramena.png
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

-- Offres des pages Activités, Excursions, Excursions croisière, Long séjour et Sur mesure
--   kind : activity | excursion | cruise | longstay | idea (idées de voyage de la page Sur mesure)
--   details : champs propres à chaque type (durée, niveau, région, port, points...), en anglais
--   translations : autres langues, { "fr": { "title": ..., "text": ..., "duration": ... } }
--   Les photos sont des chemins servis par l'API, ex. /uploads/circuits/ramena.png
CREATE TABLE IF NOT EXISTS offers (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  kind         ENUM('activity', 'excursion', 'cruise', 'longstay', 'idea') NOT NULL,
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
