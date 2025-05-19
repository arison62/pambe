-- Activer l'extension pour les UUID si vous préférez utiliser des UUID pour les PK
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Fonction pour mettre à jour automatiquement le champ updated_at
CREATE OR REPLACE FUNCTION declencheur_modification_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Types ENUM
CREATE TYPE type_role AS ENUM ('CLIENT', 'PRESTATAIRE', 'ADMIN');

CREATE TYPE type_tarification AS ENUM ('FIXE', 'HORAIRE', 'NEGOCIABLE');

CREATE TYPE statut_reservation AS ENUM (
    'EN_ATTENTE_PRESTATAIRE',     -- En attente de l'acceptation du prestataire
    'EN_ATTENTE_CLIENT',          -- Le prestataire a fait une contre-proposition, en attente du client
    'CONFIRMEE',                  -- Réservation confirmée par les deux parties
    'ANNULEE_PAR_CLIENT',
    'ANNULEE_PAR_PRESTATAIRE',
    'TERMINEE',                   -- Service réalisé et payé
    'LITIGE'                      -- Litige ouvert
);

CREATE TYPE statut_transaction AS ENUM ('EN_ATTENTE', 'REUSSIE', 'ECHOUEE', 'REMBOURSEE');

CREATE TYPE type_media AS ENUM ('IMAGE', 'VIDEO');

CREATE TYPE statut_certification AS ENUM ('EN_ATTENTE', 'VERIFIE', 'REJETE');

CREATE TYPE methode_auth AS ENUM ('EMAIL_PASSWORD', 'GOOGLE', 'FACEBOOK', 'APPLE');

-- Table: Pays
CREATE TABLE Pays (
    code_pays VARCHAR(2) PRIMARY KEY,
    nom VARCHAR(255) NOT NULL
);

-- Table: Subdivisions
CREATE TABLE Subdivisions (
    id_subdivision BIGSERIAL PRIMARY KEY,
    type_subdivision VARCHAR(255) NOT NULL DEFAULT 'region',
    nom VARCHAR(255) NOT NULL, -- Subdivision par defaut
    code_pays VARCHAR(2) REFERENCES Pays (code_pays)
);

-- Table: Villes
CREATE TABLE Villes (
    id_ville BIGSERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL UNIQUE,
    latitude NUMERIC,
    longitude NUMERIC,
    code_pays VARCHAR(2) NOT NULL DEFAULT 'CM', -- Code ISO du pays, par défaut Cameroun
    id_subdivision BIGINT NOT NULL REFERENCES Subdivisions (id_subdivision) ON DELETE RESTRICT ON UPDATE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER declencheur_timestamp_villes
BEFORE UPDATE ON Villes
FOR EACH ROW
EXECUTE FUNCTION declencheur_modification_timestamp();

-- Table: Quartiers
CREATE TABLE Quartiers (
    id_quartier BIGSERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    id_ville BIGINT NOT NULL REFERENCES Villes (id_ville) ON DELETE RESTRICT ON UPDATE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (nom, id_ville)
);

CREATE TRIGGER declencheur_timestamp_quartiers
BEFORE UPDATE ON Quartiers
FOR EACH ROW
EXECUTE FUNCTION declencheur_modification_timestamp();

-- Table: Utilisateurs
CREATE TABLE Utilisateurs (
    id_utilisateur BIGSERIAL PRIMARY KEY,
    numero_telephone VARCHAR(20) UNIQUE,
    email VARCHAR(255) UNIQUE,
    hash_mot_de_passe VARCHAR(255), -- Nullable pour OAuth
    nom_complet VARCHAR(255) NOT NULL,
    id_ville BIGINT REFERENCES Villes (id_ville) ON DELETE RESTRICT ON UPDATE CASCADE,
    id_quartier BIGINT REFERENCES Quartiers (id_quartier) ON DELETE SET NULL ON UPDATE CASCADE,
    url_photo_profil VARCHAR(512),
    role type_role NOT NULL,
    telephone_verifie BOOLEAN DEFAULT FALSE,
    email_verifie BOOLEAN DEFAULT FALSE,
    est_actif BOOLEAN DEFAULT TRUE,
    methode_authentification methode_auth NOT NULL DEFAULT 'EMAIL_PASSWORD',
    id_externe_auth VARCHAR(255), -- ID externe pour l'authentification OAuth
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER declencheur_timestamp_utilisateurs
BEFORE UPDATE ON Utilisateurs
FOR EACH ROW
EXECUTE FUNCTION declencheur_modification_timestamp();

-- Table: ProfilsPrestataires
CREATE TABLE ProfilsPrestataires (
    id_profil_prestataire BIGSERIAL PRIMARY KEY,
    id_utilisateur BIGINT UNIQUE NOT NULL REFERENCES Utilisateurs (id_utilisateur) ON DELETE CASCADE ON UPDATE CASCADE,
    biographie TEXT,
    annees_experience INT CHECK (annees_experience >= 0),
    disponibilite_generale VARCHAR(255),
    verifie_par_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER declencheur_timestamp_profilsprestataires
BEFORE UPDATE ON ProfilsPrestataires
FOR EACH ROW
EXECUTE FUNCTION declencheur_modification_timestamp();

-- Table: Competences
CREATE TABLE Competences (
    id_competence BIGSERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    est_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER declencheur_timestamp_competences
BEFORE UPDATE ON Competences
FOR EACH ROW
EXECUTE FUNCTION declencheur_modification_timestamp();

-- Table: CompetencesPrestataires
CREATE TABLE CompetencesPrestataires (
    id_competence_prestataire BIGSERIAL PRIMARY KEY,
    id_utilisateur BIGINT NOT NULL REFERENCES Utilisateurs (id_utilisateur) ON DELETE CASCADE ON UPDATE CASCADE,
    id_competence BIGINT NOT NULL REFERENCES Competences (id_competence) ON DELETE RESTRICT ON UPDATE CASCADE,
    details_auto_evaluation TEXT, -- Auto-évaluation ou détails de l'expérience pour cette compétence
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_utilisateur, id_competence)
);

-- Table: Services
CREATE TABLE Services (
    id_service BIGSERIAL PRIMARY KEY,
    id_prestataire BIGINT NOT NULL REFERENCES Utilisateurs (id_utilisateur) ON DELETE CASCADE ON UPDATE CASCADE,
    id_competence_prestataire BIGINT NOT NULL REFERENCES CompetencesPrestataires (id_competence_prestataire) ON DELETE CASCADE ON UPDATE CASCADE,
    titre VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type_tarification type_tarification NOT NULL,
    montant_prix DECIMAL(12, 2) CHECK (montant_prix >= 0),
    duree_estimee_heures DECIMAL(4, 1) CHECK (duree_estimee_heures > 0),
    disponibilite_specifique VARCHAR(255),
    est_actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER declencheur_timestamp_services
BEFORE UPDATE ON Services
FOR EACH ROW
EXECUTE FUNCTION declencheur_modification_timestamp();

-- Table: Reservations
CREATE TABLE Reservations (
    id_reservation BIGSERIAL PRIMARY KEY,
    id_client BIGINT NOT NULL REFERENCES Utilisateurs (id_utilisateur) ON DELETE RESTRICT ON UPDATE CASCADE,
    id_prestataire BIGINT NOT NULL REFERENCES Utilisateurs (id_utilisateur) ON DELETE RESTRICT ON UPDATE CASCADE,
    id_service BIGINT NOT NULL REFERENCES Services (id_service) ON DELETE RESTRICT ON UPDATE CASCADE,
    date_heure_reservation_utc TIMESTAMPTZ NOT NULL,
    message_client TEXT,
    statut statut_reservation NOT NULL,
    raison_annulation TEXT,
    prix_final_convenu DECIMAL(12, 2) CHECK (prix_final_convenu >= 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT verification_client_prestataire_different CHECK (id_client <> id_prestataire)
);

CREATE TRIGGER declencheur_timestamp_reservations
BEFORE UPDATE ON Reservations
FOR EACH ROW
EXECUTE FUNCTION declencheur_modification_timestamp();

-- Table: Transactions
CREATE TABLE Transactions (
    id_transaction BIGSERIAL PRIMARY KEY,
    id_reservation BIGINT NOT NULL REFERENCES Reservations (id_reservation) ON DELETE RESTRICT ON UPDATE CASCADE,
    id_payeur BIGINT NOT NULL REFERENCES Utilisateurs (id_utilisateur) ON DELETE RESTRICT ON UPDATE CASCADE,
    id_beneficiaire BIGINT NOT NULL REFERENCES Utilisateurs (id_utilisateur) ON DELETE RESTRICT ON UPDATE CASCADE,
    montant_total DECIMAL(12, 2) NOT NULL CHECK (montant_total >= 0),
    pourcentage_commission_plateforme DECIMAL(5, 2) NOT NULL CHECK (
        pourcentage_commission_plateforme >= 0
        AND pourcentage_commission_plateforme <= 100
    ),
    montant_frais_plateforme DECIMAL(12, 2) NOT NULL CHECK (montant_frais_plateforme >= 0),
    montant_verse_prestataire DECIMAL(12, 2) NOT NULL CHECK (
        montant_verse_prestataire >= 0
    ),
    methode_paiement_utilisee VARCHAR(50) NOT NULL, -- ex: "ORANGE_MONEY", "MTN_MOMO"
    id_reference_passerelle_paiement VARCHAR(255) UNIQUE,
    statut statut_transaction NOT NULL,
    date_transaction_utc TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER declencheur_timestamp_transactions
BEFORE UPDATE ON Transactions
FOR EACH ROW
EXECUTE FUNCTION declencheur_modification_timestamp();

-- Table: Avis
CREATE TABLE Avis (
    id_avis BIGSERIAL PRIMARY KEY,
    id_reservation BIGINT UNIQUE NOT NULL REFERENCES Reservations (id_reservation) ON DELETE CASCADE ON UPDATE CASCADE,
    id_client BIGINT NOT NULL REFERENCES Utilisateurs (id_utilisateur) ON DELETE RESTRICT ON UPDATE CASCADE,
    id_prestataire BIGINT NOT NULL REFERENCES Utilisateurs (id_utilisateur) ON DELETE RESTRICT ON UPDATE CASCADE,
    notation_etoiles INT NOT NULL CHECK (
        notation_etoiles BETWEEN 1 AND 5
    ),
    commentaire TEXT,
    reponse_prestataire TEXT,
    date_avis_utc TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    cache_par_moderation BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER declencheur_timestamp_avis
BEFORE UPDATE ON Avis
FOR EACH ROW
EXECUTE FUNCTION declencheur_modification_timestamp();

-- Table: Messages
CREATE TABLE Messages (
    id_message BIGSERIAL PRIMARY KEY,
    id_reservation BIGINT NOT NULL REFERENCES Reservations (id_reservation) ON DELETE CASCADE ON UPDATE CASCADE,
    id_expediteur BIGINT NOT NULL REFERENCES Utilisateurs (id_utilisateur) ON DELETE RESTRICT ON UPDATE CASCADE,
    id_destinataire BIGINT NOT NULL REFERENCES Utilisateurs (id_utilisateur) ON DELETE RESTRICT ON UPDATE CASCADE,
    contenu TEXT NOT NULL,
    envoye_le_utc TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    est_lu BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table: Portfolio
CREATE TABLE Portfolio (
    id_element_portfolio BIGSERIAL PRIMARY KEY,
    id_prestataire BIGINT NOT NULL REFERENCES Utilisateurs (id_utilisateur) ON DELETE CASCADE ON UPDATE CASCADE,
    url_media VARCHAR(512) NOT NULL,
    type_media type_media NOT NULL,
    legende VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER declencheur_timestamp_portfolio
BEFORE UPDATE ON Portfolio
FOR EACH ROW
EXECUTE FUNCTION declencheur_modification_timestamp();

-- Table: JetonsAuthentification
CREATE TABLE JetonsAuthentification (
    id_jeton BIGSERIAL PRIMARY KEY,
    id_utilisateur BIGINT NOT NULL REFERENCES Utilisateurs (id_utilisateur) ON DELETE CASCADE ON UPDATE CASCADE,
    jeton VARCHAR(512) NOT NULL,
    type_jeton VARCHAR(50) NOT NULL, -- 'REFRESH', 'RESET_PASSWORD', 'EMAIL_VERIFICATION', etc.
    expire_le TIMESTAMPTZ NOT NULL,
    est_actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER declencheur_timestamp_jetons
BEFORE UPDATE ON JetonsAuthentification
FOR EACH ROW
EXECUTE FUNCTION declencheur_modification_timestamp();

-- Index
CREATE INDEX idx_utilisateurs_email ON Utilisateurs (email);

CREATE INDEX idx_utilisateurs_numero_telephone ON Utilisateurs (numero_telephone);

CREATE INDEX idx_services_titre ON Services (titre);

CREATE INDEX idx_services_id_prestataire ON Services (id_prestataire);

CREATE INDEX idx_reservations_id_client ON Reservations (id_client);

CREATE INDEX idx_reservations_id_prestataire ON Reservations (id_prestataire);

CREATE INDEX idx_reservations_statut ON Reservations (statut);

CREATE INDEX idx_avis_id_prestataire ON Avis (id_prestataire);

CREATE INDEX idx_messages_id_reservation ON Messages (id_reservation);

CREATE INDEX idx_utilisateurs_methode_authentification ON Utilisateurs (methode_authentification);

CREATE INDEX idx_utilisateurs_id_externe_auth ON Utilisateurs (id_externe_auth);

-- Recherche plein texte
CREATE INDEX idx_services_description_fts ON Services USING GIN (
    to_tsvector ('french', description)
);

CREATE INDEX idx_competences_nom_fts ON Competences USING GIN (to_tsvector ('french', nom));

-- Commentaires
COMMENT ON COLUMN Utilisateurs.id_quartier IS 'Quartier de résidence principal de l''utilisateur. Optionnel.';

COMMENT ON COLUMN CompetencesPrestataires.details_auto_evaluation IS 'Détails fournis par le prestataire sur son niveau/expérience pour cette compétence.';

COMMENT ON COLUMN Services.id_competence_prestataire IS 'Lie le service à une compétence spécifique que le prestataire a déclarée via CompetencesPrestataires.';

COMMENT ON COLUMN Reservations.prix_final_convenu IS 'Prix final si différent du prix initial du service (ex: après négociation).';

COMMENT ON COLUMN Transactions.id_reference_passerelle_paiement IS 'Référence unique de la transaction chez le fournisseur de paiement (Orange, MTN, Flutterwave).';

COMMENT ON COLUMN Avis.id_prestataire IS 'Redondant (car accessible via id_reservation) mais peut simplifier certaines requêtes sur les avis d''un prestataire.';

COMMENT ON COLUMN Utilisateurs.hash_mot_de_passe IS 'Peut être NULL pour les utilisateurs authentifiés via OAuth.';

COMMENT ON COLUMN Utilisateurs.id_externe_auth IS 'Identifiant externe fourni par le provider OAuth (Google, Facebook, etc.)';

COMMENT ON COLUMN JetonsAuthentification.type_jeton IS 'Type de jeton: REFRESH, RESET_PASSWORD, EMAIL_VERIFICATION, etc.';

INSERT INTO pays (nom, code_pays) VALUES ('Cameroun', 'CM');

INSERT INTO subdivisions (nom, code_pays) VALUES ('Adamaoua', 'CM');

INSERT INTO subdivisions (nom, code_pays) VALUES ('Centre', 'CM');

INSERT INTO subdivisions (nom, code_pays) VALUES ('Est', 'CM');

INSERT INTO
    subdivisions (nom, code_pays)
VALUES ('Extrème-Nord', 'CM');

INSERT INTO subdivisions (nom, code_pays) VALUES ('Littoral', 'CM');

INSERT INTO subdivisions (nom, code_pays) VALUES ('Ouest', 'CM');

INSERT INTO subdivisions (nom, code_pays) VALUES ('Nord', 'CM');

INSERT INTO
    subdivisions (nom, code_pays)
VALUES ('Nord-Ouest', 'CM');

INSERT INTO subdivisions (nom, code_pays) VALUES ('Sud', 'CM');

INSERT INTO subdivisions (nom, code_pays) VALUES ('Sud-Ouest', 'CM');

-- Region: Admamoua
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Ngaoundéré', 7.3214, 13.5839, 1);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Banyo', 6.78, 11.82, 1);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Meiganga', 6.53, 14.37, 1);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Tibati', 6.46504, 12.62843, 1);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Tignère', null, null, 1);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Martap', null, null, 1);

-- Region: Centre
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Yaoundé', 2.940594, 9.910191, 2);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Mbalmayo', 3.51667, 11.5, 2);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Bafia', 4.75, 11.23333, 2);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Nkoteng', 4.51667, 12.03333, 2);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Obala', 4.1692, 11.5358, 2);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Nanga Eboko', 4.68333, 12.36667, 2);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Mbandjock', 4.45, 11.9, 2);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Eséka', 3.65, 10.76667, 2);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Akonolinga', 3.76667, 12.25, 2);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Makénéné', null, null, 2);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Monatélé', null, null, 2);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Sa''a', null, null, 2);

-- Region: Est
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Bertoua', 4.5791946, 13.6767958, 3);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Batouri', 4.47, 14.37, 3);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Bélabo', 4.9333, 13.3, 3);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Abong-Mbang', 3.9833, 13.1667, 3);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Yokadouma', 3.51667, 15.05, 3);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Garoua-Boulaï', null, null, 3);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Kette', null, null, 3);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Lomié', null, null, 3);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Mindourou', null, null, 3);

-- Region: Extreme-Nord
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Maroua', 10.5823, 14.3275, 4);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Kousséri', 12.084255, 15.017879, 4);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Mokolo', 10.7424589, 13.8042382, 4);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Yagoua', 10.3428, 15.2406, 4);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Mora', 11.043, 14.145, 4);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Kaélé', null, null, 4);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Maga', null, null, 4);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Guidiguis', null, null, 4);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Blangoua', null, null, 4);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Bogo', null, null, 4);

-- Region: Litoral
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Douala', 4.0500, 9.7000, 5);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Edéa', 3.800, 10.133, 5);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Nkongsamba', 4.9547, 9.9404, 5);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Loum', 4.7182, 9.7351, 5);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Mbanga', 4.4942318, 9.561784699999999, 5);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Manjo', 4.8428, 9.8217, 5);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Melong', 5.12181, 9.96143, 5);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Penja', 4.63911, 9.67987, 5);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Dizangué', 19.243, 3.51667, 5);

-- Region: Ouest
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Bafoussam', 5.4667, 10.4167, 6);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Dschang', 5.44397, 10.05332, 6);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Mbouda', 5.62611, 10.25421, 6);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Foumban', 5.72662, 10.89865, 6);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Bafang', 5.1601362, 10.1871351, 6);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Bangangté', 5.1443561, 10.5239867, 6);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Foumbot', null, null, 6);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Bandjoun', null, null, 6);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Baham', null, null, 6);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Bawaju', null, null, 6);

-- Region: Nord
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Garoua', 9.3000, 13.4000, 7);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Guider', null, null, 7);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Figuil', null, null, 7);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Lagdo', null, null, 7);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Poli', null, null, 7);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Tcholliré', null, null, 7);

-- Region: Nord-Ouest
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Bamenda', 5.9597, 10.14597, 8);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Wum', 6.38333, 10.06667, 8);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Kumbo', 6.2053, 10.6872, 8);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Fundong', 6.25, 10.26667, 8);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Mbengwi', 6.01667, 10, 8);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Nkambé', null, null, 8);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Batibo', null, null, 8);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Bambui', null, null, 8);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Bafut', null, null, 8);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Ndop', null, null, 8);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Ako', null, null, 8);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Bali', null, null, 8);

-- Region: Sud
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Ebolowa', 2.9167, 11.1500, 9);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Kribi', 2.940594, 9.910191, 9);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Ambam', null, null, 9);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Sangmélima', null, null, 9);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Campo', null, null, 9);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Djoum', null, null, 9);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Lomié', null, null, 9);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Meyomessi', null, null, 9);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Mintom', null, null, 9);

-- Region: Sud-Ouest

INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Buea', 4.159302, 9.243536, 10);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Limbe', 4.02419, 9.21972, 10);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Kumba', 4.6363, 9.4469, 10);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Mamfe', 5.7667, 9.2833, 10);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Tiko', 4.078630599999999, 9.358984, 10);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Muyuka', null, null, 10);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Fontem', null, null, 10);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Bangem', null, null, 10);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Menji', null, null, 10);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Mudemba', null, null, 10);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Idenau', null, null, 10);
INSERT INTO villes(nom, latitude, longitude, id_subdivision) VALUES ('Ekondo-Titi', null, null, 10);