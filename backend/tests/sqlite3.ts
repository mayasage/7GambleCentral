const sqlite3 = require('sqlite3').verbose();

const dbm = new sqlite3.Database(':memory:');

dbm.serialize(() => {
  dbm.run(
    `
    CREATE TABLE sessions (
      sessionId TEXT PRIMARY KEY,
      state JSON NOT NULL
    );
  `,
  );

  dbm.run('INSERT INTO sessions (sessionId, state) VALUES (?, ?)', [
    'abc',
    { a: 1, b: 2 },
  ]);

  dbm.get(
    'SELECT * FROM sessions WHERE sessionId = ?',
    ['abc'],
    (err: any, row: any) => {
      if (!err) {
        console.log(row);
      }
    },
  );

  dbm.all('SELECT * FROM sessions', [], (err: any, row: any) => {
    if (!err) {
      console.log(row);
    }
  });
});

dbm.close();
