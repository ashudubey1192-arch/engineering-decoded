CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name VARCHAR(120) NOT NULL,
    email VARCHAR(320),
    mobile VARCHAR(24),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    mobile_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at TIMESTAMPTZ,
    CONSTRAINT users_login_required CHECK (email IS NOT NULL OR mobile IS NOT NULL)
);
CREATE UNIQUE INDEX users_email_unique ON users (lower(email)) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX users_mobile_unique ON users (mobile) WHERE mobile IS NOT NULL;

CREATE TABLE login_audit (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    login_identifier VARCHAR(320) NOT NULL,
    successful BOOLEAN NOT NULL,
    ip_address VARCHAR(64),
    user_agent VARCHAR(500),
    failure_reason VARCHAR(120),
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX login_audit_user_time_idx ON login_audit(user_id, occurred_at DESC);
CREATE INDEX login_audit_identifier_time_idx ON login_audit(lower(login_identifier), occurred_at DESC);

CREATE TABLE learning_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_slug VARCHAR(120) NOT NULL,
    course_slug VARCHAR(160) NOT NULL,
    section_slug VARCHAR(180) NOT NULL,
    article_slug VARCHAR(240) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    progress_percent SMALLINT NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    last_position INTEGER NOT NULL DEFAULT 0 CHECK (last_position >= 0),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, module_slug, course_slug, article_slug)
);
CREATE INDEX learning_progress_user_updated_idx ON learning_progress(user_id, updated_at DESC);
CREATE INDEX learning_progress_course_idx ON learning_progress(module_slug, course_slug);

CREATE TABLE user_refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(128) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX refresh_tokens_user_idx ON user_refresh_tokens(user_id);
