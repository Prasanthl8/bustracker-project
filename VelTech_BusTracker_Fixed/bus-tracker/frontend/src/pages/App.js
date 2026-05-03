// App.js — Main application logic for VelTech Bus Tracker
// Handles page navigation, auth, student/driver/admin modules

'use strict';

/* ══ SUPABASE ══ */
// Load keys from config.js (see config.example.js — never commit real keys!)
var SUPA_URL = (window.VELTECH_CONFIG && window.VELTECH_CONFIG.SUPABASE_URL) || '';
var SUPA_KEY = (window.VELTECH_CONFIG && window.VELTECH_CONFIG.SUPABASE_KEY) || '';
var db = null;
try { if (SUPA_URL && SUPA_KEY) db = window.supabase.createClient(SUPA_URL, SUPA_KEY); } catch (e) {}

/* ══ CREDENTIALS ══ */
var ADMIN_USER = 'admin';
var ADMIN_PASS = (function () { try { return localStorage.getItem('vt_admin_pass') || 'admin123'; } catch (e) { return 'admin123'; } }());
var DRIVER_PASS = (function () { try { return localStorage.getItem('vt_driver_pass') || 'driver123'; } catch (e) { return 'driver123'; } }());

/* ══ STUDENT LOCAL DB ══ */
function loadStudents() { try { return JSON.parse(localStorage.getItem('vt_students') || '[]'); } catch (e) { return []; } }
function saveStudents(a) { try { localStorage.setItem('vt_students', JSON.stringify(a)); } catch (e) {} }
(function () {
  var s = loadStudents();
  if (!s.length) {
    saveStudents([
      { name: 'Arun Kumar', roll: 'VT2024001', pass: 'pass123', bus: 'bus01' },
      { name: 'Priya Rajan', roll: 'VT2024002', pass: 'pass123', bus: 'bus02' },
      { name: 'Karthik S',   roll: 'VT2024003', pass: 'pass123', bus: 'bus03' }
    ]);
  }
}());

/* ══ ROUTES LOCAL DB ══ */
var DEFAULT_ROUTES = {
  bus01: {
    name: 'BUS 01 — Virudhunagar', driver: 'Murugan',
    dep: '7:30 AM', arr: '8:10 AM', dist: '25 km', color: '#f5a623',
    stops: [
      { n: 'Virudhunagar New Bus Stand', lat: 9.5804, lng: 77.9524, t: '7:30 AM' },
      { n: 'Virudhunagar Town',          lat: 9.5875, lng: 77.9612, t: '7:35 AM' },
      { n: 'Rajapalayam Road Junction',  lat: 9.6050, lng: 77.9750, t: '7:40 AM' },
      { n: 'Vembakottai',                lat: 9.6200, lng: 77.9900, t: '7:45 AM' },
      { n: 'Krishnankovil',              lat: 9.6400, lng: 78.0100, t: '7:50 AM' },
      { n: 'Srivilliputtur Bypass',      lat: 9.6600, lng: 78.0350, t: '7:57 AM', yours: true },
      { n: 'Vel Tech Multi Tech College',lat: 9.6750, lng: 78.0550, t: '8:10 AM', last: true }
    ]
  },
  bus02: {
    name: 'BUS 02 — Sivakasi', driver: 'Selvam',
    dep: '7:20 AM', arr: '8:00 AM', dist: '20 km', color: '#4a9eff',
    stops: [
      { n: 'Sivakasi Town Bus Stand', lat: 9.4508, lng: 77.7985, t: '7:20 AM' },
      { n: 'Sivakasi Market',         lat: 9.4580, lng: 77.8100, t: '7:25 AM' },
      { n: 'Alangulam Road',          lat: 9.5000, lng: 77.8600, t: '7:32 AM' },
      { n: 'Watrap',                  lat: 9.5300, lng: 77.9000, t: '7:40 AM' },
      { n: 'Srivilliputtur Town',     lat: 9.6300, lng: 78.0000, t: '7:50 AM', yours: true },
      { n: 'Vel Tech Multi Tech College', lat: 9.6750, lng: 78.0550, t: '8:00 AM', last: true }
    ]
  },
  bus03: {
    name: 'BUS 03 — Kovilpatti', driver: 'Rajan',
    dep: '7:00 AM', arr: '8:00 AM', dist: '42 km', color: '#22d17a',
    stops: [
      { n: 'Kovilpatti Bus Stand',    lat: 9.1745, lng: 77.8681, t: '7:00 AM' },
      { n: 'Kovilpatti Town',         lat: 9.1820, lng: 77.8750, t: '7:05 AM' },
      { n: 'Sankarankovil',           lat: 9.2500, lng: 77.9200, t: '7:18 AM' },
      { n: 'Rajapalayam',             lat: 9.4500, lng: 77.9800, t: '7:38 AM' },
      { n: 'Krishnankovil',           lat: 9.6400, lng: 78.0100, t: '7:50 AM', yours: true },
      { n: 'Vel Tech Multi Tech College', lat: 9.6750, lng: 78.0550, t: '8:00 AM', last: true }
    ]
  }
};

function loadRoutes() { try { return JSON.parse(localStorage.getItem('vt_routes') || 'null') || JSON.parse(JSON.stringify(DEFAULT_ROUTES)); } catch (e) { return JSON.parse(JSON.stringify(DEFAULT_ROUTES)); } }
function saveRoutes(r) { try { localStorage.setItem('vt_routes', JSON.stringify(r)); } catch (e) {} }
var ROUTES = loadRoutes();

/* ══ DRIVER LOCAL DB ══ */
var DEFAULT_DRIVERS = {
  bus01: { name: 'Murugan', phone: '9876543210', status: 'online'  },
  bus02: { name: 'Selvam',  phone: '9876543211', status: 'online'  },
  bus03: { name: 'Rajan',   phone: '9876543212', status: 'offline' }
};
function loadDrivers() { try { return JSON.parse(localStorage.getItem('vt_drivers') || JSON.stringify(DEFAULT_DRIVERS)); } catch (e) { return JSON.parse(JSON.stringify(DEFAULT_DRIVERS)); } }
function saveDrivers(d) { try { localStorage.setItem('vt_drivers', JSON.stringify(d)); } catch (e) {} }
var DRIVERS = loadDrivers();

/* ══ PAGE NAVIGATION ══ */
function goto(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('show'));
  document.getElementById(id).classList.add('show');
  window.scrollTo(0, 0);
}

function logout() {
  if (stuMap) { stuMap.remove(); stuMap = null; }
  try { document.getElementById('adm-user').value = ''; document.getElementById('adm-pass').value = ''; document.getElementById('lf-err').style.display = 'none'; } catch (e) {}
  try { document.getElementById('drv-login-name').value = ''; document.getElementById('drv-login-pass').value = ''; } catch (e) {}
  goto('pg-login');
}

// Expose to global scope (called from inline HTML onclick)
window.goto         = goto;
window.logout       = logout;
window.ROUTES       = ROUTES;
window.DRIVERS      = DRIVERS;
window.loadStudents = loadStudents;
window.saveStudents = saveStudents;
window.saveRoutes   = saveRoutes;
window.saveDrivers  = saveDrivers;
window.loadRoutes   = loadRoutes;
window.loadDrivers  = loadDrivers;
window.db           = db;
