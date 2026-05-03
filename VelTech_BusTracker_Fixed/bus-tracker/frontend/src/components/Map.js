// Map.js — Leaflet map utilities for VelTech Bus Tracker
// Used by both Student and Admin views

/* ── Student Map ── */
export function buildStudentMap({ mapId, route, color, onReady }) {
  const stops = route.stops;
  const mid   = stops[Math.floor(stops.length / 2)];

  const map = L.map(mapId).setView([mid.lat, mid.lng], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap', maxZoom: 18
  }).addTo(map);

  const ll   = stops.map(s => [s.lat, s.lng]);
  const line = L.polyline(ll, { color, weight: 5, opacity: 0.85, dashArray: '10,5' }).addTo(map);

  stops.forEach(s => {
    const col = s.yours ? '#4a9eff' : s.last ? '#a78bfa' : '#ffffff';
    const sz  = s.yours || s.last ? 13 : 9;
    const ic  = L.divIcon({
      html: `<div style="width:${sz}px;height:${sz}px;background:${col};border-radius:50%;border:2.5px solid ${color};box-shadow:0 2px 8px rgba(0,0,0,.7);"></div>`,
      className: '', iconAnchor: [sz / 2, sz / 2]
    });
    L.marker([s.lat, s.lng], { icon: ic })
      .addTo(map)
      .bindPopup(`<b>${s.n}</b><br><small>${s.t}${s.yours ? '<br>📍 Your Stop' : ''}</small>`);
  });

  const yourStop = stops.find(s => s.yours) || stops[stops.length - 2];
  const youIc = L.divIcon({
    html: '<div style="width:20px;height:20px;background:#4a9eff;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 6px rgba(74,158,255,.25);"></div>',
    className: '', iconAnchor: [10, 10]
  });
  L.marker([yourStop.lat, yourStop.lng], { icon: youIc }).addTo(map).bindPopup('<b>📍 You are here</b>');

  const busIc = L.divIcon({
    html: `<div style="background:${color};width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.15rem;box-shadow:0 4px 18px rgba(0,0,0,.6);">🚌</div>`,
    className: '', iconAnchor: [19, 19]
  });
  const busMarker = L.marker([stops[0].lat, stops[0].lng], { icon: busIc }).addTo(map);

  setTimeout(() => {
    map.invalidateSize();
    map.fitBounds(line.getBounds(), { padding: [40, 40] });
  }, 400);

  if (onReady) onReady({ map, busMarker });
  return { map, busMarker };
}

/* ── Admin Map ── */
export function buildAdminMap({ mapId, routes, busMarkers = {} }) {
  const map = L.map(mapId).setView([9.45, 77.95], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap', maxZoom: 18
  }).addTo(map);

  Object.keys(routes).forEach(id => {
    const r  = routes[id];
    const ll = r.stops.map(s => [s.lat, s.lng]);
    L.polyline(ll, { color: r.color, weight: 4, opacity: 0.8, dashArray: '8,5' }).addTo(map);

    r.stops.forEach(s => {
      const ic = L.divIcon({
        html: `<div style="width:9px;height:9px;background:${r.color};border-radius:50%;border:2px solid #fff;opacity:.85;"></div>`,
        className: '', iconAnchor: [4, 4]
      });
      L.marker([s.lat, s.lng], { icon: ic }).addTo(map).bindPopup(`<b>${s.n}</b>`);
    });

    const bs    = r.stops[2] || r.stops[0];
    const busIc = L.divIcon({
      html: `<div style="background:${r.color};width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.05rem;box-shadow:0 4px 14px rgba(0,0,0,.6);">🚌</div>`,
      className: '', iconAnchor: [17, 17]
    });
    busMarkers[id] = L.marker([bs.lat, bs.lng], { icon: busIc })
      .addTo(map)
      .bindPopup(`<b>${id.toUpperCase()}</b><br>Near: ${bs.n}`);
  });

  // College marker
  const colIc = L.divIcon({
    html: '<div style="background:#a78bfa;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.05rem;border:3px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,.6);">🏫</div>',
    className: '', iconAnchor: [18, 18]
  });
  L.marker([9.6750, 78.0550], { icon: colIc }).addTo(map).bindPopup('<b>Vel Tech Multi Tech Engineering College</b>');

  setTimeout(() => {
    map.invalidateSize();
    map.fitBounds([[9.1, 77.75], [9.75, 78.15]], { padding: [20, 20] });
  }, 400);

  return { map, busMarkers };
}

/* ── Haversine distance (km) ── */
export function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371, r = Math.PI / 180;
  const dLat = (lat2 - lat1) * r, dLng = (lng2 - lng1) * r;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
