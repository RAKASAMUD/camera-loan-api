require('dotenv').config();
const express = require('express');
const pool = require('./db');

const app = express();
app.use(express.json());

const STATUSES = ['BORROWED', 'RETURNED'];

// Health check (dipakai untuk bukti konektivitas ke RDS)
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: err.message });
  }
});

// CREATE
app.post('/loans', async (req, res) => {
  const { camera_name, borrower_name, loan_date, due_date } = req.body;
  if (!camera_name || !borrower_name || !loan_date || !due_date) {
    return res.status(400).json({ error: 'camera_name, borrower_name, loan_date, due_date wajib diisi' });
  }
  try {
    const [r] = await pool.query(
      'INSERT INTO loans (camera_name, borrower_name, loan_date, due_date) VALUES (?,?,?,?)',
      [camera_name, borrower_name, loan_date, due_date]
    );
    const [rows] = await pool.query('SELECT * FROM loans WHERE id = ?', [r.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ all
app.get('/loans', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM loans ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ one
app.get('/loans/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM loans WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Loan tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE (mis. ubah status jadi RETURNED)
app.put('/loans/:id', async (req, res) => {
  const { camera_name, borrower_name, loan_date, due_date, status } = req.body;
  if (status && !STATUSES.includes(status)) {
    return res.status(400).json({ error: `status harus salah satu dari ${STATUSES.join(', ')}` });
  }
  try {
    const [r] = await pool.query(
      `UPDATE loans SET
         camera_name = COALESCE(?, camera_name),
         borrower_name  = COALESCE(?, borrower_name),
         loan_date      = COALESCE(?, loan_date),
         due_date       = COALESCE(?, due_date),
         status         = COALESCE(?, status)
       WHERE id = ?`,
      [camera_name, borrower_name, loan_date, due_date, status, req.params.id]
    );
    if (!r.affectedRows) return res.status(404).json({ error: 'Loan tidak ditemukan' });
    const [rows] = await pool.query('SELECT * FROM loans WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
app.delete('/loans/:id', async (req, res) => {
  try {
    const [r] = await pool.query('DELETE FROM loans WHERE id = ?', [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Loan tidak ditemukan' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log(`API listening on :${port}`));
