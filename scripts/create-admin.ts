// Create a super admin INSERT statement with a properly hashed password.
// Run with: npx tsx scripts/create-admin.ts admin@middledoc.com "Platform Admin" "YourPassword123!"
import bcryptjs from 'bcryptjs'

async function main() {
  const [email, name, password] = process.argv.slice(2)

  if (!email || !name || !password) {
    console.error('Usage: npx tsx scripts/create-admin.ts <email> <name> <password>')
    console.error('Example: npx tsx scripts/create-admin.ts admin@middledoc.com "Platform Admin" "Admin@MiddleDoc2026!"')
    process.exit(1)
  }

  if (password.length < 10) {
    console.error('Error: Password must be at least 10 characters')
    process.exit(1)
  }

  const hash = await bcryptjs.hash(password, 12)

  console.log('-- Run this SQL against your database to create the admin:')
  console.log(`INSERT INTO super_admins (email, password_hash, name, role)`)
  console.log(`VALUES ('${email}', '${hash}', '${name}', 'super_admin')`)
  console.log(`ON CONFLICT (email) DO NOTHING;`)
}

main()
