// src/projections/projector.js

const db = require("../db");

async function processEvent(event) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Check idempotency
    const existing = await client.query(
      "SELECT 1 FROM projection_checkpoint WHERE event_id = $1",
      [event.id]
    );

    if (existing.rows.length > 0) {
      await client.query("ROLLBACK");
      return; // already processed
    }

    switch (event.event_type) {

      case "AccountCreated":
        await client.query(
          `INSERT INTO account_summaries 
           (account_id, account_holder_name, balance, status, version)
           VALUES ($1, $2, 0, 'ACTIVE', $3)`,
          [
            event.aggregate_id,
            event.event_data.name,
            event.version
          ]
        );
        break;

      case "MoneyDeposited":
        await client.query(
          `UPDATE account_summaries
           SET balance = balance + $1,
               version = $2,
               updated_at = CURRENT_TIMESTAMP
           WHERE account_id = $3`,
          [
            event.event_data.amount,
            event.version,
            event.aggregate_id
          ]
        );

        await client.query(
          `INSERT INTO transaction_history
           (id, account_id, transaction_type, amount, occurred_at)
           VALUES ($1, $2, 'DEPOSIT', $3, $4)`,
          [
            event.id,
            event.aggregate_id,
            event.event_data.amount,
            event.created_at
          ]
        );
        break;

      case "MoneyWithdrawn":
        await client.query(
          `UPDATE account_summaries
           SET balance = balance - $1,
               version = $2,
               updated_at = CURRENT_TIMESTAMP
           WHERE account_id = $3`,
          [
            event.event_data.amount,
            event.version,
            event.aggregate_id
          ]
        );

        await client.query(
          `INSERT INTO transaction_history
           (id, account_id, transaction_type, amount, occurred_at)
           VALUES ($1, $2, 'WITHDRAWAL', $3, $4)`,
          [
            event.id,
            event.aggregate_id,
            event.event_data.amount,
            event.created_at
          ]
        );
        break;

      case "AccountClosed":
        await client.query(
          `UPDATE account_summaries
           SET status = 'CLOSED',
               version = $1,
               updated_at = CURRENT_TIMESTAMP
           WHERE account_id = $2`,
          [
            event.version,
            event.aggregate_id
          ]
        );
        break;
    }

    // Mark event as processed
    await client.query(
      `INSERT INTO projection_checkpoint (event_id)
       VALUES ($1)`,
      [event.id]
    );

    await client.query("COMMIT");

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Projection failed:", error);
  } finally {
    client.release();
  }
}

module.exports = processEvent;