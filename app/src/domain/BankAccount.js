// src/domain/BankAccount.js

class BankAccount {
  constructor() {
    this.id = null;
    this.accountHolderName = null;
    this.balance = 0;
    this.status = "NOT_CREATED";
    this.version = 0;
  }

  // Apply events to rebuild state
  apply(event) {
    switch (event.event_type) {
      case "AccountCreated":
        this.id = event.aggregate_id;
        this.accountHolderName = event.event_data.name;
        this.balance = 0;
        this.status = "ACTIVE";
        break;

      case "MoneyDeposited":
        this.balance += event.event_data.amount;
        break;

      case "MoneyWithdrawn":
        this.balance -= event.event_data.amount;
        break;

      case "AccountClosed":
        this.status = "CLOSED";
        break;
    }

    this.version = event.version;
  }
}

module.exports = BankAccount;