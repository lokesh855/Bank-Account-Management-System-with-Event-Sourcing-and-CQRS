const db = require("./db");
const loadBankAccount = require("./services/loadAggregate");
const { appendEvents } = require("./services/eventStore");

async function createAccount(accountId, name) {
  const event = {
    type: "AccountCreated",
    data: { name }
  };

  await db.query(
    `INSERT INTO events (id, aggregate_id, event_type, event_data, version)
     VALUES (gen_random_uuid(), $1, $2, $3, 1)`,
    [accountId, event.type, event.data]
  );
}

async function depositMoney(accountId, amount) {
  const account = await loadBankAccount(accountId);

  if (account.status !== "ACTIVE") {
    throw new Error("Account not active");
  }

  if (amount <= 0) {
    throw new Error("Invalid deposit amount");
  }

  const event = {
    type: "MoneyDeposited",
    data: { amount }
  };

  await appendEvents(account, [event]);
}

async function withdrawMoney(accountId, amount) {
  const account = await loadBankAccount(accountId);

  if (account.status !== "ACTIVE") {
    throw new Error("Account not active");
  }

  if (amount <= 0) {
    throw new Error("Invalid withdrawal amount");
  }

  if (account.balance < amount) {
    throw new Error("Insufficient funds");
  }

  const event = {
    type: "MoneyWithdrawn",
    data: { amount }
  };

  await appendEvents(account, [event]);
}

async function closeAccount(accountId) {
  const account = await loadBankAccount(accountId);

  if (account.status !== "ACTIVE") {
    throw new Error("Account already closed");
  }

  if (account.balance !== 0) {
    throw new Error("Account balance must be zero before closing");
  }

  const event = {
    type: "AccountClosed",
    data: {}
  };

  await appendEvents(account, [event]);
}