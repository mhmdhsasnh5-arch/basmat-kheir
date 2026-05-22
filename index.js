const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://mhmdhsasnh5_db_user:0cfQACRPU7XlcaLK@cluster0.tmxfauu.mongodb.net/basmat?appName=Cluster0';

mongoose.connect(MONGO_URI).then(() => console.log('MongoDB connected')).catch(e => console.log(e));

const donorSchema = new mongoose.Schema({ id: Number, name: String, amount: Number, note: String, time: String, status: { type: String, default: 'pending' } });
const proposalSchema = new mongoose.Schema({ id: Number, name: String, title: String, type: String, desc: String, cost: Number, yes: Number, no: Number, status: String, votes: Array });

const Donor = mongoose.model('Donor', donorSchema);
const Proposal = mongoose.model('Proposal', proposalSchema);

app.get('/donors', async (req, res) => res.json(await Donor.find()));
app.post('/donors', async (req, res) => { const { name, amount, note } = req.body; if (!name || !amount) return res.status(400).json({ error: 'ناقص' }); const d = await Donor.create({ id: Date.now(), name, amount, note, time: new Date().toISOString() }); res.json(d); });
app.delete('/donors/:id', async (req, res) => { await Donor.deleteOne({ id: req.params.id }); res.json({ success: true }); });

app.get('/proposals', async (req, res) => res.json(await Proposal.find()));
app.post('/proposals', async (req, res) => { const { name, title, type, desc, cost } = req.body; if (!name || !title) return res.status(400).json({ error: 'ناقص' }); const p = await Proposal.create({ id: Date.now(), name, title, type, desc, cost, yes: 0, no: 0, status: 'pending', votes: [] }); res.json(p); });
app.post('/proposals/:id/vote', async (req, res) => { const { name, isYes, reason } = req.body; const p = await Proposal.findOne({ id: req.params.id }); if (!p) return res.status(404).json({ error: 'مو موجود' }); if (isYes) p.yes++; else p.no++; p.votes.push({ name, isYes, reason, time: new Date().toISOString() }); await p.save(); res.json(p); });

app.listen(3000, () => console.log('http://localhost:3000'));
