// Bus Model — VelTech Bus Tracker
// Supabase table: buses
// Columns: bus_no (PK), lat, lng, driver, updated_at

const { createClient } = require('@supabase/supabase-js');

const SUPA_URL = process.env.SUPABASE_URL;
const SUPA_KEY = process.env.SUPABASE_KEY;

if (!SUPA_URL || !SUPA_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_KEY in environment variables. Check your .env file.');
}

const db = createClient(SUPA_URL, SUPA_KEY);

/**
 * Upsert bus GPS location
 * @param {string} busNo  - e.g. 'bus01'
 * @param {number} lat
 * @param {number} lng
 * @param {string} driver - driver name
 */
async function upsertBusLocation(busNo, lat, lng, driver) {
  const { data, error } = await db
    .from('buses')
    .upsert(
      { bus_no: busNo, lat, lng, driver, updated_at: new Date().toISOString() },
      { onConflict: 'bus_no' }
    );
  if (error) throw error;
  return data;
}

/**
 * Fetch latest location for a bus
 * @param {string} busNo
 */
async function getBusLocation(busNo) {
  const { data, error } = await db
    .from('buses')
    .select('lat,lng,driver,updated_at')
    .eq('bus_no', busNo)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Fetch all buses' latest locations
 */
async function getAllBusLocations() {
  const { data, error } = await db
    .from('buses')
    .select('bus_no,lat,lng,driver,updated_at');
  if (error) throw error;
  return data;
}

module.exports = { upsertBusLocation, getBusLocation, getAllBusLocations };
