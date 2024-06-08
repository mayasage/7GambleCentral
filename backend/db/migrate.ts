import 'dotenv/config';

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(process.env.DB_PATH);

function drop() {
  db.run(`DROP TABLE users;`, (err: any) => {
    if (err) {
      console.error('Error dropping table:', err.message);
    } else {
      console.log('User table dropped successfully.');
    }
  });
}

function create() {
  db.run(
    `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        refresh_token TEXT UNIQUE
      );
    `,
    (err: { message: any }) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('User table created successfully.');
      }
    },
  );
}

db.serialize(() => {
  drop();
  create();
});

db.close((err: { message: any }) => {
  if (err) {
    console.error('Error closing the database:', err.message);
  } else {
    console.log('Database connection closed.');
  }
});
