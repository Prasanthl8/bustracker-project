// server.js — VelTech Bus Tracker Backend
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const busRoutes = require('./routes/busRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/buses', busRoutes);

// Health check
app.get('/', (req, res) => res.json({ status: 'VelTech Bus Tracker API running' }));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
