ALTER TABLE users ADD COLUMN google_subject VARCHAR(255);
ALTER TABLE users ADD COLUMN profile_image_url VARCHAR(1000);
CREATE UNIQUE INDEX users_google_subject_unique ON users(google_subject) WHERE google_subject IS NOT NULL;
