// src/queries/getTransactionHistory.js

const db = require("../db");

async function getTransactionHistory(accountId) {
  const result = await db.query(
    `SELECT transaction_type, amount, occurred_at
     FROM transaction_history
     WHERE account_id = $1
     ORDER BY occurred_at DESC`,
    [accountId]
  );

  return result.rows;
}

module.exports = getTransactionHistory;