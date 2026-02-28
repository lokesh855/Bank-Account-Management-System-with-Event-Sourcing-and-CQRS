// src/projections/eventPoller.js

const db = require("../db");
const processEvent = require("./projector");

async function pollEvents() {
  const events = await db.query(`
    SELECT e.*
    FROM events e
    LEFT JOIN projection_checkpoint p
    ON e.id = p.event_id
    WHERE p.event_id IS NULL
    ORDER BY e.created_at ASC
  `);

  for (let event of events.rows) {
    await processEvent(event);
  }
}

setInterval(pollEvents, 3000); // every 3 seconds

module.exports = pollEvents;