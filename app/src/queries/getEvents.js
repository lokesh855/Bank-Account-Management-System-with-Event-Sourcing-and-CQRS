async function getEvents(accountId) {
  const result = await db.query(
    `SELECT event_type, event_data, version, created_at
     FROM events
     WHERE aggregate_id = $1
     ORDER BY version ASC`,
    [accountId]
  );

  return result.rows;
}