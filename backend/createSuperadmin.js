require('dotenv').config();    // ✅ Make sure env loads here too
const db = require('./db');
const bcrypt = require('bcrypt');

async function createSuperadmin() {
  try {
    const name = 'Super Admin';
    const username = 'superadmin';
    const password = 'reign123';
    const role = 'superadmin';

    const hashed = await bcrypt.hash(password, 10);

    // Check if superadmin already exists
    const [rows] = await db.query(
      'SELECT * FROM Admin WHERE username = ?',
      [username]
    );

    if (rows.length > 0) {
      console.log('Superadmin already exists.');
      process.exit(0);
    }

    await db.query(
      'INSERT INTO Admin (name, username, password, role) VALUES (?, ?, ?, ?)',
      [name, username, hashed, role]
    );

    console.log('✅ Superadmin created!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

createSuperadmin();
