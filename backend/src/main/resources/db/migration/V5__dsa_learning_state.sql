CREATE TABLE dsa_learning_state (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(30) NOT NULL,
  entry_key VARCHAR(240) NOT NULL,
  value TEXT NOT NULL,
  client_updated_at BIGINT NOT NULL,
  PRIMARY KEY (user_id, category, entry_key)
);
