/**
 * Temporary script: promote a user to superadmin
 * Usage:
 *   node -r dotenv/config make-superadmin.js
 *   node -r dotenv/config make-superadmin.js admin@institute.com
 */

import { connectDatabase, query } from './src/database/connection.js';

const email = process.argv[2] || 'admin@institute.com';

await connectDatabase();

const check = await query('SELECT id, email, role FROM users WHERE email = $1', [email]);
if (check.rows.length === 0) {
  console.error(`No user found with email: ${email}`);
  process.exit(1);
}

const user = check.rows[0];
console.log(`Found user: ${user.email} (current role: ${user.role})`);

await query('UPDATE users SET role = $1 WHERE id = $2', ['superadmin', user.id]);
await query(
  'INSERT INTO user_roles (user_id, role_name) VALUES ($1, $2) ON CONFLICT DO NOTHING',
  [user.id, 'superadmin']
);

console.log(`Done! ${user.email} is now superadmin. Please log out and log back in.`);
process.exit(0);
