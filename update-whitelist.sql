-- ChainGuard Evidence Platform - Whitelist Management
-- Add authorized email addresses to the whitelist

-- Add single email addresses
INSERT INTO "Whitelist" (id, email) VALUES 
  (gen_random_uuid()::text, 'admin@chainguard.com'),
  (gen_random_uuid()::text, 'investigator1@police.gov'),
  (gen_random_uuid()::text, 'forensics@lab.org'),
  (gen_random_uuid()::text, 'legal@court.gov');

-- View current whitelist
SELECT * FROM "Whitelist" ORDER BY email;

-- Remove email from whitelist
-- DELETE FROM "Whitelist" WHERE email = 'email@example.com';