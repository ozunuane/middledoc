-- Create first super admin (password: Admin@MiddleDoc2026!)
-- Generate hash via: npx tsx scripts/create-admin.ts admin@middledoc.com "Platform Admin" "Admin@MiddleDoc2026!"
-- Then run the output INSERT statement against your database.
INSERT INTO super_admins (email, password_hash, name, role)
VALUES ('admin@middledoc.com', '$2a$12$placeholder_hash_replace_me', 'Platform Admin', 'super_admin')
ON CONFLICT (email) DO NOTHING;
