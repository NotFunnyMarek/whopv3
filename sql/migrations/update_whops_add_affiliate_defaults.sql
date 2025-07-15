ALTER TABLE whops
  ADD COLUMN affiliate_default_percent DECIMAL(5,2) NOT NULL DEFAULT 30.00,
  ADD COLUMN affiliate_recurring TINYINT(1) NOT NULL DEFAULT 0;
