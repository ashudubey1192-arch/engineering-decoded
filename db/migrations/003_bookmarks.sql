CREATE TABLE IF NOT EXISTS app.course_bookmarks (
 user_id text NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
 module_slug text NOT NULL,
 course_slug text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,module_slug,course_slug)
);
