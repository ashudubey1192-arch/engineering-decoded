CREATE TABLE IF NOT EXISTS app.course_progress (
 user_id text NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
 module_slug text NOT NULL,
 course_slug text NOT NULL,
 completed_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,module_slug,course_slug)
);
CREATE TABLE IF NOT EXISTS app.learning_days (
 user_id text NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
 day date NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
 PRIMARY KEY(user_id,day)
);
CREATE OR REPLACE FUNCTION app.record_learning_day() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_TABLE_NAME = 'dsa_progress' THEN
   IF NEW.category NOT IN ('solved','quizzes','lessons','reviews','interviews') THEN RETURN NEW; END IF;
 END IF;
 INSERT INTO app.learning_days(user_id) VALUES (NEW.user_id) ON CONFLICT DO NOTHING;
 RETURN NEW;
END; $$;
CREATE OR REPLACE TRIGGER article_learning_day AFTER INSERT OR UPDATE ON app.article_progress FOR EACH ROW EXECUTE FUNCTION app.record_learning_day();
CREATE OR REPLACE TRIGGER course_learning_day AFTER INSERT ON app.course_progress FOR EACH ROW EXECUTE FUNCTION app.record_learning_day();
CREATE OR REPLACE TRIGGER dsa_learning_day AFTER INSERT OR UPDATE ON app.dsa_progress FOR EACH ROW EXECUTE FUNCTION app.record_learning_day();
