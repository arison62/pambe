-- Activer l'extension pour les UUID si vous préférez utiliser des UUID pour les PK
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Fonction pour mettre à jour automatiquement le champ updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Types ENUM
CREATE TYPE role_enum AS ENUM ('CLIENT', 'PRESTATAIRE', 'ADMIN');

CREATE TYPE pricing_type_enum AS ENUM ('FIXED', 'HOURLY', 'NEGOTIABLE');

CREATE TYPE booking_status_enum AS ENUM (
    'PENDING_PROVIDER',      -- En attente de l'acceptation du prestataire
    'PENDING_CLIENT_CONFIRM',-- Le prestataire a fait une contre-proposition, en attente du client
    'CONFIRMED',             -- Réservation confirmée par les deux parties
    'CANCELLED_BY_CLIENT',
    'CANCELLED_BY_PROVIDER',
    'COMPLETED',             -- Service réalisé et payé
    'DISPUTED'               -- Litige ouvert
);

CREATE TYPE transaction_status_enum AS ENUM ('PENDING', 'SUCCESSFUL', 'FAILED', 'REFUNDED');

CREATE TYPE media_type_enum AS ENUM ('IMAGE', 'VIDEO');

CREATE TYPE certification_status_enum AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- Table: Cities
CREATE TABLE Cities (
    city_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    country_code VARCHAR(2) NOT NULL DEFAULT 'CM', -- Code ISO du pays, par défaut Cameroun
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_cities
BEFORE UPDATE ON Cities
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Table: Quartiers
CREATE TABLE Quartiers (
    quartier_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city_id BIGINT NOT NULL REFERENCES Cities (city_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (name, city_id)
);

CREATE TRIGGER set_timestamp_quartiers
BEFORE UPDATE ON Quartiers
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Table: Users
CREATE TABLE Users (
    user_id BIGSERIAL PRIMARY KEY,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    city_id BIGINT NOT NULL REFERENCES Cities (city_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    quartier_id BIGINT REFERENCES Quartiers (quartier_id) ON DELETE SET NULL ON UPDATE CASCADE, -- Peut être NULL si non spécifié
    profile_picture_url VARCHAR(512),
    role role_enum NOT NULL,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON Users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Table: ProviderProfiles
CREATE TABLE ProviderProfiles (
    provider_profile_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES Users (user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    bio TEXT,
    years_of_experience INT CHECK (years_of_experience >= 0),
    general_availability VARCHAR(255),
    is_verified_by_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_providerprofiles
BEFORE UPDATE ON ProviderProfiles
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Table: Skills (Compétences/Catégories de service)
CREATE TABLE Skills (
    skill_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_skills
BEFORE UPDATE ON Skills
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Table: ProviderSkills (Compétences d'un prestataire)
CREATE TABLE ProviderSkills (
    provider_skill_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES Users (user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES Skills (skill_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    self_assessment_details TEXT, -- Auto-évaluation ou détails de l'expérience pour cette compétence
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, skill_id)
);
-- Pas de updated_at ici car c'est une table de liaison, les mises à jour sont des suppressions/insertions

-- Table: Services (Services offerts par les prestataires)
CREATE TABLE Services (
    service_id BIGSERIAL PRIMARY KEY,
    provider_user_id BIGINT NOT NULL REFERENCES Users (user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    provider_skill_id BIGINT NOT NULL REFERENCES ProviderSkills (provider_skill_id) ON DELETE CASCADE ON UPDATE CASCADE, -- Un service est lié à une compétence spécifique que le prestataire a déclarée
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    pricing_type pricing_type_enum NOT NULL,
    price_amount DECIMAL(12, 2) CHECK (price_amount >= 0), -- Augmenté à 12,2 pour XAF
    estimated_duration_hours DECIMAL(4, 1) CHECK (estimated_duration_hours > 0),
    specific_availability VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_services
BEFORE UPDATE ON Services
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Table: Bookings (Réservations)
CREATE TABLE Bookings (
    booking_id BIGSERIAL PRIMARY KEY,
    client_user_id BIGINT NOT NULL REFERENCES Users (user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    provider_user_id BIGINT NOT NULL REFERENCES Users (user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    service_id BIGINT NOT NULL REFERENCES Services (service_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    booking_date_time_utc TIMESTAMPTZ NOT NULL,
    client_message TEXT,
    status booking_status_enum NOT NULL,
    cancellation_reason TEXT,
    final_price_agreed DECIMAL(12, 2) CHECK (final_price_agreed >= 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_client_provider_different CHECK (
        client_user_id <> provider_user_id
    )
);

CREATE TRIGGER set_timestamp_bookings
BEFORE UPDATE ON Bookings
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Table: Transactions
CREATE TABLE Transactions (
    transaction_id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES Bookings (booking_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    payer_user_id BIGINT NOT NULL REFERENCES Users (user_id) ON DELETE RESTRICT ON UPDATE CASCADE, -- Le client
    payee_user_id BIGINT NOT NULL REFERENCES Users (user_id) ON DELETE RESTRICT ON UPDATE CASCADE, -- Le prestataire
    amount_total DECIMAL(12, 2) NOT NULL CHECK (amount_total >= 0),
    platform_commission_percentage DECIMAL(5, 2) NOT NULL CHECK (
        platform_commission_percentage >= 0
        AND platform_commission_percentage <= 100
    ),
    platform_fee_amount DECIMAL(12, 2) NOT NULL CHECK (platform_fee_amount >= 0),
    amount_paid_to_provider DECIMAL(12, 2) NOT NULL CHECK (amount_paid_to_provider >= 0),
    payment_method_used VARCHAR(50) NOT NULL, -- ex: "ORANGE_MONEY", "MTN_MOMO"
    payment_gateway_reference_id VARCHAR(255) UNIQUE, -- ID de transaction de la passerelle, peut être NULL si paiement direct non tracé par GW
    status transaction_status_enum NOT NULL,
    transaction_date_utc TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_transactions
BEFORE UPDATE ON Transactions
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Table: Reviews
CREATE TABLE Reviews (
    review_id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT UNIQUE NOT NULL REFERENCES Bookings (booking_id) ON DELETE CASCADE ON UPDATE CASCADE, -- Une évaluation par réservation
    client_user_id BIGINT NOT NULL REFERENCES Users (user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    provider_user_id BIGINT NOT NULL REFERENCES Users (user_id) ON DELETE RESTRICT ON UPDATE CASCADE, -- Redondant avec booking_id mais utile pour requêtes directes
    rating_stars INT NOT NULL CHECK (rating_stars BETWEEN 1 AND 5),
    comment TEXT,
    provider_reply TEXT,
    review_date_utc TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_moderated_hidden BOOLEAN DEFAULT FALSE, -- Si l'admin cache l'avis
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_reviews
BEFORE UPDATE ON Reviews
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Table: Messages
CREATE TABLE Messages (
    message_id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES Bookings (booking_id) ON DELETE CASCADE ON UPDATE CASCADE,
    sender_user_id BIGINT NOT NULL REFERENCES Users (user_id) ON DELETE RESTRICT ON UPDATE CASCADE, -- Ou SET NULL si l'utilisateur est supprimé? RESTRICT est plus sûr.
    receiver_user_id BIGINT NOT NULL REFERENCES Users (user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    content TEXT NOT NULL,
    sent_at_utc TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP -- sent_at_utc est plus pertinent ici
);
-- Pas de updated_at ici car les messages ne sont pas modifiés

-- Table: Portfolios (Optionnel)
CREATE TABLE Portfolios (
    portfolio_item_id BIGSERIAL PRIMARY KEY,
    provider_user_id BIGINT NOT NULL REFERENCES Users (user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    media_url VARCHAR(512) NOT NULL,
    media_type media_type_enum NOT NULL,
    caption VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_portfolios
BEFORE UPDATE ON Portfolios
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Table: Certifications (Optionnel)
CREATE TABLE Certifications (
    certification_id BIGSERIAL PRIMARY KEY,
    provider_user_id BIGINT NOT NULL REFERENCES Users (user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    provider_skill_id BIGINT REFERENCES ProviderSkills (provider_skill_id) ON DELETE SET NULL ON UPDATE CASCADE, -- Peut être non lié à une compétence spécifique
    title VARCHAR(255) NOT NULL,
    document_url VARCHAR(512) NOT NULL,
    verification_status certification_status_enum DEFAULT 'PENDING',
    admin_verifier_id BIGINT REFERENCES Users (user_id) ON DELETE SET NULL ON UPDATE CASCADE, -- Admin qui a vérifié
    verified_at_utc TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_admin_role_certifications CHECK (
        admin_verifier_id IS NULL
        OR (
            SELECT role
            FROM Users
            WHERE
                user_id = admin_verifier_id
        ) = 'ADMIN'
    )
);

CREATE TRIGGER set_timestamp_certifications
BEFORE UPDATE ON Certifications
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Index (Exemples, à adapter selon les requêtes fréquentes)
CREATE INDEX idx_users_email ON Users (email);

CREATE INDEX idx_users_phone_number ON Users (phone_number);

CREATE INDEX idx_services_title ON Services (title);

CREATE INDEX idx_services_provider_user_id ON Services (provider_user_id);

CREATE INDEX idx_bookings_client_user_id ON Bookings (client_user_id);

CREATE INDEX idx_bookings_provider_user_id ON Bookings (provider_user_id);

CREATE INDEX idx_bookings_status ON Bookings (status);

CREATE INDEX idx_reviews_provider_user_id ON Reviews (provider_user_id);

CREATE INDEX idx_messages_booking_id ON Messages (booking_id);

-- Si vous utilisez la recherche par texte intégral pour les descriptions de services ou de compétences:
-- CREATE INDEX idx_services_description_fts ON Services USING GIN (to_tsvector('french', description));
-- CREATE INDEX idx_skills_name_fts ON Skills USING GIN (to_tsvector('french', name));

COMMENT ON COLUMN Users.quartier_id IS 'Quartier de résidence principal de l''utilisateur. Optionnel.';

COMMENT ON COLUMN ProviderSkills.self_assessment_details IS 'Détails fournis par le prestataire sur son niveau/expérience pour cette compétence.';

COMMENT ON COLUMN Services.provider_skill_id IS 'Lie le service à une compétence spécifique que le prestataire a déclarée via ProviderSkills.';

COMMENT ON COLUMN Bookings.final_price_agreed IS 'Prix final si différent du prix initial du service (ex: après négociation).';

COMMENT ON COLUMN Transactions.payment_gateway_reference_id IS 'Référence unique de la transaction chez le fournisseur de paiement (Orange, MTN, Flutterwave).';

COMMENT ON COLUMN Reviews.provider_user_id IS 'Redondant (car accessible via booking_id) mais peut simplifier certaines requêtes sur les avis d''un prestataire.';

COMMENT ON COLUMN Certifications.check_admin_role_certifications IS 'Assure que admin_verifier_id est bien un admin. Note: Cette contrainte peut être complexe à maintenir directement en CHECK, une logique applicative ou un trigger plus complexe serait plus robuste si le rôle d''un user peut changer.';

SELECT 'Structure de la base de données créée avec succès !' AS message;