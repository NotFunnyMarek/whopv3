ALTER TABLE memberships
  ADD COLUMN affiliate_link_id INT(10) UNSIGNED DEFAULT NULL,
  ADD CONSTRAINT fk_membership_afflink
    FOREIGN KEY (affiliate_link_id)
    REFERENCES affiliate_links(id)
    ON DELETE SET NULL ON UPDATE CASCADE;
