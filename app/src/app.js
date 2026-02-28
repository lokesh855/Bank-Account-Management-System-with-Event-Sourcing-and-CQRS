const express = require('express');
const app = express();

const db = require("./db");
const commands = require("./commands");
const { v4: uuidv4 } = require('uuid');

app.use(express.json());

// Basic health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Create Account
app.post('/accounts', async (req, res) => {
    try {
        const { name } = req.body;
        const accountId = uuidv4();
        await commands.createAccount(accountId, name);
        res.status(201).json({ accountId, message: "Account creation event recorded" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Deposit Money
app.post('/accounts/:id/deposit', async (req, res) => {
    try {
        const { amount } = req.body;
        await commands.depositMoney(req.params.id, amount);
        res.status(200).json({ message: "Deposit event recorded" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Withdraw Money
app.post('/accounts/:id/withdraw', async (req, res) => {
    try {
        const { amount } = req.body;
        await commands.withdrawMoney(req.params.id, amount);
        res.status(200).json({ message: "Withdrawal event recorded" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get Account Summary (Read Model)
app.get('/accounts/:id', async (req, res) => {
    try {
        const result = await db.query(
            "SELECT * FROM account_summaries WHERE account_id = $1",
            [req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Account not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Transaction History (Read Model)
app.get('/accounts/:id/history', async (req, res) => {
    try {
        const result = await db.query(
            "SELECT * FROM transaction_history WHERE account_id = $1 ORDER BY occurred_at DESC",
            [req.params.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;
