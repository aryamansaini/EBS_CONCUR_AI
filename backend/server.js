// backend/server.js
const express = require('express');
const cors = require('cors');

const { runQuery } = require("./db");


const { connectToDb } = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json()); // ✅ Required to parse JSON request body

// function normalizeSummaryRows(rows) {
//   return rows.map(r => ({
//     program_name: r.PROGRAM_NAME,
//     completed_ok: r.COMPLETED_OK ?? 0,
//     completed_warning: r.COMPLETED_WARNING ?? 0,
//     completed_error: r.COMPLETED_ERROR ?? 0,
//     completed_terminated: r.COMPLETED_TERMINATED ?? 0,
//     running: r.RUNNING ?? 0,
//     pending_standby: r.PENDING_STANDBY ?? 0,
//     scheduled: r.SCHEDULED ?? 0,
//     started_in_window: r.STARTED_IN_WINDOW ?? 0,
//   }));
// }



const PORT = process.env.APP_PORT || 5000;

app.get('/api/test-connection', async (req, res) => {
  try {

    const conn = await connectToDb();
    await conn.close();
    res.json({ success: true, message: 'Database connection successful!' });
  } catch (err) {
    console.error('DB connection error:', err);
    res.status(500).json({ success: false, message: 'Failed to connect to database.' });
  }
});


app.get('/api/test-db-name', async (req, res) => {
  try {
    const rows = await runQuery("SELECT name FROM v$database");
    res.json({ success: true, databaseName: rows });
  } catch (err) {
    console.error("Query error:", err);
    res.status(500).json({ success: false, message: "Query failed" });
  }
});

const {
  SQL_SUMMARY,
  SQL_TS,
  SQL_LONG_RUNNING,
  SQL_TERMINATED_ROWS
} = require("./queries");

// Summary by program
app.get("/api/summary", async (req, res) => {
  const hours = Number(req.query.hours) || 8;
  try {
    const rows = await runQuery(SQL_SUMMARY, { hours });
    res.json(rows);
  } catch (err) {
    console.error("ERROR summary:", err);
    res.status(500).send("DB error");
  }
});

// Trend data
app.get("/api/trend", async (req, res) => {
  const hours = Number(req.query.hours) || 8;
  try {
    const rows = await runQuery(SQL_TS, { hours });
    res.json(rows);
  } catch (err) {
    res.status(500).send("DB error");
  }
});

// Long running jobs
app.get("/api/long-running", async (req, res) => {
  try {
    const rows = await runQuery(SQL_LONG_RUNNING);
    res.json(rows);
  } catch (err) {
    res.status(500).send("DB error");
  }
});

// Terminated jobs
app.get("/api/terminated", async (req, res) => {
  const hours = Number(req.query.hours) || 8;
  try {
    const rows = await runQuery(SQL_TERMINATED_ROWS, { hours });
    res.json(rows);
  } catch (err) {
    res.status(500).send("DB error");
  }
});


app.post("/api/run-query", async (req, res) => {
  const { query } = req.body;

  if (!query || query.trim() === "") {
    return res.status(400).json({ success: false, message: "SQL query is required" });
  }

  try {
    const rows = await runQuery(query);
    res.json({ success: true, rows });
  } catch (err) {
    console.error("Query Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});






app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
