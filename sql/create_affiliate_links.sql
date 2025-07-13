CREATE TABLE IF NOT EXISTS affiliate_links (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT(10) UNSIGNED NOT NULL,
    whop_id INT(10) UNSIGNED NOT NULL,
    code VARCHAR(64) NOT NULL UNIQUE,
    payout_percent DECIMAL(5,2) NOT NULL DEFAULT 30.00,
    clicks INT NOT NULL DEFAULT 0,
    signups INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY fk_affiliate_user (user_id),
    KEY fk_affiliate_whop (whop_id),
    CONSTRAINT fk_affiliate_user FOREIGN KEY (user_id)
        REFERENCES users4(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_affiliate_whop FOREIGN KEY (whop_id)
        REFERENCES whops(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
