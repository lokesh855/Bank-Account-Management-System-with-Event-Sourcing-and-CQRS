// src/services/loadAggregate.js

const db = require("../db");
const BankAccount = require("../domain/BankAccount");

async function loadBankAccount(accountId) {
  const account = new BankAccount();

  // Try snapshot first
  const snapshot = await db.query(
    "SELECT * FROM snapshots WHERE aggregate_id = $1",
    [accountId]
  );

  if (snapshot.rows.length > 0) {
    const snap = snapshot.rows[0];
    Object.assign(account, snap.state);
    account.version = snap.version;
  }

  // Load events after snapshot version
  const events = await db.query(
    "SELECT * FROM events WHERE aggregate_id = $1 AND version > $2 ORDER BY version ASC",
    [accountId, account.version]
  );

  for (let event of events.rows) {
    account.apply(event);
  }

  return account;
}

module.exports = loadBankAccount;