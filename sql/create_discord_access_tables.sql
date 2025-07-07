-- Table storing linked Discord servers
CREATE TABLE IF NOT EXISTS discord_servers (
  guild_id VARCHAR(30) PRIMARY KEY,
  owner_discord_id VARCHAR(30) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Members joined via Discord
CREATE TABLE IF NOT EXISTS discord_members (
  guild_id VARCHAR(30) NOT NULL,
  discord_id VARCHAR(30) NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (guild_id, discord_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
