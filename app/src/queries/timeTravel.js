const BankAccount = require("../domain/BankAccount");

async function timeTravel(accountId, timestamp) {
  const result = await db.query(
    `SELECT *
     FROM events
     WHERE aggregate_id = $1
     AND created_at <= $2
     ORDER BY version ASC`,
    [accountId, timestamp]
  );

  const account = new BankAccount();

  for (let event of result.rows) {
    account.apply(event);
  }

  return {
    balance: account.balance,
    status: account.status,
    version: account.version
  };
}