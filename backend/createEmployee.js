const readline = require('readline');
const db = require('./db');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  try {
    const employeeID = await ask('Employee ID: ');
    const first_name = await ask('First Name: ');
    const last_name = await ask('Last Name: ');
    const department_id = await ask('Department ID: ');
    const position = await ask('Position: ');
    const password = await ask('Password: ');

    // You may want to hash the password for production!
    const qr_code = null;
    const status = 'active';

    const sql = `
      INSERT INTO employee (employeeID, first_name, last_name, department_id, position, qr_code, status, password)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [employeeID, first_name, last_name, department_id, position, qr_code, status, password], (err, result) => {
      if (err) {
        console.error('Error creating employee:', err);
      } else {
        console.log('Employee created successfully!');
      }
      rl.close();
      db.end();
    });
  } catch (err) {
    console.error('Error:', err);
    rl.close();
    db.end();
  }
}

main();