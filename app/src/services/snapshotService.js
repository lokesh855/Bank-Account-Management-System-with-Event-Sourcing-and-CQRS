// src/services/snapshotService.js

const db = require("../db");

async function createSnapshot(account) {
  await db.query(
    `INSERT INTO snapshots (id, aggregate_id, state, version)
     VALUES (gen_random_uuid(), $1, $2, $3)
     ON CONFLICT (aggregate_id)
     DO UPDATE SET
       state = EXCLUDED.state,
       version = EXCLUDED.version,
       created_at = CURRENT_TIMESTAMP`,
    [
      account.id,
      JSON.stringify({
        id: account.id,
        accountHolderName: account.accountHolderName,
        balance: account.balance,
        status: account.status
      }),
      account.version
    ]
  );
}

module.exports = createSnapshot;