ALTER TABLE linked_accounts
  MODIFY COLUMN platform ENUM('instagram','tiktok','youtube','discord') NOT NULL;
