CREATE TABLE IF NOT EXISTS whop_pricing_plans (
    id INT(11) NOT NULL AUTO_INCREMENT,
    whop_id INT(10) UNSIGNED NOT NULL,
    plan_name VARCHAR(100) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    price DECIMAL(10,2) DEFAULT NULL,
    currency VARCHAR(3) DEFAULT NULL,
    billing_period VARCHAR(50) DEFAULT NULL,
    sort_order INT(11) NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY whop_id (whop_id),
    CONSTRAINT fk_pricing_whop FOREIGN KEY (whop_id)
        REFERENCES whops(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
