const sqlite3 = require('sqlite3');
const path = require('path');
const db = new sqlite3.Database(path.resolve(__dirname, 'model_portfolio.db'));
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
  console.log(err || rows);
});
