import 'dotenv/config';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const [username, password, fullName, roleArg] = process.argv.slice(2);
if (!username || !password) {
  console.error('Usage: node backend/scripts/create-user.js <username> <password> [full_name] [role]');
  process.exit(1);
}
const role = roleArg === 'admin' ? 'admin' : 'respondent';

const pool = new Pool({ connectionString: DATABASE_URL });

const run = async () => {
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    'INSERT INTO users (username, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, username, full_name, role',
    [username, hash, fullName || null, role]
  );
  console.log('created user', rows[0]);
  await pool.end();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
