CREATE TABLE IF NOT EXISTS whop_reviews (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  whop_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  text TEXT NOT NULL,
  rating TINYINT NOT NULL,
  purchase_date DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_whop_id (whop_id),
  INDEX idx_user_id (user_id)
);
