// Bus Routes — VelTech Bus Tracker
// Express router for bus GPS endpoints

const express = require('express');
const router = express.Router();
const { upsertBusLocation, getBusLocation, getAllBusLocations } = require('../models/Bus');

// GET /api/buses — all buses
router.get('/', async (req, res) => {
  try {
    const buses = await getAllBusLocations();
    res.json({ success: true, data: buses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/buses/:busNo — single bus location
router.get('/:busNo', async (req, res) => {
  try {
    const bus = await getBusLocation(req.params.busNo);
    if (!bus) return res.status(404).json({ success: false, error: 'Bus not found' });
    res.json({ success: true, data: bus });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/buses/update — driver updates GPS
router.post('/update', async (req, res) => {
  const { busNo, lat, lng, driver } = req.body;
  if (!busNo || lat == null || lng == null) {
    return res.status(400).json({ success: false, error: 'busNo, lat, lng are required' });
  }
  try {
    const data = await upsertBusLocation(busNo, lat, lng, driver || 'Unknown');
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
