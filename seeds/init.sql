CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY,
    aggregate_id UUID NOT NULL,         -- account_id
    aggregate_type VARCHAR(100) NOT NULL DEFAULT 'BankAccount',
    event_type VARCHAR(100) NOT NULL,   -- AccountCreated, MoneyDeposited, MoneyWithdrawn
    event_data JSONB NOT NULL,          -- payload
    version INT NOT NULL,               -- optimistic concurrency control
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_aggregate_id ON events(aggregate_id);
CREATE INDEX idx_events_created_at ON events(created_at);

CREATE TABLE IF NOT EXISTS snapshots (
    id UUID PRIMARY KEY,
    aggregate_id UUID NOT NULL,
    aggregate_type VARCHAR(100) NOT NULL DEFAULT 'BankAccount',
    state JSONB NOT NULL,              -- serialized account state
    version INT NOT NULL,              -- version at snapshot time
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_snapshots_aggregate_id 
ON snapshots(aggregate_id);


CREATE TABLE IF NOT EXISTS account_summaries (
    account_id UUID PRIMARY KEY,
    account_holder_name VARCHAR(255) NOT NULL,
    balance NUMERIC(15,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    version INT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_account_summaries_status 
ON account_summaries(status);

CREATE TABLE IF NOT EXISTS transaction_history (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,  -- DEPOSIT / WITHDRAWAL
    amount NUMERIC(15,2) NOT NULL,
    occurred_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transaction_history_account_id 
ON transaction_history(account_id);

CREATE INDEX idx_transaction_history_occurred_at 
ON transaction_history(occurred_at);

CREATE TABLE IF NOT EXISTS projection_checkpoint (
    event_id UUID PRIMARY KEY,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);