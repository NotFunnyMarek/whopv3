ALTER TABLE discord_servers
  ADD COLUMN join_role_id VARCHAR(30) DEFAULT NULL,
  ADD COLUMN expire_action ENUM('kick','remove_role','remove_all') DEFAULT 'kick',
  ADD COLUMN expire_role_id VARCHAR(30) DEFAULT NULL;
