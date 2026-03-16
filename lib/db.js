import Database from 'better-sqlite3';
import path from 'path';

// The db is in New folder
const dbPath = path.resolve(process.cwd(), 'model_portfolio.db');

export const getDb = () => {
  return new Database(dbPath);
};

/**
 * Helper to run a SQL query and return rows.
 */
export const query = async (sql, params = []) => {
  const db = getDb();
  try {
    const stmt = db.prepare(sql);
    return stmt.all(params);
  } finally {
    db.close();
  }
};

/**
 * Helper to run a SQL insert/update and return result.
 */
export const execute = async (sql, params = []) => {
  const db = getDb();
  try {
    const stmt = db.prepare(sql);
    const info = stmt.run(params);
    return { lastID: info.lastInsertRowid, changes: info.changes };
  } finally {
    db.close();
  }
};

/**
 * Helper for running transactions
 */
export const transaction = async (queries) => {
  const db = getDb();
  try {
    const runTransaction = db.transaction((txQueries) => {
      for (const { sql, params } of txQueries) {
        db.prepare(sql).run(params);
      }
    });
    
    runTransaction(queries);
    return true;
  } finally {
    db.close();
  }
};
