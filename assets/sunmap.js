// SunMap — reusable solar-exposure + travel-map module.
// Bundled BOM AWAP monthly solar-exposure grid (assets/solar-grid.json),
// Leaflet/OSM map helpers, and distance maths. Used by the setup planner;
// Community Grounds solar siting work can reuse the same API.
window.SunMap = (() => {
  const MLETTER = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const MNAME = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  let gridP = null, tempP = null, tmaxP = null;
  const loadGrid = () => {
    if (!gridP) gridP = fetch('assets/solar-grid.json').then(r => (r.ok ? r.json() : null)).catch(() => null);
    return gridP;
  };
  const loadTempGrid = () => {
    if (!tempP) tempP = fetch('assets/temp-grid.json').then(r => (r.ok ? r.json() : null)).catch(() => null);
    return tempP;
  };
  const loadTmaxGrid = () => {
    if (!tmaxP) tmaxP = fetch('assets/tmax-grid.json').then(r => (r.ok ? r.json() : null)).catch(() => null);
    return tmaxP;
  };

  // Nearest valid cell → array of 12 monthly mean daily exposure values (MJ/m²/day).
  const sample = (grid, lat, lon) => {
    if (!grid) return null;
    let best = -1, bd = Infinity;
    for (let j = 0; j < grid.nrows; j++) for (let i = 0; i < grid.ncols; i++) {
      const idx = j * grid.ncols + i;
      if (grid.months[0][idx] < 0) continue;
      const d = (grid.latTop - (j + 0.5) * grid.cell - lat) ** 2 + (grid.xll + (i + 0.5) * grid.cell - lon) ** 2;
      if (d < bd) { bd = d; best = idx; }
    }
    return best < 0 || bd > 4 ? null : grid.months.map(m => m[best]);
  };

  const toPsh = months => months.map(m => m / 3.6);

  const haversineKm = (a, b) => {
    const R = 6371, dLa = (b.lat - a.lat) * Math.PI / 180, dLo = (b.lon - a.lon) * Math.PI / 180;
    const h = Math.sin(dLa / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLo / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  const createMap = (el, { center = [-25.5, 134.5], zoom = 4, imagery = false, scrollZoom = false } = {}) => {
    if (typeof L === 'undefined' || !el) return null;
    const map = L.map(el, { scrollWheelZoom: scrollZoom }).setView(center, zoom);
    const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · solar © <a href="http://www.bom.gov.au/climate/maps/averages/solar-exposure/">BOM</a>',
      maxZoom: imagery ? 19 : 10
    });
    if (!imagery) { osm.addTo(map); return map; }
    const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Imagery © <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics · solar © <a href="http://www.bom.gov.au/climate/maps/averages/solar-exposure/">BOM</a>',
      maxZoom: 19
    });
    const labels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · © <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19, subdomains: 'abcd'
    });
    sat.addTo(map);
    labels.addTo(map);
    L.control.layers({ 'Satellite': L.layerGroup([sat, labels]), 'Street map': osm }, null, { position: 'bottomright' }).addTo(map);
    return map;
  };

  // 12 small bars of monthly peak sun hours; summer amber, winter blue.
  const renderBars = (el, pshVals) => {
    if (!el) return;
    const max = Math.max(...pshVals, 1);
    el.innerHTML = pshVals.map((v, i) => `<div class="mbar${(i === 11 || i <= 1) ? ' sum' : (i >= 5 && i <= 7) ? ' win' : ''}" style="height:${Math.round(v / max * 48) + 10}px" title="${v.toFixed(1)} peak sun hours"><i>${v.toFixed(1)}</i><b>${MLETTER[i]}</b></div>`).join('');
  };

  const pinIcon = n => typeof L === 'undefined' ? null : L.divIcon({ className: 'stop-pin', html: `<b>${n}</b>`, iconSize: [24, 24], iconAnchor: [12, 12] });

  return { loadGrid, loadTempGrid, loadTmaxGrid, sample, toPsh, haversineKm, createMap, renderBars, pinIcon, MLETTER, MNAME };
})();
