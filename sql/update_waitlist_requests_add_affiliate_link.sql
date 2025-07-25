ALTER TABLE waitlist_requests
  ADD COLUMN affiliate_link_id INT(10) UNSIGNED DEFAULT NULL AFTER user_id,
  ADD KEY fk_waitlist_afflink (affiliate_link_id),
  ADD CONSTRAINT fk_waitlist_afflink
    FOREIGN KEY (affiliate_link_id)
    REFERENCES affiliate_links(id)
    ON DELETE SET NULL ON UPDATE CASCADE;
