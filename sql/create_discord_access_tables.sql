-- Table storing linked Discord servers
CREATE TABLE IF NOT EXISTS discord_servers (
  whop_id INT UNSIGNED NOT NULL PRIMARY KEY,
  guild_id VARCHAR(30) NOT NULL,
  owner_discord_id VARCHAR(30) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY idx_guild_id (guild_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Members joined via Discord
CREATE TABLE IF NOT EXISTS discord_members (
  guild_id VARCHAR(30) NOT NULL,
  discord_id VARCHAR(30) NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (guild_id, discord_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Temporary codes for linking servers
CREATE TABLE IF NOT EXISTS discord_setup_codes (
  code VARCHAR(6) NOT NULL PRIMARY KEY,
  whop_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
