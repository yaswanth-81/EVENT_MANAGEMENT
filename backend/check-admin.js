import dotenv from 'dotenv';
import pool from './config/db.js';

dotenv.config();

const email = process.argv[2] || 'admin@event.com';

async function main() {
  const [rows] = await pool.query('SELECT id, username, email, role, created_at FROM users WHERE email = ? LIMIT 1', [email]);
  if (rows.length === 0) {
    console.log(`❌ No user found with email: ${email}`);
    process.exit(1);
  }
  console.log('✅ User found:', rows[0]);
  process.exit(0);
}

main().catch((e) => {
  console.error('❌ Check failed:', e.message);
  process.exit(1);
});

