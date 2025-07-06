ALTER TABLE users4
  ADD COLUMN is_verified TINYINT(1) NOT NULL DEFAULT 0 AFTER accepted_terms;
