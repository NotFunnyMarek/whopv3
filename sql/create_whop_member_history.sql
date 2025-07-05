CREATE TABLE IF NOT EXISTS whop_member_history (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  whop_id INT UNSIGNED NOT NULL,
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_whop (user_id, whop_id),
  INDEX idx_user_id (user_id),
  INDEX idx_whop_id (whop_id)
);
