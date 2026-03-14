import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import pool from './config/db.js';

dotenv.config();

function requireEnv(key) {
  const v = process.env[key];
  if (!v || !v.trim()) throw new Error(`Missing ${key} in backend/.env`);
  return v.trim();
}

async function main() {
  const email = requireEnv('ADMIN_EMAIL');
  const password = requireEnv('ADMIN_PASSWORD');
  const username = (process.env.ADMIN_USERNAME || 'Admin').trim();

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);

  if (existing.length === 0) {
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'admin')",
      [username, email, hashedPassword]
    );
    console.log(`✅ Admin created: id=${result.insertId}, email=${email}`);
  } else {
    const id = existing[0].id;
    await pool.query(
      "UPDATE users SET username = ?, password = ?, role = 'admin' WHERE id = ?",
      [username, hashedPassword, id]
    );
    console.log(`✅ Admin updated: id=${id}, email=${email}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed admin failed:', err.message);
  process.exit(1);
});

