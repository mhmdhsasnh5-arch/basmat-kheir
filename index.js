const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const DB = './data.json';

function load() {
  if (!fs.existsSync(DB)) return { donors: [], proposals: [] };
  return JSON.parse(fs.readFileSync(DB));
}

function save(data) {
  fs.writeFileSync(DB, JSON.stringify(data, null, 2));
}

app.get('/donors', (req, res) => res.json(load().donors));

app.post('/donors', (req, res) => {
  const { name, amount, note } = req.body;
  if (!name || !amount) return res.status(400).json({ error: 'بيانات ناقصة' });
  const db = load();
  const donor = { id: Date.now(), name, amount, note, time: new Date().toISOString() };
  db.donors.unshift(donor);
  save(db);
  res.json(donor);
});

app.delete('/donors/:id', (req, res) => {
  const db = load();
  db.donors = db.donors.filter(d => d.id != req.params.id);
  save(db);
  res.json({ success: true });
});

app.get('/proposals', (req, res) => res.json(load().proposals));

app.post('/proposals', (req, res) => {
  const { name, title, type, desc, cost } = req.body;
  if (!name || !title) return res.status(400).json({ error: 'بيانات ناقصة' });
  const db = load();
  const p = { id: Date.now(), name, title, type, desc, cost, yes: 0, no: 0, status: 'pending', votes: [] };
  db.proposals.unshift(p);
  save(db);
  res.json(p);
});

app.post('/proposals/:id/vote', (req, res) => {
  const { name, isYes, reason } = req.body;
  if (!name || !reason) return res.status(400).json({ error: 'بيانات ناقصة' });
  const db = load();
  const p = db.proposals.find(x => x.id == req.params.id);
  if (!p) return res.status(404).json({ error: 'غير موجود' });
  if (isYes) p.yes++; else p.no++;
  p.votes.push({ name, isYes, reason, time: new Date().toISOString() });
  save(db);
  res.json(p);
});

app.listen(3000, () => console.log('السيرفر شغال: http://localhost:3000'));
