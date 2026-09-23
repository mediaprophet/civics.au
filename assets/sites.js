// Community site planner — energy & amenity modelling for a community ground / showground / reserve.
(() => {
  const planner = document.querySelector('[data-site-planner]');
  if (!planner) return;
  const SM = window.SunMap;
  const field = n => planner.querySelector(`[data-f="${n}"]`);
  const num = n => Number(field(n)?.value) || 0;
  const money = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 });
  const verdict = (cls, text) => `<div class="verdict ${cls}"><span class="vtag">${cls}</span><span>${text}</span></div>`;
  const ORIENT = { n: 1.00, ne: 0.96, nw: 0.96, e: 0.88, w: 0.88, se: 0.76, sw: 0.76, s: 0.65, flat: 0.92 };

  // ---- Scenarios ----
  const loadRow = ([ck, name, kw, hrs, qty, cost]) => {
    const d = document.createElement('div');
    d.className = 'item-row dev-row';
    d.innerHTML = `<input type="checkbox" data-load${ck ? ' checked' : ''}><input class="item-name" type="text" value="${name}" aria-label="Load"><span class="dev-spec"><input data-kw type="number" min="0" max="200" step="0.1" value="${kw}" aria-label="Kilowatts"> kW × <input data-hrs type="number" min="0" max="24" step="0.5" value="${hrs}" aria-label="Hours per day"> h/day × <input data-dqty type="number" min="1" max="50" step="1" value="${qty}" aria-label="Quantity"></span><span class="money-input">$<input data-cost type="number" min="0" max="2000000" step="100" value="${cost}"> upgrade</span><button type="button" class="item-del" aria-label="Remove item" title="Remove">×</button>`;
    return d;
  };
  const roofRow = ([ck, name, m2, usable, orient, pitch]) => {
    const d = document.createElement('div');
    d.className = 'item-row roof-row';
    d.innerHTML = `<input type="checkbox" data-roof${ck ? ' checked' : ''}><input class="item-name" type="text" value="${name}" aria-label="Roof segment"><span class="roof-spec"><input data-m2 type="number" min="0" max="20000" step="5" value="${m2}" aria-label="Roof area"> m² × <input data-usable type="number" min="0" max="100" step="5" value="${usable}" aria-label="Usable percent">% usable · faces <select data-orient aria-label="Facing direction"><option value="n">N</option><option value="ne">NE</option><option value="e">E</option><option value="se">SE</option><option value="s">S</option><option value="sw">SW</option><option value="w">W</option><option value="nw">NW</option><option value="flat">Flat</option></select> · pitch <input data-pitch type="number" min="0" max="60" step="1" value="${pitch}" aria-label="Roof pitch degrees">° <span class="roof-out" data-kwp></span></span><button type="button" class="item-del" aria-label="Remove item" title="Remove">×</button>`;
    d.querySelector('[data-orient]').value = orient;
    return d;
  };
  const cwRow = ([ck, name, kw, hrs, type, cost]) => {
    const d = document.createElement('div');
    d.className = 'item-row dev-row';
    d.innerHTML = `<input type="checkbox" data-cw${ck ? ' checked' : ''}><input class="item-name" type="text" value="${name}" aria-label="Workload"><span class="dev-spec"><input data-kw type="number" min="0" max="500" step="0.5" value="${kw}" aria-label="Kilowatts"> kW × <input data-hrs type="number" min="0" max="24" step="0.5" value="${hrs}" aria-label="Hours per day"> h/day · <select data-wtype aria-label="When it runs"><option value="always">always-on</option><option value="surplus">surplus only</option></select></span><span class="money-input">$<input data-cost type="number" min="0" max="5000000" step="500" value="${cost}"> hardware</span><button type="button" class="item-del" aria-label="Remove item" title="Remove">×</button>`;
    d.querySelector('[data-wtype]').value = type;
    return d;
  };

  const SCN = {
    retrofit: {
      label: 'Existing site — grid-connected upgrade',
      desc: 'An existing showground or reserve with grid power — retrofitting solar, battery and EV charging onto the site as it runs today. The quarterly bill sets the baseline load.',
      fields: { billQtr: 1800, supplyKva: 100, tariff: 0.30, fit: 0.05, bays: 20, occ: 55, bayKwh: 5, evQty: 2, evKw: '22', evSessions: 3, evKwh: 25, evCost: 8000, evPrice: 0.50, gmKw: 110, solCostKw: 1100, panelDens: 0.22, sysEff: 78, battKwh: 140, battCostKwh: 700, watKl: 0, watKwh: 0.5, watCost: 25000, curtailKwh: 0, curtailBuy: 0.02, peakSell: 0.35, rtEff: 88, regPop: 0, dvNeed: 0, rentStress: 0, seasonal: 0, homeless: 0 },
      loads: [
        [1, 'Hot water — heat-pump system, amenities block', 3.5, 4, 1, 4500],
        [1, 'Ablutions — lighting, exhaust, hand dryers', 0.8, 12, 1, 2000],
        [1, 'Camp kitchen / kiosk — cooktops, fridge, urn', 3, 4, 1, 0],
        [1, 'Laundry — washers & dryers', 2, 5, 1, 0],
        [1, 'Office, Wi-Fi & security lighting', 0.5, 10, 1, 0],
        [1, 'Water / bore pump', 1.5, 3, 1, 0],
        [1, 'Oval floodlights — avg across week', 6, 1, 1, 12000],
      ],
      roofs: [
        [1, 'Amenities block roof', 120, 70, 'n', 10],
        [1, 'Hall / kiosk roof', 200, 60, 'e', 15],
        [0, 'Machinery shed roof', 150, 70, 'w', 5],
      ],
    },
    resilience: {
      label: 'Resilience hub',
      desc: 'A site built — or upgraded — to reliably generate more than it uses: enough surplus and storage to run as a community refuge during disasters, support the grid when connected, or stand alone where no grid exists. With no existing infrastructure, the diesel-genset comparison prices the alternative.',
      fields: { billQtr: 0, supplyKva: 0, tariff: 0.30, fit: 0.05, bays: 40, occ: 35, bayKwh: 5, evQty: 1, evKw: '50', evSessions: 4, evKwh: 40, evCost: 25000, evPrice: 0.50, gmKw: 120, solCostKw: 1100, panelDens: 0.22, sysEff: 78, battKwh: 280, battCostKwh: 700, autoDays: 2, critShare: 40, fuelL: 2.00, fuelKwh: 3.5, watKl: 8, watKwh: 0.5, watCost: 25000, curtailKwh: 0, curtailBuy: 0.02, peakSell: 0.35, rtEff: 88, regPop: 1200, dvNeed: 10, rentStress: 45, seasonal: 30, homeless: 15 },
      loads: [
        [1, 'Comms, Wi-Fi & device charging', 0.5, 16, 1, 0],
        [1, 'Medical & kitchen refrigeration', 1.2, 10, 1, 0],
        [1, 'Kitchen — cooktops, urn, hot water', 4, 5, 1, 4500],
        [1, 'Water & sewerage pumps', 2, 6, 1, 0],
        [1, 'Hall & bunkhouse — lighting, fans, AC', 3, 8, 1, 0],
        [1, 'Showers — heat-pump hot water', 3, 6, 1, 0],
      ],
      roofs: [
        [1, 'Community hall roof', 400, 80, 'n', 10],
        [1, 'Emergency shed roof', 250, 90, 'flat', 0],
        [1, 'Carport / covered walkway', 180, 85, 'flat', 0],
      ],
    },
    microgrid: {
      label: 'Community microgrid',
      desc: 'A small community sharing generation across local buildings — school, supermarket, council offices, shops, hall — behind microgrid controls and metering, for lower bills and the ability to island during outages. Each roof row is a host building; each load row is that building\'s daily demand.',
      fields: { billQtr: 0, supplyKva: 200, tariff: 0.30, fit: 0.05, bays: 0, occ: 0, bayKwh: 5, evQty: 2, evKw: '22', evSessions: 6, evKwh: 30, evCost: 8000, evPrice: 0.50, gmKw: 125, solCostKw: 1100, panelDens: 0.22, sysEff: 78, battKwh: 350, battCostKwh: 700, participants: 8, mgCost: 80000, mgCrit: 30, mgAutoDays: 1, watKl: 0, watKwh: 0.5, watCost: 25000, curtailKwh: 250, curtailBuy: 0.02, peakSell: 0.35, rtEff: 88, regPop: 2500, dvNeed: 15, rentStress: 120, seasonal: 80, homeless: 20 },
      loads: [
        [1, 'Primary school — classrooms & HVAC', 15, 6, 1, 0],
        [1, 'Supermarket — refrigeration & HVAC', 20, 10, 1, 0],
        [1, 'Council office & library', 5, 8, 1, 0],
        [1, 'Bank / shops strip', 4, 8, 1, 0],
        [1, 'Community hall & kitchen', 6, 4, 1, 0],
        [1, 'Street & security lighting', 3, 11, 1, 0],
        [1, 'Water & sewer pumps', 5, 8, 1, 0],
      ],
      roofs: [
        [1, 'School hall roof', 400, 80, 'n', 10],
        [1, 'Supermarket roof', 700, 85, 'flat', 0],
        [1, 'Council office roof', 180, 70, 'e', 15],
        [1, 'Community hall roof', 250, 75, 'n', 20],
      ],
    },
    digital: {
      label: 'Digital cooperative',
      desc: 'A community digital cooperative — a local datacentre hosting internet access, community services and AI compute so they keep working when the wider network doesn\'t. The compute load runs 24/7 and never sleeps: generation, storage and islanding have to be sized for uptime.',
      fields: { billQtr: 0, supplyKva: 150, tariff: 0.30, fit: 0.05, bays: 0, occ: 0, bayKwh: 5, evQty: 1, evKw: '22', evSessions: 4, evKwh: 30, evCost: 8000, evPrice: 0.50, gmKw: 80, solCostKw: 1100, panelDens: 0.22, sysEff: 78, battKwh: 250, battCostKwh: 700, pop: 2000, tbPer: 1, bizQty: 30, bizTb: 20, wattTb: 1.5, pue: 35, dcCost: 150000, members: 500, dcCrit: 50, dcAutoDays: 1, watKl: 0, watKwh: 0.5, watCost: 25000, extShare: 25, tbPrice: 8, cwPrice: 1.5, curtailKwh: 250, curtailBuy: 0.02, peakSell: 0.35, rtEff: 88, regPop: 2000, dvNeed: 12, rentStress: 90, seasonal: 50, homeless: 15 },
      loads: [
        [1, 'Community Wi-Fi / ISP towers & backhaul', 1.5, 24, 1, 0],
        [1, 'Library & community access point', 2, 10, 1, 0],
        [1, 'Council office & services', 4, 8, 1, 0],
        [1, 'Coop hall — meeting rooms & kitchen', 3, 6, 1, 0],
        [1, 'Street & site security lighting', 2, 12, 1, 0],
      ],
      roofs: [
        [1, 'Datacentre roof', 300, 85, 'flat', 0],
        [1, 'School hall roof', 400, 80, 'n', 10],
        [1, 'Council depot roof', 250, 75, 'n', 15],
        [0, 'Supermarket roof', 600, 85, 'flat', 0],
      ],
      cwloads: [
        [1, 'Public safety — CCTV, sensors, ANPR, emergency comms', 2, 24, 'always', 15000],
        [1, 'Local services — web, records, bookings, email', 1.5, 24, 'always', 0],
        [1, 'Agricultural AI — sensor ingest & monitoring', 1, 24, 'always', 8000],
        [1, 'Agricultural AI — crop / drone analytics (batch)', 4, 6, 'surplus', 25000],
        [1, 'AI training / inference bursts — opportunistic', 10, 4, 'surplus', 60000],
      ],
    },
    greenfield: {
      label: 'Greenfield site — new build',
      desc: 'A completely new community ground — no existing buildings, no bill to baseline from, possibly no grid connection yet. Everything is designed at once: powered bays, amenities, water and the energy system sized for always-on from day one.',
      fields: { billQtr: 0, supplyKva: 0, tariff: 0.30, fit: 0.05, bays: 30, occ: 60, bayKwh: 5, evQty: 1, evKw: '22', evSessions: 3, evKwh: 30, evCost: 8000, evPrice: 0.50, gmKw: 150, solCostKw: 1100, panelDens: 0.22, sysEff: 78, battKwh: 150, battCostKwh: 700, watKl: 4, watKwh: 0.5, watCost: 25000, curtailKwh: 0, curtailBuy: 0.02, peakSell: 0.35, rtEff: 88, regPop: 1500, dvNeed: 8, rentStress: 60, seasonal: 40, homeless: 12 },
      loads: [
        [1, 'Amenities block — hot water, lighting, dryers', 4, 6, 1, 35000],
        [1, 'Camp kitchen — cooktops, fridges, urn', 3, 5, 1, 12000],
        [1, 'Laundry — washers & dryers', 2, 5, 1, 8000],
        [1, 'Office & Wi-Fi — admin, bookings, security', 0.5, 12, 1, 6000],
        [1, 'Bore / water pump', 1.5, 4, 1, 4000],
      ],
      roofs: [
        [1, 'Planned amenities building', 160, 80, 'n', 10],
        [0, 'Planned hall / pavilion', 250, 75, 'n', 15],
      ],
    },
  };

  let grid = null, lat = -35.28, lon = 149.13, pshMonths = null, lastAO = null, lastCalc = null;
  const hasLab = !!document.getElementById('model-app'); // true on model.html — planner outputs feed the lab's solar model and report

  const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  const recalc = () => {
    const result = planner.querySelector('[data-site-result]');
    const verdicts = [], lines = [];
    const scn = planner.querySelector('[data-scn]:checked')?.value || 'retrofit';
    const tariff = num('tariff') || 0.30, fit = num('fit'), sysEff = (num('sysEff') || 78) / 100;
    const dens = num('panelDens') || 0.22;

    // ---- Loads ----
    let amenKwh = 0, amenCost = 0;
    planner.querySelectorAll('[data-load]').forEach(cb => {
      if (!cb.checked) return;
      const row = cb.closest('.item-row');
      const kw = Number(row?.querySelector('[data-kw]')?.value) || 0;
      const hrs = Number(row?.querySelector('[data-hrs]')?.value) || 0;
      const qty = Number(row?.querySelector('[data-dqty]')?.value) || 1;
      amenKwh += kw * hrs * qty;
      amenCost += Number(row?.querySelector('[data-cost]')?.value) || 0;
    });
    const billQtr = num('billQtr');
    const baseKwh = billQtr > 0 ? billQtr / (tariff * 91) : 0;
    const bays = num('bays'), occ = num('occ') / 100, bayKwh = bays * occ * num('bayKwh');
    const evQty = num('evQty'), evKw = num('evKw'), evKwhDay = evQty * num('evSessions') * num('evKwh');
    const pop = num('pop'), tbPer = num('tbPer'), bizQty = num('bizQty'), bizTb = num('bizTb'), wattTb = num('wattTb'), pue = num('pue');
    const dcTb = pop * tbPer + bizQty * bizTb;
    const dcItKw = dcTb * wattTb / 1000;
    let cwAlwaysKwh = 0, cwSurplusKwh = 0, cwCost = 0;
    planner.querySelectorAll('[data-cw]').forEach(cb => {
      if (!cb.checked) return;
      const row = cb.closest('.item-row');
      const kwh = (Number(row?.querySelector('[data-kw]')?.value) || 0) * (Number(row?.querySelector('[data-hrs]')?.value) || 0);
      if (row?.querySelector('[data-wtype]')?.value === 'surplus') cwSurplusKwh += kwh;
      else cwAlwaysKwh += kwh;
      cwCost += Number(row?.querySelector('[data-cost]')?.value) || 0;
    });
    const dcKwhDay = scn === 'digital' ? (dcItKw * 24 + cwAlwaysKwh) * (1 + pue / 100) : 0;
    const watKl = num('watKl'), watKwhDay = watKl * num('watKwh');
    const loadKwh = baseKwh + amenKwh + bayKwh + evKwhDay + dcKwhDay + watKwhDay;

    // ---- Solar ----
    let kWp = 0, roofM2 = 0;
    const segGen = new Array(12).fill(0);
    const latAbs = Math.min(38, Math.max(15, Math.abs(lat)));
    planner.querySelectorAll('[data-roof]').forEach(cb => {
      if (!cb.checked) return;
      const row = cb.closest('.item-row');
      const m2 = (Number(row?.querySelector('[data-m2]')?.value) || 0) * ((Number(row?.querySelector('[data-usable]')?.value) || 0) / 100);
      const o = ORIENT[row?.querySelector('[data-orient]')?.value] ?? 1;
      const pitch = Number(row?.querySelector('[data-pitch]')?.value) || 0;
      const pf = Math.max(0.8, Math.cos((pitch - latAbs) * Math.PI / 180));
      const kw = m2 * dens;
      kWp += kw; roofM2 += m2;
      const out = row?.querySelector('[data-kwp]');
      if (out) out.textContent = `→ ~${kw.toFixed(0)} kWp`;
      for (let m = 0; m < 12; m++) segGen[m] += kw * (pshMonths ? pshMonths[m] : (m >= 10 || m <= 1 ? num('pshSum') : (m >= 5 && m <= 7 ? num('pshWin') : (num('pshSum') + num('pshWin')) / 2))) * o * pf * sysEff;
    });
    planner.querySelectorAll('[data-roof]:not(:checked)').forEach(cb => {
      const out = cb.closest('.item-row')?.querySelector('[data-kwp]');
      if (out) out.textContent = '';
    });
    const gmKw = num('gmKw'), groundKwh = m => gmKw * (pshMonths ? pshMonths[m] : (m >= 10 || m <= 1 ? num('pshSum') : (m >= 5 && m <= 7 ? num('pshWin') : (num('pshSum') + num('pshWin')) / 2))) * sysEff;
    const gen = segGen.map((g, m) => g + groundKwh(m));
    const sumGen = (gen[11] + gen[0] + gen[1]) / 3, winGen = (gen[5] + gen[6] + gen[7]) / 3;
    const worstGen = Math.min(...gen), worstMonth = gen.indexOf(worstGen);
    const totKwp = kWp + gmKw;

    // ---- Costs & balance ----
    let extRevTotal = 0, tradeRevYr = 0;
    const battKwh = num('battKwh');
    const mgCost = scn === 'microgrid' ? num('mgCost') : scn === 'digital' ? num('dcCost') + cwCost : 0;
    const upfront = amenCost + totKwp * num('solCostKw') + battKwh * num('battCostKwh') + evQty * num('evCost') + mgCost + (watKl > 0 ? num('watCost') : 0);
    let importYr = 0, exportYr = 0, annGen = 0;
    for (let m = 0; m < 12; m++) {
      importYr += Math.max(0, loadKwh - gen[m]) * monthDays[m];
      exportYr += Math.max(0, gen[m] - loadKwh) * monthDays[m] * 0.5; // only half of surplus assumed exportable/usable
      annGen += gen[m] * monthDays[m];
    }
    const annLoad = loadKwh * 365;
    const beforeYr = baseKwh * 365 * tariff;
    const noSolarYr = loadKwh * 365 * tariff; // what serving this full demand from the grid costs
    const afterYr = importYr * tariff - exportYr * fit;
    const savings = noSolarYr - afterYr;

    // Scenario extras
    const kva = num('supplyKva');
    const critShare = scn === 'resilience' ? num('critShare') : scn === 'microgrid' ? num('mgCrit') : scn === 'digital' ? num('dcCrit') : 0;
    const autoTarget = scn === 'resilience' ? num('autoDays') : scn === 'microgrid' ? num('mgAutoDays') : scn === 'digital' ? num('dcAutoDays') : 0;
    const critLoad = loadKwh * critShare / 100;
    const autDays = critLoad > 0 ? battKwh / critLoad : 0;

    // ---- Demographics — supported-accommodation duty ----
    const regPop = num('regPop'), dvNeed = num('dvNeed'), rentStress = num('rentStress'), seasonal = num('seasonal'), homeless = num('homeless');
    const standingNeed = dvNeed + homeless; // people needing a place now
    const freeBays = Math.floor(Math.max(0, bays * (1 - occ)));
    const fuelL = num('fuelL') || 2, fuelKwh = num('fuelKwh') || 3.5;
    const dieselRate = fuelL / fuelKwh * 1.15; // fuel + ~15% servicing per kWh
    const dieselYr = annLoad * dieselRate;

    // Always-on sizing target: worst-month solar covers the daily load,
    // battery covers the night share or the scenario's autonomy target.
    const worstPsh = pshMonths ? Math.min(...pshMonths) : num('pshWin');
    const needKwp = worstPsh > 0 ? loadKwh / (worstPsh * sysEff * 0.92) : 0;
    const needBatt = Math.max(loadKwh * 0.4, critShare > 0 ? autoTarget * critLoad : 0);
    lastAO = { needKwp, needBatt, roofKwp: kWp };

    // ---- Verdicts ----
    if (loadKwh > 0) {
      lines.push(`Site demand ≈ ${loadKwh.toFixed(0)} kWh/day${baseKwh > 0 ? ` (existing baseline ~${baseKwh.toFixed(0)})` : ''} — amenities ${amenKwh.toFixed(0)}, occupied bays ${bayKwh.toFixed(0)}, EV charging ${evKwhDay.toFixed(0)}${scn === 'digital' ? `, datacentre ${dcKwhDay.toFixed(0)}` : ''}${watKwhDay > 0 ? `, water treatment ${watKwhDay.toFixed(0)}` : ''} kWh/day.`);
      if (totKwp > 0) {
        lines.push(`Solar ≈ ${totKwp.toFixed(0)} kWp${roofM2 > 0 ? ` across ${roofM2.toFixed(0)} m² usable roof` : ''}${gmKw > 0 ? ' + ground-mount' : ''} — generates ~${sumGen.toFixed(0)} kWh/day summer, ~${winGen.toFixed(0)} winter (worst month ${SM ? SM.MNAME[worstMonth] : 'Jun'} ~${worstGen.toFixed(0)}).`);
        verdicts.push(verdict(winGen >= loadKwh ? 'ok' : kva > 0 ? 'warn' : 'fail',
          `Coverage: solar meets ${Math.min(100, winGen / loadKwh * 100).toFixed(0)}% of daily load in winter, ${Math.min(100, sumGen / loadKwh * 100).toFixed(0)}% in summer${winGen < loadKwh ? (kva > 0 ? ' — the grid (or a bigger array / smaller load) covers the rest' : ' — off-grid: no grid to cover the gap; more panels or more storage') : ''}.`));
      } else verdicts.push(verdict('warn', `No solar configured — the full ${loadKwh.toFixed(0)} kWh/day stays on the grid.`));
      if (battKwh > 0) {
        const eveningNeed = loadKwh * 0.35;
        verdicts.push(verdict(battKwh >= eveningNeed ? 'ok' : 'warn', `Battery ${battKwh} kWh usable vs ~${eveningNeed.toFixed(0)} kWh estimated evening load (35% of daily)${battKwh >= eveningNeed ? ' — covers a typical evening' : ' — evening demand outlasts it; night load still imports'}.`));
      }
      const evDemand = evQty * evKw;
      const evPrice = num('evPrice'), evRevYr = evKwhDay * 365 * evPrice;
      if (evQty > 0 && kva > 0) {
        verdicts.push(verdict(evDemand > kva ? 'fail' : evDemand > kva * 0.6 ? 'warn' : 'ok',
          `EV charging: ${evQty} × ${evKw} kW = ${evDemand} kW if all run at once against a ${kva} kVA supply${evDemand > kva ? ' — exceeds the connection; needs load management or a supply upgrade' : evDemand > kva * 0.6 ? ' — over half the connection; load management recommended' : ''}.`));
      }
      if (evQty > 0 && evKwhDay > 0 && evPrice > 0) {
        const margin = evKwhDay * 365 * (evPrice - tariff);
        lines.push(`EV revenue: ~${evKwhDay.toFixed(0)} kWh/day sold at $${evPrice.toFixed(2)}/kWh ≈ ${money.format(evRevYr)}/yr gross — margin over the site's ~$${tariff.toFixed(2)}/kWh energy cost ≈ ${money.format(margin)}/yr${margin < 0 ? ' (selling below cost)' : ''}. Not counted in the solar saving figures.`);
      }
      if (kWp > 0 && roofM2 > 0 && winGen < loadKwh && gmKw <= 0) lines.push(`Winter shortfall could come from a ground-mount or carport array — showgrounds usually have paddock or parking area to spare; add kWp above.`);
      if (bayKwh > 5 && totKwp > 0) lines.push(`Quiet periods: if the bays empty out, ~${bayKwh.toFixed(0)} kWh/day of bay load becomes surplus instead — exported, stored or sold to EVs. The panels don't care who's plugged in; weather is the real limiter — worst-month output ~${worstGen.toFixed(0)} kWh/day vs ~${sumGen.toFixed(0)} in summer.`);
      const curtailKwh = num('curtailKwh'), curtailBuy = num('curtailBuy'), peakSell = num('peakSell'), rtEff = num('rtEff') / 100;
      if (curtailKwh > 0) {
        const spareBatt = Math.max(0, battKwh - needBatt);
        const absorb = Math.min(curtailKwh, spareBatt / rtEff);
        if (kva <= 0) {
          verdicts.push(verdict('warn', `Battery trading: ${curtailKwh.toFixed(0)} kWh/day of curtailed renewables is available nearby, but the site has no grid connection (0 kVA) — there's no market to buy it from or sell it into.`));
        } else if (absorb > 0) {
          const revYr = absorb * (peakSell * rtEff - curtailBuy) * 365;
          tradeRevYr = revYr;
          lines.push(`Battery trading: absorb ~${absorb.toFixed(0)} kWh/day of curtailed wind/solar at $${curtailBuy.toFixed(2)}/kWh, discharge ~${(absorb * rtEff).toFixed(0)} kWh/day at $${peakSell.toFixed(2)} peak (${(rtEff * 100).toFixed(0)}% round-trip) ≈ ${money.format(revYr)}/yr margin — using ~${spareBatt.toFixed(0)} kWh of spare capacity beyond the always-on reserve${absorb < curtailKwh ? `; oversize the battery to soak the full ${curtailKwh.toFixed(0)} kWh/day` : ''}. Not counted in the solar saving figures.`);
        } else if (battKwh > 0) {
          lines.push(`Battery trading: ${curtailKwh.toFixed(0)} kWh/day of curtailed renewables is available nearby, but the battery is fully committed to the always-on reserve — add storage beyond ${Math.ceil(needBatt)} kWh to trade on it.`);
        }
      }

      // ---- Scenario-specific checks ----
      if (scn === 'resilience' && totKwp > 0) {
        const surplus = annLoad > 0 ? annGen / annLoad : 0;
        verdicts.push(verdict(surplus >= 1.2 ? 'ok' : surplus >= 1 ? 'warn' : 'fail',
          `Surplus duty: annual generation ≈ ${(annGen / 1000).toFixed(0)} MWh vs ${(annLoad / 1000).toFixed(0)} MWh used — ${(surplus * 100).toFixed(0)}%${surplus >= 1.2 ? ' — a real surplus for disaster duty and grid support' : surplus >= 1 ? ' — barely net-positive; a resilience hub should oversize the array' : ' — undersized for resilience duty: it cannot cover its own load across a year'}.`));
        if (critShare > 0 && battKwh > 0) verdicts.push(verdict(autDays >= autoTarget ? 'ok' : 'fail',
          `Islanded autonomy: ${battKwh} kWh covers the critical ${critShare}% of load (~${critLoad.toFixed(0)} kWh/day) for ≈ ${autDays.toFixed(1)} days — target ${autoTarget}${autDays >= autoTarget ? '' : ' — more storage, or a shorter critical-load list'}.`));
        lines.push(`Diesel-genset alternative ≈ ${money.format(dieselYr)}/yr in fuel + servicing at ~$${dieselRate.toFixed(2)}/kWh — the ${money.format(upfront)} build pays back in ~${dieselYr > 0 ? (upfront / dieselYr).toFixed(1) : '—'} yrs against diesel alone.`);
        if (evQty > 0 && kva <= 0) lines.push(`EV charging runs off the array — schedule sessions for solar hours.`);
        if (kva > 0 && exportYr > 0) lines.push(`Grid-connected: ≈ ${(exportYr * 2 / 1000).toFixed(0)} MWh/yr of surplus available for export or grid stabilisation (half counted as usable).`);
      }
      if (scn === 'microgrid') {
        const part = num('participants') || 1;
        if (critShare > 0 && battKwh > 0) verdicts.push(verdict(autDays >= autoTarget ? 'ok' : 'warn',
          `Islanding: ${battKwh} kWh covers the critical ${critShare}% (~${critLoad.toFixed(0)} kWh/day) for ≈ ${autDays.toFixed(1)} days during an outage — target ${autoTarget}.`));
        lines.push(`Microgrid controls & metering add ${money.format(mgCost)} to the build — the annual saving splits to ≈ ${money.format(savings / part)}/yr per participant across ${part} buildings.`);
      }
      if (scn === 'digital') {
        const members = num('members') || 1;
        lines.push(`Datacentre ≈ ${dcKwhDay.toFixed(0)} kWh/day — ${dcTb.toLocaleString('en-AU')} TB for ~${pop.toLocaleString('en-AU')} citizens + ${bizQty} businesses (${dcItKw.toFixed(1)} kW IT${cwAlwaysKwh > 0 ? ` + ${cwAlwaysKwh.toFixed(0)} kWh/day always-on compute` : ''} + ${pue}% cooling) — ${(dcKwhDay / loadKwh * 100).toFixed(0)}% of the coop's load, and it never sleeps: solar alone can't carry it overnight, so battery and grid/backup sizing set the uptime.`);
        const avgSurplus = Math.max(0, annGen / 365 - loadKwh);
        if (cwSurplusKwh > 0) {
          const pct = avgSurplus > 0 ? Math.min(100, avgSurplus / cwSurplusKwh * 100) : 0;
          verdicts.push(verdict(pct >= 80 ? 'ok' : pct >= 30 ? 'warn' : 'fail',
            `Deferrable compute: ~${cwSurplusKwh.toFixed(0)} kWh/day of batch jobs queued vs ~${avgSurplus.toFixed(0)} kWh/day average surplus — they run ≈ ${pct.toFixed(0)}% of the time${pct < 80 ? ' (oversize the array or trim the queue to run them more)' : ''}.`));
        }
        const extShare = num('extShare') / 100;
        if (extShare > 0) {
          const extTb = dcTb * extShare;
          const extCwKwh = Math.min(cwSurplusKwh, avgSurplus) * extShare;
          const hostRev = extTb * num('tbPrice') * 12;
          const cwRev = extCwKwh * num('cwPrice') * 365;
          const extRev = hostRev + cwRev;
          if (extRev > 0) {
            lines.push(`External sales — ${extShare * 100 | 0}% of spare capacity outside the town: ~${extTb.toLocaleString('en-AU', { maximumFractionDigits: 0 })} TB hosting at $${num('tbPrice')}/TB/mo${extCwKwh > 0 ? ` + ~${extCwKwh.toFixed(0)} kWh/day compute at $${num('cwPrice').toFixed(2)}/kWh-equiv` : ''} ≈ $${Math.round(extRev).toLocaleString('en-AU')}/yr — premium revenue on capacity the town isn't using; the coop keeps the margin, not a distant cloud.`);
            extRevTotal = extRev;
          }
        }
        if (critShare > 0 && battKwh > 0) verdicts.push(verdict(autDays >= autoTarget ? 'ok' : 'fail',
          `Uptime duty: ${battKwh} kWh covers the critical ${critShare}% of load (~${critLoad.toFixed(0)} kWh/day — the datacentre plus essentials) for ≈ ${autDays.toFixed(1)} days islanded — target ${autoTarget}${autDays >= autoTarget ? '' : ' — more storage, or shed non-critical load first'}.`));
        lines.push(`Coop economics: ${members} members — the ${money.format(upfront)} build is ≈ ${money.format(upfront / members)} per member, and the annual saving ≈ ${money.format(savings / members)}/yr each — before any service revenue the coop charges.`);
      }
    }

    // ---- Demographics — supported-accommodation duty ----
    if (bays > 0 && (standingNeed > 0 || seasonal > 0)) {
      lines.push(`Supported accommodation: ≈ ${standingNeed} people need a place now (domestic violence ${dvNeed} + homelessness ${homeless})${seasonal > 0 ? `, plus a seasonal-workforce peak of ~${seasonal}` : ''} — ${bays} bays at ${Math.round(occ * 100)}% occupancy leave ≈ ${freeBays} free on an average day.`);
      verdicts.push(verdict(freeBays >= standingNeed ? 'ok' : freeBays >= standingNeed * 0.5 ? 'warn' : 'fail',
        `Supported-accommodation duty: ${freeBays} free bays vs ≈ ${standingNeed} people in standing need${freeBays >= standingNeed ? '' : ' — add dedicated units or lift the bay count'}.`));
    }

    // ---- Export income — three bands ----
    // Baseline: all surplus exported at the feed-in rate (already inside savings).
    // Moderate: + configured streams — EV margin over site energy cost, battery
    // trading margin, external hosting/compute sales. Optimistic: busier
    // utilisation — EV sessions and external share ×1.5 (within caps).
    const evMarginYr = evQty > 0 ? evKwhDay * 365 * Math.max(0, num('evPrice') - tariff) : 0;
    const extShareN = num('extShare') / 100;
    const extRevOpt = extRevTotal * (extShareN > 0 ? Math.min(0.9 / extShareN, 1.5) : 1);
    const incBase = exportYr * fit;
    const incMod = incBase + evMarginYr + tradeRevYr + extRevTotal;
    const incOpt = incBase + evMarginYr * 1.5 + tradeRevYr + extRevOpt;
    const svcMod = evMarginYr + tradeRevYr + extRevTotal; // income beyond bill savings

    // ---- Load breakdown + monthly chart ----
    const lbSegs = [['Existing baseline', baseKwh, 0], ['Amenities & buildings', amenKwh, 1], ['Occupied bays', bayKwh, 2], ['EV charging', evKwhDay, 3], ['Datacentre 24/7', dcKwhDay, 4], ['Water treatment', watKwhDay, 5]].filter(s => s[1] > 0.5);
    const loadBar = loadKwh > 0 && lbSegs.length ? `<div class="loadbar-wrap"><h4>Where the daily load goes</h4><div class="loadbar">${lbSegs.map(([n, v, c]) => `<span class="lb-${c}" style="width:${(v / loadKwh * 100).toFixed(1)}%" title="${n}: ~${v.toFixed(0)} kWh/day"></span>`).join('')}</div><div class="loadbar-legend">${lbSegs.map(([n, v, c]) => `<span><i class="lb-${c}"></i>${n} ~${v.toFixed(0)} kWh (${(v / loadKwh * 100).toFixed(0)}%)</span>`).join('')}</div></div>` : '';
    const maxV = Math.max(...gen, loadKwh, 1);
    const genChart = totKwp > 0 && loadKwh > 0 ? `<div class="genchart-wrap"><h4>Solar vs demand by month — kWh/day</h4><div class="genchart">${gen.map((g, i) => `<div class="gbar ${g >= loadKwh ? 'ok' : 'short'}" style="height:${Math.round(g / maxV * 64) + 12}px" title="${SM ? SM.MNAME[i] : i}: ~${g.toFixed(0)} kWh/day vs ${loadKwh.toFixed(0)} used"><i>${g.toFixed(0)}</i><b>${SM ? SM.MLETTER[i] : ''}</b></div>`).join('')}</div><p class="small">Demand ≈ ${loadKwh.toFixed(0)} kWh/day — green months cover it on solar alone.</p></div>` : '';

    result.innerHTML = `
      ${lines.length ? `<div class="power-lines">${lines.map(l => `<div class="pline">${l}</div>`).join('')}</div>` : ''}
      <div class="verdicts">${verdicts.join('')}</div>
      ${loadBar}
      ${genChart}
      <div class="res-groups">
        <div class="res-group"><h4>The site</h4><div class="budget-result">
          <div><span>Daily electricity demand</span><strong>${loadKwh.toFixed(0)} kWh</strong></div>
          <div><span>Powered bays — occupied / total</span><strong>${Math.round(bays * occ)} / ${bays}</strong></div>
          <div><span>Current grid cost (baseline)</span><strong>${money.format(beforeYr)}/yr</strong></div>
        </div></div>
        <div class="res-group"><h4>Solar &amp; storage build</h4><div class="budget-result">
          <div><span>Array size — roof + ground</span><strong>${totKwp.toFixed(0)} kWp</strong></div>
          <div><span>Battery — usable storage</span><strong>${battKwh} kWh</strong></div>
          <div><span>Build cost (upfront)</span><strong>${money.format(upfront)}</strong></div>
        </div></div>
        <div class="res-group"><h4>${scn === 'resilience' ? 'Resilience duty' : scn === 'digital' ? 'Cooperative economics' : 'The bottom line'}</h4><div class="budget-result">
          ${scn === 'digital' ? `
          <div><span>Datacentre — 24/7 IT + cooling load</span><strong>${dcKwhDay.toFixed(0)} kWh/day</strong></div>
          <div><span>Grid cost — this demand, no solar</span><strong>${money.format(noSolarYr)}/yr</strong></div>
          <div${savings < 0 ? ' class="neg"' : ''}><span>Annual saving — ≈ per member</span><strong>${money.format(savings)} / ${money.format(savings / (num('members') || 1))}</strong></div>
          <div><span>Islanded autonomy at critical load</span><strong>${autDays.toFixed(1)} days</strong></div>
          <div><span>External sales — spare hosting + compute</span><strong>${money.format(extRevTotal)}/yr</strong></div>
          <div><span>Payback — savings alone / incl. income</span><strong>${savings > 0 ? (upfront / savings).toFixed(1) + ' yrs' : '—'} / ${savings + svcMod > 0 ? (upfront / (savings + svcMod)).toFixed(1) + ' yrs' : '—'}</strong></div>` : scn === 'resilience' ? `
          <div><span>Diesel-genset alternative — fuel + service</span><strong>${money.format(dieselYr)}/yr</strong></div>
          <div><span>Islanded autonomy at critical load</span><strong>${autDays.toFixed(1)} days</strong></div>
          <div${annGen < annLoad ? ' class="neg"' : ''}><span>Annual surplus (generation − load)</span><strong>${((annGen - annLoad) / 1000).toFixed(0)} MWh</strong></div>
          <div><span>Payback vs diesel-only</span><strong>${dieselYr > 0 ? (upfront / dieselYr).toFixed(1) + ' yrs' : '—'}</strong></div>` : scn === 'microgrid' ? `
          <div><span>Grid cost — community, no microgrid</span><strong>${money.format(noSolarYr)}/yr</strong></div>
          <div><span>Grid cost — with shared solar &amp; storage</span><strong>${money.format(Math.max(0, afterYr))}/yr</strong></div>
          <div${savings < 0 ? ' class="neg"' : ''}><span>Annual saving — ≈ per participant</span><strong>${money.format(savings)} / ${money.format(savings / (num('participants') || 1))}</strong></div>
          <div><span>Payback — savings / incl. income</span><strong>${savings > 0 ? (upfront / savings).toFixed(1) + ' yrs' : '—'} / ${savings + svcMod > 0 ? (upfront / (savings + svcMod)).toFixed(1) + ' yrs' : '—'}</strong></div>` : `
          <div><span>Grid cost — this demand, no solar</span><strong>${money.format(noSolarYr)}/yr</strong></div>
          <div><span>Grid cost — with solar &amp; storage</span><strong>${money.format(Math.max(0, afterYr))}/yr</strong></div>
          <div${savings < 0 ? ' class="neg"' : ''}><span>Annual saving${savings < 0 ? ' (negative)' : ''}</span><strong>${money.format(Math.abs(savings))}</strong></div>
          <div><span>Payback — savings / incl. income</span><strong>${savings > 0 ? (upfront / savings).toFixed(1) + ' yrs' : '—'} / ${savings + svcMod > 0 ? (upfront / (savings + svcMod)).toFixed(1) + ' yrs' : '—'}</strong></div>`}
        </div></div>
        <div class="res-group"><h4>Export income — three bands</h4><div class="budget-result">
          <div><span>Baseline — surplus at feed-in only</span><strong>${money.format(incBase)}/yr</strong></div>
          <div><span>Moderate — sales &amp; services as configured</span><strong>${money.format(incMod)}/yr</strong></div>
          <div><span>Optimistic — busier utilisation (~×1.5)</span><strong>${money.format(incOpt)}/yr</strong></div>
        </div><p class="small">Baseline is the floor — surplus dumped at the feed-in rate (it's already inside the savings figure). Moderate adds the configured streams: EV charging at margin over site energy cost, battery trading, external hosting/compute. Optimistic assumes ~1.5× sessions and external sales — battery capacity and spare demand are the hard caps.</p></div>
      </div>
      ${hasLab ? `<div class="model-addrow"><button type="button" data-send-models class="mbtn">Send site inputs to the models ↓</button><button type="button" data-site-report class="mbtn primary">Add this site build to the report</button><p class="small">Feeds this build into the other tabs — solar gets array/storage/demand, water gets the potable plant, financial gets the population — or file the whole result into the exportable report.</p></div>` : ''}`;
    planner.querySelector('[data-billkwh]') && (planner.querySelector('[data-billkwh]').textContent = `≈ ${baseKwh.toFixed(0)} kWh/day`);
    planner.querySelector('[data-dieselrate]') && (planner.querySelector('[data-dieselrate]').textContent = `≈ $${dieselRate.toFixed(2)}/kWh fuel + service`);
    const evRev = planner.querySelector('[data-evrev]');
    if (evRev) evRev.textContent = evQty > 0 && evKwhDay > 0 ? `≈ ${money.format(evKwhDay * 365 * num('evPrice'))}/yr gross` : '';
    const watPp = planner.querySelector('[data-watpp]');
    if (watPp) watPp.textContent = watKl > 0 ? `≈ ${bays * occ > 0 ? Math.round(watKl * 1000 / (bays * occ)) + ' L/day per occupied bay' : (watKl * 1000).toLocaleString('en-AU') + ' L/day'}` : '';
    const dcsum = planner.querySelector('[data-dcsum]');
    if (dcsum) dcsum.textContent = scn === 'digital' && dcTb > 0 ? `≈ ${dcTb.toLocaleString('en-AU')} TB · ~${Math.max(1, Math.ceil(dcTb / 120))} racks · ${dcItKw.toFixed(1)} kW IT${cwAlwaysKwh > 0 ? ` + ${(cwAlwaysKwh / 24).toFixed(1)} kW always-on compute` : ''}` : '';
    const ao = planner.querySelector('[data-alwayson]');
    if (ao) ao.textContent = needKwp > 0 ? `Always-on at this site ≈ ${needKwp.toFixed(0)} kWp solar (sized to the worst month, ~${worstPsh.toFixed(1)} PSH) + ≈ ${Math.ceil(needBatt)} kWh usable storage — this build: ${totKwp.toFixed(0)} kWp / ${battKwh} kWh.` : '';

    const geoName = planner.querySelector('[data-geosearch]')?.value?.trim();
    lastCalc = {
      scn, scnLabel: SCN[scn]?.label || scn,
      locText: geoName || `${Math.abs(lat).toFixed(2)}°${lat < 0 ? 'S' : 'N'}, ${Math.abs(lon).toFixed(2)}°${lon < 0 ? 'W' : 'E'}`,
      lat, lon, tariff, fit, supplyKva: num('supplyKva'),
      loadKwh, baseKwh, amenKwh, bayKwh, evKwhDay, dcKwhDay, watKwhDay,
      totKwp, battKwh, needKwp, needBatt, worstPsh,
      pshSum: num('pshSum'), pshWin: num('pshWin'), sysEff: num('sysEff'),
      upfront, savings, noSolarYr, afterYr, beforeYr, annGen, annLoad, exportYr,
      incBase, incMod, incOpt, svcMod, evMarginYr, tradeRevYr, extRevTotal,
      critShare, critLoad, autDays, autoTarget, dieselYr,
      evQty, evSessions: num('evSessions'), evPrice: num('evPrice'),
      regPop, dvNeed, rentStress, seasonal, homeless, standingNeed, freeBays,
      watKl, watKwh: num('watKwh'),
    };
  };

  const applyScenario = key => {
    const c = SCN[key];
    if (!c) return;
    Object.entries(c.fields).forEach(([n, v]) => {
      const f = field(n);
      if (!f) return;
      f.value = v;
      const sl = planner.querySelector(`[data-pair="${n}"]`);
      if (sl) sl.value = v;
    });
    const lg = planner.querySelector('[data-load-grid]');
    if (lg) { lg.innerHTML = ''; c.loads.forEach(r => lg.appendChild(loadRow(r))); }
    const rg = planner.querySelector('[data-roof-grid]');
    if (rg) { rg.innerHTML = ''; c.roofs.forEach(r => rg.appendChild(roofRow(r))); }
    const cg = planner.querySelector('[data-cw-grid]');
    if (cg) { cg.innerHTML = ''; (c.cwloads || []).forEach(r => cg.appendChild(cwRow(r))); }
    planner.querySelectorAll('[data-vis]').forEach(el => {
      el.style.display = el.dataset.vis.split(' ').includes(key) ? '' : 'none';
    });
    const d = planner.querySelector('[data-scn-desc]');
    if (d) d.textContent = c.desc;
    recalc();
  };

  planner.addEventListener('input', e => {
    const t = e.target;
    if (t?.dataset?.pair) {
      const f = field(t.dataset.pair);
      if (f) f.value = t.value;
    } else if (t?.dataset?.f) {
      const sl = planner.querySelector(`[data-pair="${t.dataset.f}"]`);
      if (sl) sl.value = t.value;
    }
    recalc();
  });
  planner.addEventListener('change', e => {
    if (e.target?.hasAttribute?.('data-scn')) applyScenario(e.target.value);
    else recalc();
  });

  // Row add/remove + lab handoff
  planner.addEventListener('click', e => {
    if (e.target.closest('.item-del')) { e.target.closest('.item-row')?.remove(); recalc(); }
    if (e.target.closest('[data-send-models]')) sendToModels();
    if (e.target.closest('[data-site-report]')) addSiteToReport();
  });

  // Sends the planner's outputs into the other workbench tabs. Solar: array,
  // PSH, derate, battery and the demand split — 24/7 loads (datacentre) spread
  // evenly, everything else biased to daylight/evening. Water: potable demand →
  // RO plant. Financial: regional population → the model's scope driver.
  const sendToModels = () => {
    const c = lastCalc;
    if (!c) return;
    const flat = c.dcKwhDay, flex = Math.max(0, c.loadKwh - flat);
    const set = (id, v) => {
      const el = document.getElementById(id);
      if (el) { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }
    };
    set('s-array', Math.round(c.totKwp));
    set('s-psh-summer', c.pshSum); set('s-psh-winter', c.pshWin);
    set('s-derate', c.sysEff);
    set('s-batt', Math.round(c.battKwh));
    set('s-day', Math.round(flat / 3 + flex * 0.5));
    set('s-eve', Math.round(flat / 3 + flex * 0.3));
    set('s-night', Math.round(flat / 3 + flex * 0.2));
    if (c.watKl > 0) {
      const roOn = document.getElementById('w-ro-on');
      if (roOn && !roOn.checked) { roOn.checked = true; roOn.dispatchEvent(new Event('change', { bubbles: true })); }
      set('w-ro-flow', c.watKl);
      const src = document.getElementById('w-ro-source');
      if (src) { // nearest SEC option to the planner's treatment energy
        const best = [...src.options].reduce((a, o) => Math.abs(+o.value - c.watKwh) < Math.abs(+a.value - c.watKwh) ? o : a);
        src.value = best.value; src.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    if (c.regPop > 0) {
      const popEl = document.getElementById('scope-56'); // Regional population driver
      if (popEl) { popEl.value = c.regPop; popEl.dispatchEvent(new Event('change', { bubbles: true })); }
    }
    const sl = document.getElementById('scope-label');
    if (sl && !sl.value) { sl.value = `Site planner — ${c.scnLabel} @ ${c.locText}`; sl.dispatchEvent(new Event('change', { bubbles: true })); }
    document.querySelector('[data-mtab="solar"]')?.click();
  };

  // Files the whole site build into the lab's report store. model-app.js listens
  // for this event, hashes the entry and re-renders the report tab.
  const addSiteToReport = () => {
    const c = lastCalc;
    if (!c) return;
    const inputs = {
      'Scenario': c.scnLabel,
      'Location': c.locText,
      'Daily demand (kWh/day)': Math.round(c.loadKwh),
      'Solar array (kWp)': Math.round(c.totKwp),
      'Battery usable (kWh)': Math.round(c.battKwh),
      'Always-on target': `≈ ${Math.round(c.needKwp)} kWp + ${Math.ceil(c.needBatt)} kWh`,
      'Tariff / feed-in ($/kWh)': `${c.tariff} / ${c.fit}`,
    };
    if (c.evKwhDay > 0) inputs['EV charging (kWh/day)'] = Math.round(c.evKwhDay);
    if (c.dcKwhDay > 0) inputs['Datacentre 24/7 (kWh/day)'] = Math.round(c.dcKwhDay);
    if (c.watKwhDay > 0) inputs['Water treatment (kWh/day)'] = Math.round(c.watKwhDay);
    if (c.regPop > 0) inputs['Regional population'] = c.regPop.toLocaleString('en-AU');
    if (c.standingNeed > 0 || c.seasonal > 0) inputs['Supported accommodation need'] = `≈ ${c.standingNeed} standing (DV ${c.dvNeed} + homeless ${c.homeless})${c.seasonal > 0 ? ` + ${c.seasonal} seasonal peak` : ''}`;
    if (c.rentStress > 0) inputs['Households in rental stress'] = c.rentStress.toLocaleString('en-AU');
    const results = {
      'Build cost (upfront)': money.format(c.upfront),
      'Annual saving vs grid-only': money.format(c.savings),
      'Income — baseline / moderate / optimistic': `${money.format(c.incBase)} / ${money.format(c.incMod)} / ${money.format(c.incOpt)} per yr`,
      'Payback — savings / incl. income': `${c.savings > 0 ? (c.upfront / c.savings).toFixed(1) : '—'} / ${c.savings + c.svcMod > 0 ? (c.upfront / (c.savings + c.svcMod)).toFixed(1) : '—'} yrs`,
    };
    if (c.autoTarget > 0) results['Islanded autonomy'] = `${c.autDays.toFixed(1)} days at ${c.critShare}% critical load (target ${c.autoTarget})`;
    if (c.scn === 'resilience' && c.dieselYr > 0) results['Diesel-genset alternative'] = `${money.format(c.dieselYr)}/yr`;
    window.dispatchEvent(new CustomEvent('civics-site-report', {
      detail: { type: 'Community site planner', name: `Site build — ${c.scnLabel} @ ${c.locText}`, ts: new Date().toISOString(), inputs, results },
    }));
  };
  const addLoad = planner.querySelector('[data-add-load]');
  addLoad?.addEventListener('click', () => {
    planner.querySelector('[data-load-grid]').appendChild(loadRow([1, 'Load (e.g. bore pump)', 1, 2, 1, 0]));
    recalc();
  });
  const addRoof = planner.querySelector('[data-add-roof]');
  addRoof?.addEventListener('click', () => {
    planner.querySelector('[data-roof-grid]').appendChild(roofRow([1, 'Roof segment (e.g. hall roof)', 100, 70, 'n', 10]));
    recalc();
  });
  planner.querySelector('[data-add-cw]')?.addEventListener('click', () => {
    planner.querySelector('[data-cw-grid]').appendChild(cwRow([1, 'Workload (e.g. irrigation AI)', 2, 6, 'surplus', 0]));
    recalc();
  });
  planner.querySelector('[data-size-alwayson]')?.addEventListener('click', () => {
    if (!lastAO) return;
    const gm = field('gmKw'), bt = field('battKwh');
    if (gm) gm.value = Math.max(0, Math.ceil(lastAO.needKwp - lastAO.roofKwp));
    if (bt) {
      bt.value = Math.ceil(lastAO.needBatt / 5) * 5;
      const sl = planner.querySelector('[data-pair="battKwh"]');
      if (sl) sl.value = bt.value;
    }
    recalc();
  });

  // Map + solar grid
  const mapEl = planner.querySelector('[data-site-map]');
  let marker = null, mapObj = null;
  const setLoc = (la, ln) => {
    lat = la; lon = ln;
    const f = planner.querySelector('[data-loc]');
    if (f) f.textContent = `${Math.abs(la).toFixed(2)}°${la < 0 ? 'S' : 'N'}, ${ln.toFixed(2)}°${ln < 0 ? 'W' : 'E'}`;
    if (grid) {
      const months = SM.sample(grid, la, ln);
      if (months) {
        pshMonths = SM.toPsh(months);
        const s = (pshMonths[11] + pshMonths[0] + pshMonths[1]) / 3, wn = (pshMonths[5] + pshMonths[6] + pshMonths[7]) / 3;
        if (field('pshSum')) field('pshSum').value = s.toFixed(1);
        if (field('pshWin')) field('pshWin').value = wn.toFixed(1);
        const bars = planner.querySelector('[data-month-bars]');
        if (bars) SM.renderBars(bars, pshMonths);
      }
    }
    recalc();
  };
  const bootMap = () => {
    if (!mapEl || typeof L === 'undefined' || !SM) return;
    mapObj = SM.createMap(mapEl, { imagery: true, scrollZoom: true });
    if (!mapObj) return;
    marker = L.marker([lat, lon], { icon: SM.pinIcon(1) }).addTo(mapObj);
    mapObj.on('click', e => { marker.setLatLng(e.latlng); setLoc(e.latlng.lat, e.latlng.lng); });
    if (grid) setLoc(lat, lon);
  };

  // ---- Geosearch (OSM Nominatim) + building scan (Overpass + Turf) ----
  const geoBox = planner.querySelector('[data-geosearch]');
  const geoRes = planner.querySelector('[data-georesults]');
  let geoTimer = null;
  if (geoBox && geoRes) {
    geoBox.addEventListener('input', () => {
      clearTimeout(geoTimer);
      const q = geoBox.value.trim();
      if (q.length < 3) { geoRes.hidden = true; return; }
      geoTimer = setTimeout(async () => {
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=au&limit=6&q=${encodeURIComponent(q)}`);
          const hits = await r.json();
          if (!hits.length) { geoRes.hidden = true; return; }
          geoRes.innerHTML = hits.map((h, i) => `<button type="button" data-gi="${i}">${h.display_name.length > 90 ? h.display_name.slice(0, 90) + '…' : h.display_name}</button>`).join('');
          geoRes._hits = hits;
          geoRes.hidden = false;
        } catch { geoRes.hidden = true; }
      }, 450);
    });
    geoRes.addEventListener('click', e => {
      const b = e.target.closest('[data-gi]');
      if (!b || !geoRes._hits) return;
      const h = geoRes._hits[Number(b.dataset.gi)];
      const la = Number(h.lat), ln = Number(h.lon);
      geoRes.hidden = true;
      geoBox.value = h.display_name.split(',')[0];
      if (marker) marker.setLatLng([la, ln]);
      if (mapObj) mapObj.setView([la, ln], 16);
      setLoc(la, ln);
    });
    document.addEventListener('click', e => { if (!geoRes.hidden && !geoRes.contains(e.target) && e.target !== geoBox) geoRes.hidden = true; });
  }

  let turfP = null;
  const loadTurf = () => turfP || (turfP = new Promise((res, rej) => {
    if (window.turf) return res(window.turf);
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/@turf/turf@7/turf.min.js';
    s.onload = () => res(window.turf);
    s.onerror = () => { turfP = null; rej(new Error('turf load failed')); };
    document.head.appendChild(s);
  }));

  const degToOrient = deg => { // compass degrees → our 8-point + flat codes (southern hemisphere: 0° = north)
    const d = ((deg % 360) + 360) % 360;
    const codes = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
    return codes[Math.round(d / 45) % 8];
  };

  const scanBtn = planner.querySelector('[data-scan-bldgs]');
  const bldgList = planner.querySelector('[data-bldg-list]');
  let bldgLayer = null;
  if (scanBtn && bldgList) scanBtn.addEventListener('click', async () => {
    scanBtn.disabled = true;
    scanBtn.textContent = 'Scanning…';
    bldgList.innerHTML = '';
    try {
      const q = `[out:json][timeout:25];way["building"](around:180,${lat},${lon});out geom;`;
      const r = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(q) });
      const osm = await r.json();
      const ways = (osm.elements || []).filter(e => e.type === 'way' && e.geometry?.length > 2);
      if (!ways.length) { bldgList.innerHTML = '<p class="small">No buildings mapped within ~180 m of the pin — move it or zoom the search closer.</p>'; return; }
      const t = await loadTurf();
      if (bldgLayer) { mapObj && mapObj.removeLayer(bldgLayer); bldgLayer = null; }
      if (mapObj && typeof L !== 'undefined') bldgLayer = L.layerGroup().addTo(mapObj);
      const rows = ways.map(wy => {
        const pts = wy.geometry.map(g => [g.lon, g.lat]);
        if (pts[0][0] !== pts[pts.length - 1][0] || pts[0][1] !== pts[pts.length - 1][1]) pts.push(pts[0]);
        const area = t.area(t.polygon([pts]));
        if (area < 40) return null; // skip sheds and outbuildings
        let longest = 0, bearing = 0;
        for (let i = 0; i < pts.length - 1; i++) {
          const seg = t.distance(t.point(pts[i]), t.point(pts[i + 1]), { units: 'meters' });
          if (seg > longest) { longest = seg; bearing = t.bearing(t.point(pts[i]), t.point(pts[i + 1])); }
        }
        const face = degToOrient(bearing + 90); // roof face is roughly perpendicular to the ridge/longest edge
        const name = wy.tags?.name || wy.tags?.['addr:housenumber'] || wy.tags?.building || 'Building';
        const latlngs = wy.geometry.map(g => [g.lat, g.lon]);
        if (bldgLayer) L.polygon(latlngs, { color: '#0e7490', weight: 2, fillOpacity: 0.12 }).addTo(bldgLayer).bindPopup(`${name} — ~${Math.round(area)} m²`);
        return { name, area: Math.round(area), face };
      }).filter(Boolean).sort((a, b) => b.area - a.area).slice(0, 12);
      if (!rows.length) { bldgList.innerHTML = '<p class="small">Only small outbuildings found nearby (&lt;40 m²).</p>'; return; }
      bldgList.innerHTML = `<p class="small">Found ${rows.length} building${rows.length > 1 ? 's' : ''} (outlined on the map). 2D footprints only — estimate usable %, facing and pitch before adding:</p>` + rows.map((b, i) =>
        `<div class="bldg-row"><span>${b.name}</span><span>~${b.area} m² · ~faces ${b.face.toUpperCase()}</span><button type="button" data-addb="${i}">+ roof</button></div>`).join('');
      bldgList._rows = rows;
    } catch {
      bldgList.innerHTML = '<p class="small">Scan failed — needs a connection to OpenStreetMap\'s Overpass service.</p>';
    } finally {
      scanBtn.disabled = false;
      scanBtn.textContent = 'Scan nearby buildings (OpenStreetMap)';
    }
  });
  bldgList?.addEventListener('click', e => {
    const b = e.target.closest('[data-addb]');
    if (!b || !bldgList._rows) return;
    const bd = bldgList._rows[Number(b.dataset.addb)];
    planner.querySelector('[data-roof-grid]').appendChild(roofRow([1, bd.name, bd.area, 65, bd.face, 10]));
    b.disabled = true;
    b.textContent = 'added';
    recalc();
  });

  if (SM) {
    SM.loadGrid().then(g => { grid = g; if (g) setLoc(lat, lon); });
    if (typeof L !== 'undefined') bootMap(); else window.addEventListener('load', bootMap);
  }
  applyScenario(planner.querySelector('[data-scn]:checked')?.value || 'retrofit');
})();
