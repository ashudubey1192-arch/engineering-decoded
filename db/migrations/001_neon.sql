CREATE SCHEMA IF NOT EXISTS app;
CREATE TABLE IF NOT EXISTS app.users (
  id text PRIMARY KEY,
  role text NOT NULL DEFAULT 'USER' CHECK (role IN ('USER','ADMIN')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS app.article_progress (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id text NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  module_slug text NOT NULL, course_slug text NOT NULL, section_slug text NOT NULL, article_slug text NOT NULL,
  progress_percent integer NOT NULL CHECK (progress_percent BETWEEN 0 AND 100),
  last_position integer NOT NULL CHECK (last_position >= 0), completed boolean NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_slug, course_slug, article_slug)
);
CREATE TABLE IF NOT EXISTS app.dsa_progress (
  user_id text NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  category text NOT NULL, entry_key text NOT NULL, value text NOT NULL,
  updated_at bigint NOT NULL CHECK (updated_at > 0),
  PRIMARY KEY (user_id, category, entry_key)
);
-- Serialize each user's writes and enforce the quota in the same transaction.
CREATE OR REPLACE FUNCTION app.save_dsa(owner_id text, entries jsonb) RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM id FROM app.users WHERE id = owner_id FOR UPDATE;
  INSERT INTO app.dsa_progress(user_id, category, entry_key, value, updated_at)
  SELECT owner_id, e->>'category', e->>'entryKey', e->>'value', (e->>'updatedAt')::bigint
  FROM jsonb_array_elements(entries) e
  ON CONFLICT (user_id, category, entry_key) DO UPDATE
  SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
  WHERE EXCLUDED.updated_at > app.dsa_progress.updated_at;
  IF (SELECT count(*) FROM app.dsa_progress WHERE user_id = owner_id) > 4000 THEN
    RAISE EXCEPTION 'Progress entry limit reached' USING ERRCODE = 'P0001';
  END IF;
END;
$$;
