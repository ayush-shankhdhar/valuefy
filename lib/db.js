import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'model_portfolio.db');

export const getDb = () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error connecting to database:', err);
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
};

export const query = async (sql, params = []) => {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      db.close();
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
};

export const execute = async (sql, params = []) => {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        return reject(err);
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};


export const transaction = async (queries) => {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      let errorOccurred = false;

      for (const { sql, params } of queries) {
        db.run(sql, params, function (err) {
          if (err) {
            errorOccurred = true;
          }
        });
      }

      if (errorOccurred) {
        db.run('ROLLBACK', (err) => {
          db.close();
          reject(new Error('Transaction failed and rolled back'));
        });
      } else {
        db.run('COMMIT', (err) => {
          db.close();
          if (err) reject(err);
          else resolve(true);
        });
      }
    });
  });
};
