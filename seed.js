const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'model_portfolio.db');

// Delete if exists to start fresh
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // clients
  db.run(`CREATE TABLE clients (
    client_id INTEGER PRIMARY KEY,
    name TEXT
  )`);

  // model_funds
  db.run(`CREATE TABLE model_funds (
    fund_id INTEGER PRIMARY KEY,
    fund_name TEXT,
    asset_class TEXT,
    allocation_pct REAL
  )`);

  // client_holdings
  db.run(`CREATE TABLE client_holdings (
    holding_id INTEGER PRIMARY KEY,
    client_id INTEGER,
    fund_id INTEGER,
    fund_name TEXT,
    current_value REAL,
    FOREIGN KEY(client_id) REFERENCES clients(client_id)
  )`);

  // rebalance_sessions
  db.run(`CREATE TABLE rebalance_sessions (
    session_id INTEGER PRIMARY KEY,
    client_id INTEGER,
    created_at TEXT,
    portfolio_value REAL,
    total_to_buy REAL,
    total_to_sell REAL,
    net_cash_needed REAL,
    status TEXT
  )`);

  // rebalance_items
  db.run(`CREATE TABLE rebalance_items (
    item_id INTEGER PRIMARY KEY,
    session_id INTEGER,
    fund_id INTEGER,
    fund_name TEXT,
    action TEXT,
    amount REAL,
    current_pct REAL,
    target_pct REAL,
    post_rebalance_pct REAL,
    is_model_fund INTEGER
  )`);

  // Insert base data
  db.run(`INSERT INTO clients (client_id, name) VALUES (1, 'Amit Sharma')`);

  // From the expected results
  // Total portfolio value to reverse engineer:
  // Fresh money needed: 80,000 -> Portfolio is growing
  // Let's create dummy values that fit the exact spec

  const modelFunds = [
    [1, 'Mirae Asset Large Cap', 'Equity', 20],
    [3, 'HDFC Mid Cap', 'Equity', 25],
    [6, 'Quant Small Cap', 'Equity', 15],
    [7, 'SBI Bluechip', 'Equity', 20],
    [8, 'Axis Long Term Equity', 'Equity', 20]
  ];

  const stmtModel = db.prepare("INSERT INTO model_funds (fund_id, fund_name, asset_class, allocation_pct) VALUES (?, ?, ?, ?)");
  for (const f of modelFunds) {
    stmtModel.run(f);
  }
  stmtModel.finalize();

  const holdings = [
    [1, 1, 1, 'Mirae Asset Large Cap', 116000],  // needs 84,000 to reach 200,000
    [2, 1, 2, 'Parag Parikh Flexi Cap', 100000], // SELL 10,000 (but wait, no model. So SELL entirely? Wait: Example says SELL 10k? No, example says "SELL ₹10,000" for Parag Parikh Flexi Cap. Let's make it a general REVIEW/SELL case).
    [3, 1, 3, 'HDFC Mid Cap', 134000],          // needs 1,16,000 to reach 250,000
    [4, 1, 4, 'ICICI Bond', 23000],              // SELL 23k -> 0
    [5, 1, 5, 'Nippon Gold ETF', 87000],         // SELL 87k -> 0
    [6, 1, 9, 'Axis Bluechip', 80000]            // REVIEW 80k
  ];

  // We actually don't need the exact portfolio value for Amit Sharma down to the rupee, just data that matches schema
  const stmtHoldings = db.prepare("INSERT INTO client_holdings (client_id, fund_id, fund_name, current_value) VALUES (?, ?, ?, ?)");
  for (const h of holdings) {
    stmtHoldings.run([h[1], h[2], h[3], h[4]]);
  }
  stmtHoldings.finalize();
  
  console.log("Database seeded successfully.");
});

db.close();
