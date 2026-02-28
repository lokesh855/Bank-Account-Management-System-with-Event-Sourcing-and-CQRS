// src/queries/getAccountSummary.js

const db = require("../db");

async function getAccountSummary(accountId) {
  const result = await db.query(
    `SELECT account_id, account_holder_name, balance, status, updated_at
     FROM account_summaries
     WHERE account_id = $1`,
    [accountId]
  );

  if (result.rows.length === 0) {
    throw new Error("Account not found");
  }

  return result.rows[0];
}

module.exports = getAccountSummary;