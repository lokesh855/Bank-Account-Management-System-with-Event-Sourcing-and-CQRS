// src/services/eventStore.js
const db = require("../db");
const createSnapshot = require("./snapshotService");

async function appendEvents(account, newEvents) {
  for (let event of newEvents) {
    const nextVersion = account.version + 1;

    await db.query(
      `INSERT INTO events (id, aggregate_id, event_type, event_data, version)
       VALUES (gen_random_uuid(), $1, $2, $3, $4)`,
      [
        account.id,
        event.type,
        event.data,
        nextVersion
      ]
    );

    account.version = nextVersion;
    account.apply({
      aggregate_id: account.id,
      event_type: event.type,
      event_data: event.data,
      version: nextVersion
    });

    // 🟢 SNAPSHOT CHECK
    if (account.version % 50 === 0) {
      await createSnapshot(account);
    }
  }
}

module.exports = { appendEvents };