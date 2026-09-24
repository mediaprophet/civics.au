// Nav group dropdowns
const closeDrops = () => document.querySelectorAll('.nav-drop.open').forEach(d => {
  d.classList.remove('open');
  d.querySelector('.nav-drop-btn')?.setAttribute('aria-expanded', 'false');
});
document.querySelectorAll('.nav-drop-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const drop = btn.closest('.nav-drop');
    const willOpen = !drop.classList.contains('open');
    closeDrops();
    drop.classList.toggle('open', willOpen);
    btn.setAttribute('aria-expanded', String(willOpen));
  });
});
document.addEventListener('click', e => { if (!e.target.closest('.nav-drop')) closeDrops(); });
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const openDrop = document.querySelector('.nav-drop.open');
  closeDrops();
  openDrop?.querySelector('.nav-drop-btn')?.focus();
});

// "On this page" sidebar is a <details> — start it collapsed on narrow screens
// where it stacks above the article; open by default on desktop.
const toc = document.querySelector('details.toc:not(.toc--right)');
if (toc && window.matchMedia('(max-width: 760px)').matches) toc.removeAttribute('open');

const plainSummary = document.querySelector('#in-one-breath .decision-summary ol');
if (plainSummary) {
  const step = document.createElement('li');
  step.innerHTML = '<strong>Leave the place better than you found it.</strong> Take part in <a href="cooperative-projects.html">cooperative projects</a> that recognise useful activities on fair, transparent terms.';
  plainSummary.appendChild(step);
}

const groundFigure = document.querySelector('.ground-figure');
const groundImage = groundFigure?.querySelector('img');
if (groundFigure && groundImage) {
  const groundScenarios = [
    {
      src: 'assets/grounds.svg',
      label: 'Regional showground',
      alt: 'Concept diagram of a shared oval surrounded by solar sheds, a community hub, battery, amenities and homes on wheels, connected to the town.',
      caption: 'Regional showground: shared infrastructure can grow around an existing oval and amenities block.'
    },
    {
      src: 'assets/grounds-town-edge.svg',
      label: 'Town-edge retrofit',
      alt: 'Concept diagram of an existing town-edge depot and car park adapted with solar canopies, a shared workshop, gardens, amenities and bays for homes on wheels.',
      caption: 'Town-edge retrofit: a depot, car park or underused council site can be adapted in stages.'
    },
    {
      src: 'assets/grounds-riverside.svg',
      label: 'Riverside or harbour',
      alt: 'Concept diagram of a waterside community ground with a small boat landing, a shared hall, solar shade, gardens and mobile homes on higher ground.',
      caption: 'Riverside or harbour: water access can be part of the picture where it is safe, legal and suitable.'
    },
    {
      src: 'assets/grounds-island-marina.svg',
      label: 'Island or shore marina',
      alt: 'Concept diagram of an island or shoreline community ground with a small marina, solar buildings, a shared hall, workshop, gardens and places for homes on wheels above the waterfront.',
      caption: 'Island or shore marina: a water-connected ground needs separate access, safety and environmental design.'
    },
    {
      src: 'assets/grounds-resilience.svg',
      label: 'Resilience hub',
      alt: 'Concept diagram of a community hall and sports ground prepared as a resilience hub with solar, battery storage, communications, water and temporary accommodation.',
      caption: 'Resilience hub: a familiar community facility can support ordinary life and help during disruption.'
    }
  ];
  const caption = groundFigure.querySelector('figcaption');
  const counter = groundFigure.querySelector('.figure-top span:last-child');
  const controls = document.createElement('div');
  controls.className = 'ground-rotator-controls';
  controls.innerHTML = '<button type="button" class="ground-rotator-button" data-ground-prev aria-label="Show previous possible setting">←</button><span class="ground-rotator-status" aria-live="off"></span><button type="button" class="ground-rotator-button" data-ground-next aria-label="Show next possible setting">→</button>';
  groundFigure.appendChild(controls);
  const spaceKey = document.createElement('div');
  spaceKey.className = 'ground-space-key';
  spaceKey.innerHTML = '<p>Every suitable layout needs room for:</p><div><span><strong>Community hub</strong><small>meetings, meals, services and connection</small></span><span><strong>Maker space</strong><small>learning, shared tools and lighter projects</small></span><span><strong>Workshop / yard</strong><small>repairs, storage, materials and practical work</small></span></div>';
  groundFigure.appendChild(spaceKey);
  const status = controls.querySelector('.ground-rotator-status');
  let currentGround = 0;
  let timer = null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const showGround = (next, announce = false) => {
    currentGround = (next + groundScenarios.length) % groundScenarios.length;
    const scenario = groundScenarios[currentGround];
    groundImage.classList.add('is-swapping');
    window.setTimeout(() => {
      groundImage.src = scenario.src;
      groundImage.alt = scenario.alt;
      counter.textContent = `Concept / ${String(currentGround + 1).padStart(2, '0')} · ${scenario.label}`;
      caption.textContent = scenario.caption;
      status.setAttribute('aria-live', announce ? 'polite' : 'off');
      status.textContent = `${scenario.label} — ${currentGround + 1} of ${groundScenarios.length}`;
      groundImage.classList.remove('is-swapping');
    }, reducedMotion ? 0 : 160);
  };
  const stopRotation = () => { if (timer) { window.clearInterval(timer); timer = null; } };
  const startRotation = () => {
    stopRotation();
    if (!reducedMotion) timer = window.setInterval(() => showGround(currentGround + 1), 8500);
  };
  controls.querySelector('[data-ground-prev]').addEventListener('click', () => { showGround(currentGround - 1, true); startRotation(); });
  controls.querySelector('[data-ground-next]').addEventListener('click', () => { showGround(currentGround + 1, true); startRotation(); });
  groundFigure.addEventListener('pointerenter', stopRotation);
  groundFigure.addEventListener('pointerleave', startRotation);
  groundFigure.addEventListener('focusin', stopRotation);
  groundFigure.addEventListener('focusout', startRotation);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopRotation(); else startRotation(); });
  showGround(0);
  startRotation();
}

const specialisedHelp = document.querySelector('#people-are-not-a-stereotype .two-col > div:first-child');
if (specialisedHelp) {
  const note = document.createElement('p');
  note.textContent = 'Human rights are universal, including for people in prison. The hope is that safer options for people with different needs can reduce pressure on specialised beds, places and services, so they are more available to the people who need that level of support.';
  specialisedHelp.appendChild(note);
}

// Right-docked collapsible TOC (e.g. on model.html)
document.querySelectorAll('details.toc--right').forEach(tocRight => {
  tocRight.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      tocRight.removeAttribute('open');
    });
  });
  document.addEventListener('click', e => {
    if (tocRight.hasAttribute('open') && !tocRight.contains(e.target)) {
      tocRight.removeAttribute('open');
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && tocRight.hasAttribute('open')) {
      tocRight.removeAttribute('open');
    }
  });
});

// Responsive nav hamburger toggle
const navToggle = document.querySelector('.nav-toggle');
if (navToggle) {
  const nav = navToggle.closest('.nav');
  navToggle.addEventListener('click', () => {
    const open = nav.getAttribute('aria-expanded') === 'true';
    nav.setAttribute('aria-expanded', String(!open));
    navToggle.setAttribute('aria-expanded', String(!open));
    if (open) closeDrops();
  });
  // Close nav when a link is clicked (mobile UX)
  nav.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      nav.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const budget = document.querySelector('[data-budget]');
if (budget) {
  const fields = [...budget.querySelectorAll('input')];
  const output = budget.querySelector('[data-result]');
  const money = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 });
  const update = () => {
    if (fields.some(field => field.value.trim() === '' || !field.validity.valid)) {
      output.removeAttribute('data-shortfall');
      output.textContent = 'Enter a valid amount of $0 or more in every field.';
      return;
    }
    const income = Number(fields[0].value);
    const spending = fields.slice(1).reduce((sum, field) => sum + Number(field.value), 0);
    const balance = income - spending;
    output.dataset.shortfall = String(balance < 0);
    output.innerHTML = `<div><span>Weekly costs</span><strong>${money.format(spending)}</strong></div><div><span>${balance < 0 ? 'Weekly shortfall' : 'Left for other needs / savings'}</span><strong>${money.format(Math.abs(balance))}</strong></div>`;
  };
  budget.addEventListener('input', update);
  update();
}

// Cooperative steppers use the same keyboard pattern as tabs.
document.querySelectorAll('[data-coop-stepper]').forEach((stepper, stepperIndex) => {
  const buttons = [...stepper.querySelectorAll('[data-step-btn]')];
  const panels = [...stepper.querySelectorAll('[data-step-panel]')];
  if (!buttons.length || buttons.length !== panels.length) return;

  buttons.forEach((button, index) => {
    const panel = panels[index];
    const tabId = `coop-step-${stepperIndex}-${index}`;
    const panelId = `coop-panel-${stepperIndex}-${index}`;
    button.id = tabId;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', panelId);
    panel.id = panelId;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabId);
  });

  let activeIndex = Math.max(0, buttons.findIndex(button => button.getAttribute('aria-selected') === 'true'));
  const selectStep = (index, moveFocus = false) => {
    activeIndex = index;
    buttons.forEach((button, buttonIndex) => {
      const selected = buttonIndex === activeIndex;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((panel, panelIndex) => {
      const selected = panelIndex === activeIndex;
      panel.hidden = !selected;
      panel.style.display = selected ? 'block' : 'none';
    });
    if (moveFocus) buttons[activeIndex].focus();
  };

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => selectStep(index));
    button.addEventListener('keydown', event => {
      let nextIndex = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % buttons.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + buttons.length) % buttons.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = buttons.length - 1;
      if (nextIndex === null) return;
      event.preventDefault();
      selectStep(nextIndex, true);
    });
  });
  selectStep(activeIndex);
});

// Cooperative Payback Simulator
const sim = document.querySelector('[data-coop-simulator]');
if (sim) {
  const money = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 });
  const presets = {
    solar: { name: 'Solar Workshop', volunteerHours: 120, hourlyRate: 60, siteFacilities: 3500, users: 40, fee: 8 },
    water: { name: 'Water Filtration Hub', volunteerHours: 80, hourlyRate: 55, siteFacilities: 2400, users: 30, fee: 6 },
    repair: { name: 'Vehicle Repair Bay', volunteerHours: 160, hourlyRate: 65, siteFacilities: 4800, users: 25, fee: 15 }
  };
  let current = { ...presets.solar };
  const presetBtns = [...sim.querySelectorAll('[data-sim-preset]')];
  const usersRange = sim.querySelector('[data-sim-users]');
  const usersVal = sim.querySelector('[data-users-val]');
  const feeRange = sim.querySelector('[data-sim-fee]');
  const feeVal = sim.querySelector('[data-fee-val]');
  const outVolunteer = sim.querySelector('[data-out-volunteer]');
  const outSite = sim.querySelector('[data-out-site]');
  const outWeeks = sim.querySelector('[data-out-weeks]');
  const outAnnual = sim.querySelector('[data-out-annual]');

  const recalculate = () => {
    usersVal.textContent = `${current.users} users`;
    feeVal.textContent = `$${current.fee}/week`;
    const volunteerTotal = current.volunteerHours * current.hourlyRate;
    const siteTotal = current.siteFacilities;
    const totalObligation = volunteerTotal + siteTotal;
    const weeklyRevenue = current.users * current.fee;
    const repaymentRate = weeklyRevenue * 0.8;
    const weeks = repaymentRate > 0 ? Math.ceil(totalObligation / repaymentRate) : 0;
    const annualSiteIncome = weeklyRevenue * 0.2 * 52;

    outVolunteer.textContent = money.format(volunteerTotal);
    outSite.textContent = money.format(siteTotal);
    outWeeks.textContent = weeks > 0 ? `${weeks} wks` : '—';
    outAnnual.textContent = money.format(annualSiteIncome);
  };

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const key = btn.dataset.simPreset;
      if (presets[key]) {
        current = { ...presets[key] };
        usersRange.value = current.users;
        feeRange.value = current.fee;
        recalculate();
      }
    });
  });

  usersRange.addEventListener('input', e => {
    current.users = Number(e.target.value);
    recalculate();
  });
  feeRange.addEventListener('input', e => {
    current.fee = Number(e.target.value);
    recalculate();
  });
  recalculate();
}

// Real-World Commit Inspector
const inspector = document.querySelector('[data-commit-inspector]');
if (inspector) {
  const commitBtns = [...inspector.querySelectorAll('[data-commit]')];
  const viewer = inspector.querySelector('[data-commit-viewer]');
  const sampleCommits = [
    {
      hash: 'c81b94d',
      title: '32 hours Heavy Structural Chassis Welding',
      author: 'Sarah T. (Cert III/IV Engineering - Fabrication)',
      pod: 'https://sarah-trades.au.solidpod.org/profile/card#me',
      type: 'Human Labour (Skilled Trade)',
      metric: '32 hours @ $80/hr fair award benchmark',
      totalValue: '$2,560.00 AUD',
      priority: 'Priority 1 (Primary Contributor Sweat Equity)',
      siteDividendImpact: 'Enables roadworthy trailer chassis deployment',
      description: 'Fabricated high-tensile dual-axle trailer chassis for community solar microgrid workshop. All welding ultrasonic-tested and certified to AS/NZS 1554 standards. Uncompensated labour is cryptographically logged as contribution equity.'
    },
    {
      hash: 'f402a11',
      title: '28 Days High-Bay Shed 3 Access & 640 kWh Solar Microgrid Power',
      author: 'Regional Community Ground Trust (e.g. at Dubbo Showground)',
      pod: 'https://dubbo-community-ground.civics.au/trust/pod#facilities',
      type: 'Physical Facility & Utility Resource',
      metric: '28 workshop days @ $50/day + 640 kWh solar @ $0.30/kWh',
      totalValue: '$1,592.00 AUD',
      priority: 'Facility Obligation + Permanent Host Dividend',
      siteDividendImpact: 'Qualifies host community ground trust for permanent 15%–20% perpetual revenue stream on all trailer usage fees',
      description: 'Provided dedicated workshop bay, 3-phase power hookups, heavy hoist, and secure tool storage during prototyping. Establishes the host community ground trust as a primary stakeholder with ongoing audit rights.'
    },
    {
      hash: 'e91a78c',
      title: '14 hours Smart Microgrid & W3C Solid-Interoperable Telemetry Integration',
      author: 'Marcus L. (CPEng Registered Electrical Engineer)',
      pod: 'https://marcus-eng.au.solidpod.org/profile/card#me',
      type: 'Human Labour (Specialised Engineering)',
      metric: '14 hours @ $140/hr professional benchmark rate',
      totalValue: '$1,960.00 AUD',
      priority: 'Priority 1 (Technical Architecture Equity)',
      siteDividendImpact: 'Automates P2P billing & eliminates recurring SaaS cloud vendor fees',
      description: 'Programmed offline-first Raspberry Pi / Linux edge databox with Modbus IoT meters and W3C Solid-compatible pod authentication for autonomous microgrid dispatch and tamper-proof user credential logging across diverse systems.'
    },
    {
      hash: 'd52c67e',
      title: '48V 15kWh LiFePO4 Modular Battery Bank (Retested & Certified)',
      author: 'Regional Circular Materials Depot',
      pod: 'https://circular-materials.au.solidpod.org/hub#depot',
      type: 'Hardware & Circular Materials',
      metric: '16x 3.2V 300Ah cells + smart BMS + safety casing',
      totalValue: '$3,200.00 AUD',
      priority: 'Priority 1 (Direct Material Input Expense)',
      siteDividendImpact: 'Provides 3-day buffer capacity for off-grid community operation',
      description: 'Supplied high-cycle circular lithium storage salvaged from decommissioned telecom backup arrays, tested and balanced with digital safety certs logged into the supply chain ledger.'
    }
  ];

  const renderCommit = index => {
    const c = sampleCommits[index] || sampleCommits[0];
    viewer.innerHTML = `
      <div class="commit-viewer-head">
        <span class="commit-hash">commit ${c.hash}</span>
        <h4>${c.title}</h4>
        <div class="commit-badge-row">
          <span class="commit-badge">${c.type}</span>
          <span class="commit-badge" style="background:#fcedd8;color:#7a3a1d">${c.priority}</span>
        </div>
      </div>
      <div class="commit-grid">
        <div class="commit-field">
          <span>Contributor / Credential</span>
          <strong>${c.author}</strong>
        </div>
        <div class="commit-field">
          <span>Decentralised Identity (W3C Solid-Interoperable Pod)</span>
          <strong style="font-family:monospace;font-size:11px">${c.pod}</strong>
        </div>
        <div class="commit-field">
          <span>Fair-Value Valuation Basis</span>
          <strong>${c.metric}</strong>
        </div>
        <div class="commit-field highlight">
          <span>Total Logged Equity Obligation</span>
          <strong>${c.totalValue}</strong>
        </div>
        <div class="commit-field" style="grid-column:1 / -1">
          <span>Host Site & Ongoing Dividend Impact</span>
          <strong>${c.siteDividendImpact}</strong>
        </div>
      </div>
      <p class="commit-desc">${c.description}</p>
    `;
  };

  commitBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      commitBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCommit(idx);
    });
  });

  renderCommit(0);
}

// Walkabout fit-out & budget planner
const planner = document.querySelector('[data-setup-planner]');
if (planner) {
  planner.querySelectorAll('.opt-price').forEach(el => { el.dataset.base = el.textContent; });
  const money = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 });
  const kg = n => `${Math.round(n).toLocaleString('en-AU')} kg`;
  const PERSON_KG = 80;
  const presets = {
    van: { vehicleCost: 12000, onroadCost: 1500, berths: 2, payload: 900, fuelHwy: 9, fuelUrb: 12, fuelTow: 12 },
    bus: { vehicleCost: 25000, onroadCost: 3000, berths: 4, payload: 2500, fuelHwy: 18, fuelUrb: 24, fuelTow: 20 },
    motorhome: { vehicleCost: 30000, onroadCost: 2500, berths: 4, payload: 1200, fuelHwy: 14, fuelUrb: 18, fuelTow: 16 },
    trailer: { vehicleCost: 6500, trailerCost: 4000, onroadCost: 1500, berths: 4, towRating: 1600, ballRating: 150, atm: 950, tare: 680, fuelHwy: 10, fuelUrb: 13, fuelTow: 14 },
    caravan: { vehicleCost: 15000, trailerCost: 10000, onroadCost: 2000, berths: 4, towRating: 2500, ballRating: 250, atm: 1800, tare: 1400, fuelHwy: 11, fuelUrb: 14, fuelTow: 16 }
  };
  const TOW_TYPES = ['trailer', 'caravan'];


  const field = name => planner.querySelector(`[data-f="${name}"]`);
  const num = name => { const v = Number(field(name)?.value); return Number.isFinite(v) ? v : 0; };
  const towBlock = planner.querySelector('[data-tow-fields]');
  const vanBlock = planner.querySelector('[data-van-fields]');
  const result = planner.querySelector('[data-setup-result]');

  // Equipment rows are assembled dynamically, so give every control a name that
  // carries its row context instead of relying on its visual position.
  const rowControlNames = {
    batt: 'Include this battery bank', solar: 'Include this solar panel', mon: 'Include this monitor',
    mains: 'Include this plug-in source', chg: 'Include this charger', dev: 'Include this device',
    fit: 'Include this fit-out item', tech: 'Include this technology item',
    chem: 'Battery chemistry', ah: 'Battery capacity in amp-hours', volt: 'Battery bank voltage', bqty: 'Battery quantity', role: 'Battery bank role',
    pw: 'Panel wattage', pqty: 'Panel quantity', mtype: 'Monitor type', mqty: 'Monitor quantity',
    daycost: 'Cost per day', days: 'Days per week', ctype: 'Charger type', crate: 'Charger rating', cvolt: 'Output voltage',
    w: 'Power draw in watts', hrs: 'Hours per day', dqty: 'Quantity', conn: 'Connection type',
    aiw: 'Watts under AI compute load', always: 'Runs continuously', week: 'Recurring cost', period: 'Billing period'
  };
  const rowContext = row => row.querySelector('.item-name')?.value.trim()
    || ({ 'batt-row': 'Battery bank', 'solar-row': 'Solar panel', 'mon-row': 'Monitor', 'mains-row': 'Plug-in source', 'chg-row': 'Charger', 'dev-row': 'Device', 'stop-row': 'Travel stop' })[[...row.classList].find(name => name.endsWith('-row'))]
    || 'Item';
  const labelPlannerRow = row => {
    if (!row.classList.contains('item-row')) return;
    const context = rowContext(row);
    row.querySelectorAll('input, select, button').forEach(control => {
      if (control.type === 'hidden' || control.hasAttribute('aria-label')) return;
      if (control.classList.contains('item-del')) control.setAttribute('aria-label', `Remove ${context}`);
      else if (control.type === 'checkbox') control.setAttribute('aria-label', rowControlNames[Object.keys(rowControlNames).find(key => control.hasAttribute(`data-${key}`))] || `Include ${context}`);
      else if (control.hasAttribute('data-cost')) control.setAttribute('aria-label', `${context} cost`);
      else if (control.hasAttribute('data-kg')) control.setAttribute('aria-label', `${context} weight in kilograms`);
      else {
        const key = Object.keys(rowControlNames).find(name => control.hasAttribute(`data-${name}`));
        if (key) control.setAttribute('aria-label', `${context} — ${rowControlNames[key]}`);
      }
    });
  };
  planner.querySelectorAll('.item-row').forEach(labelPlannerRow);
  new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.matches?.('.item-row')) labelPlannerRow(node);
      node.querySelectorAll?.('.item-row').forEach(labelPlannerRow);
    }
  }))).observe(planner, { childList: true, subtree: true });

  const applyPreset = type => {
    const p = presets[type];
    if (!p) return;
    for (const [k, v] of Object.entries(p)) { const el = field(k); if (el) el.value = v; }
  };

  const verdict = (state, text) => `<div class="verdict ${state}"><b class="vtag">${state === 'ok' ? 'OK' : state === 'warn' ? 'Tight' : 'Check'}</b><span>${text}</span></div>`;

  let refreshItinerary = null;
  let heaterWk = 0;
  const recalc = () => {
    const type = planner.querySelector('input[name="setup-type"]:checked')?.value || 'van';
    const isTow = TOW_TYPES.includes(type);
    towBlock.hidden = !isTow;
    vanBlock.hidden = isTow;
    planner.querySelectorAll('[data-tow-cost]').forEach(el => { el.hidden = !isTow; });
    const offroad = field('offroad')?.checked || false;
    const orUplift = 5000;
    planner.querySelectorAll('.setup-opt').forEach(o => {
      const pe = o.querySelector('.opt-price');
      if (!pe?.dataset.base) return;
      const v = o.querySelector('input')?.value;
      const tow = v === 'trailer' || v === 'caravan';
      pe.textContent = pe.dataset.base + (offroad
        ? (v === 'bus' ? ' · road-going only — no 4WD'
           : tow ? ` · +${money.format(orUplift)} vehicle +${money.format(orUplift)} trailer for 4WD`
           : ` · +${money.format(orUplift)} for 4WD`)
        : '');
    });

    const dod = { lifepo4: 0.9, agm: 0.5, gel: 0.5, lead: 0.45 };
    const cRateDis = { lifepo4: 1, agm: 0.3, gel: 0.25, lead: 0.2 };
    const cRateChg = { lifepo4: 0.5, agm: 0.3, gel: 0.25, lead: 0.2 };
    let fitCost = 0, fitKg = 0, techCost = 0, techWeek = 0, solarW = 0, solarCost = 0, battCost = 0;
    let battWh = 0, battUsable = 0, bankCount = 0, bankRows = 0, solarBankV = 0, secondaryBanks = 0;
    let dailyWh = 0, heaterWh = 0, coolWh = 0, acWh = 0, acMax = 0, acTotal = 0, devCount = 0, mainsWeek = 0, mainsUpfront = 0, techW = 0;
    let ac247 = false, entW = 0, entAcW = 0;
    let need12W = 0, need24W = 0, monCount = 0, btMonitors = 0, aiW = 0, oddSeries = 0;
    const solarTopo24 = ['solar24house12', 'only24'].includes(planner.querySelector('[data-f="topology"]')?.value);
    const volts = new Set(), bankBits = [];
    const bankAhV = {}, bankDisA = {};
    let solarBankAh = 0, solarBankChem = 'lifepo4';
    planner.querySelectorAll('[data-batt]').forEach(cb => {
      if (!cb.checked) return;
      const row = cb.closest('.item-row');
      const chem = row?.querySelector('[data-chem]')?.value || 'lifepo4';
      const ah = Number(row?.querySelector('[data-ah]')?.value) || 0;
      const v = Number(row?.querySelector('[data-volt]')?.value) || 12;
      const qty = Number(row?.querySelector('[data-bqty]')?.value) || 1;
      const role = row?.querySelector('[data-role]')?.value;
      const seriesPairs = role === 'solar' && v === 12 && solarTopo24;
      const effV = seriesPairs ? 24 : v;
      const wh = ah * v * qty;
      battWh += wh; battUsable += wh * (dod[chem] ?? 0.5); bankCount += qty; bankRows++;
      volts.add(effV);
      const strings = seriesPairs ? Math.floor(qty / 2) : qty;
      const bankAh = ah * strings;
      bankAhV[effV] = (bankAhV[effV] || 0) + bankAh;
      bankDisA[effV] = (bankDisA[effV] || 0) + bankAh * (cRateDis[chem] ?? 0.5);
      if (role === 'solar' && !solarBankV) { solarBankV = effV; solarBankAh = bankAh; solarBankChem = chem; }
      if (role === 'secondary') secondaryBanks += qty;
      if (seriesPairs && qty % 2) oddSeries = qty;
      fitCost += qty * (Number(row?.querySelector('[data-cost]')?.value) || 0);
      battCost += qty * (Number(row?.querySelector('[data-cost]')?.value) || 0);
      fitKg += qty * (Number(row?.querySelector('[data-kg]')?.value) || 0);
      bankBits.push(`${qty}× ${ah}Ah ${chemName[chem] || chem} @${v}V${seriesPairs ? ` — ${Math.floor(qty / 2)} series pair(s) → ${ah * Math.floor(qty / 2)}Ah @24V` : ''}`);
    });
    planner.querySelectorAll('[data-solar]').forEach(cb => {
      if (!cb.checked) return;
      const row = cb.closest('.item-row');
      const qty = Number(row?.querySelector('[data-pqty]')?.value) || 0;
      solarW += qty * (Number(row?.querySelector('[data-pw]')?.value) || 0);
      fitCost += qty * (Number(row?.querySelector('[data-cost]')?.value) || 0);
      solarCost += qty * (Number(row?.querySelector('[data-cost]')?.value) || 0);
      fitKg += qty * (Number(row?.querySelector('[data-kg]')?.value) || 0);
    });
    const effSolarW = solarW * ((num('panelYield') || 75) / 100);
    planner.querySelectorAll('[data-fit]').forEach(cb => {
      if (!cb.checked) return;
      const row = cb.closest('.item-row');
      fitCost += Number(row?.querySelector('[data-cost]')?.value) || 0;
      fitKg += Number(row?.querySelector('[data-kg]')?.value) || 0;
    });
    planner.querySelectorAll('[data-tech]').forEach(cb => {
      if (!cb.checked) return;
      const row = cb.closest('.item-row');
      techCost += Number(row?.querySelector('[data-cost]')?.value) || 0;
      const sub = Number(row?.querySelector('[data-week]')?.value) || 0;
      techWeek += row?.querySelector('[data-period]')?.value === 'mo' ? sub * 12 / 52 : sub;
      const w = Number(row?.querySelector('[data-w]')?.value) || 0;
      const hrs = Number(row?.querySelector('[data-hrs]')?.value) || 0;
      const qty = Number(row?.querySelector('[data-dqty]')?.value) || 1;
      const always = row?.querySelector('[data-always]')?.checked;
      const idleF = (num('idleFrac') || 25) / 100;
      const wh = always ? w * qty * (hrs + idleF * Math.max(0, 24 - hrs)) : w * hrs * qty;
      dailyWh += wh; devCount += qty; techW += w * qty;
      const conn = row?.querySelector('[data-conn]')?.value;
      if (conn === 'ac240') { acWh += wh; acTotal += w * qty; if (w > acMax) acMax = w; if (always) ac247 = true; }
      else if (conn === 'dc24') need24W += w * qty;
      else need12W += w * qty;
      const nm = (row?.querySelector('.item-name')?.value || '').toLowerCase();
      if (/laptop|monitor|computer|starlink|hotspot|router|screen|tv|tablet|phone/.test(nm)) {
        entW += w * qty;
        if (conn === 'ac240') entAcW += w * qty;
      }
      const aiw = Number(row?.querySelector('[data-aiw]')?.value) || 0;
      if (aiw > aiW) aiW = aiw;
    });
    const entWh = entW * (num('dnEnt') || 0);
    dailyWh += entWh; acWh += entAcW * (num('dnEnt') || 0);
    planner.querySelectorAll('[data-mains]').forEach(cb => {
      if (!cb.checked) return;
      const row = cb.closest('.item-row');
      mainsWeek += (Number(row?.querySelector('[data-daycost]')?.value) || 0) * (Number(row?.querySelector('[data-days]')?.value) || 0);
      mainsUpfront += Number(row?.querySelector('[data-cost]')?.value) || 0;
    });
    planner.querySelectorAll('[data-dev]').forEach(cb => {
      if (!cb.checked) return;
      const row = cb.closest('.item-row');
      const w = Number(row?.querySelector('[data-w]')?.value) || 0;
      const hrs = Number(row?.querySelector('[data-hrs]')?.value) || 0;
      const qty = Number(row?.querySelector('[data-dqty]')?.value) || 1;
      const wh = w * hrs * qty;
      const devName = row?.querySelector('.item-name')?.value || '';
      if (/diesel\s*heater/i.test(devName)) heaterWh += wh;
      else if (/air\s*con|evaporative|cooler/i.test(devName)) coolWh += wh;
      else dailyWh += wh;
      devCount += qty;
      const conn = row?.querySelector('[data-conn]')?.value;
      if (conn === 'ac240') { acWh += wh; acTotal += w * qty; if (w > acMax) acMax = w; }
      else if (conn === 'dc24') need24W += w * qty;
      else need12W += w * qty;
      fitCost += qty * (Number(row?.querySelector('[data-cost]')?.value) || 0);
      fitKg += qty * (Number(row?.querySelector('[data-kg]')?.value) || 0);
    });
    planner.querySelectorAll('[data-mon]').forEach(cb => {
      if (!cb.checked) return;
      const row = cb.closest('.item-row');
      const qty = Number(row?.querySelector('[data-mqty]')?.value) || 1;
      monCount += qty;
      if ((row?.querySelector('[data-mtype]')?.value || '').startsWith('bt')) btMonitors += qty;
      fitCost += qty * (Number(row?.querySelector('[data-cost]')?.value) || 0);
      fitKg += qty * (Number(row?.querySelector('[data-kg]')?.value) || 0);
    });
    let mpptA = 0, dcdcA = 0, ac2dcA = 0, buckA = 0, invW = 0, invFirstV = 0, gearCost = 0;
    const invWV = {};
    planner.querySelectorAll('[data-chg]').forEach(cb => {
      if (!cb.checked) return;
      const row = cb.closest('.item-row');
      const t = row?.querySelector('[data-ctype]')?.value;
      const r = Number(row?.querySelector('[data-crate]')?.value) || 0;
      gearCost += Number(row?.querySelector('[data-cost]')?.value) || 0;
      fitKg += Number(row?.querySelector('[data-kg]')?.value) || 0;
      if (t === 'mppt') mpptA += r;
      else if (t === 'dcdc') { dcdcA += r; mpptA += r; }
      else if (t === 'ac2dc') ac2dcA += r;
      else if (t === 'buck') buckA += r;
      else if (t === 'inv') { invW += r; const iv = Number(row?.querySelector('[data-cvolt]')?.value) || 12; invWV[iv] = (invWV[iv] || 0) + r; if (!invFirstV) invFirstV = iv; }
    });

    const invIdleWh = invW > 0 ? (num('invIdleW') || 0) * (ac247 ? 24 : (num('invIdleHrs') || 0)) : 0;
    dailyWh += invIdleWh;
    const occupants = num('occupants'), berths = num('berths');
    let price = num('vehicleCost') + (isTow ? num('trailerCost') : 0) + num('onroadCost');
    const offroadApplies = offroad && type !== 'bus';
    const priceOut = field('price');
    if (priceOut) priceOut.value = Math.round(price);
    const loadKg = fitKg + occupants * PERSON_KG;
    const upfront = price + fitCost + techCost + gearCost + mainsUpfront;

    const loanField = field('loan');
    const loanYears = num('loanYears'), loanRate = num('loanRate');
    if (loanYears > 0) {
      const n = loanYears * 52, r = loanRate / 100 / 52;
      const pmt = r > 0 ? price * r / (1 - Math.pow(1 + r, -n)) : price / n;
      if (loanField) { loanField.value = Math.round(pmt); loanField.disabled = true; }
    } else if (loanField) loanField.disabled = false;

    const verdicts = [];
    if (!isTow) {
      const payload = num('payload');
      if (payload > 0) {
        const r = loadKg / payload;
        verdicts.push(verdict(r > 1 ? 'fail' : r > 0.85 ? 'warn' : 'ok', `Payload: ${kg(loadKg)} of people and fit-out against ${kg(payload)} capacity${r > 1 ? ' — overloaded' : r > 0.85 ? ' — thin margin for water and gear' : ''}.`));
      }
    } else {
      const towRating = num('towRating'), ballRating = num('ballRating'), atm = num('atm'), tare = num('tare');
      const ballPct = num('ballPct') || 10;
      const ball = atm * ballPct / 100, trailerPayload = atm - tare;
      if (towRating > 0 && atm > 0) verdicts.push(verdict(atm > towRating ? 'fail' : atm > towRating * 0.85 ? 'warn' : 'ok', `Tow: ${kg(atm)} loaded against ${kg(towRating)} rated capacity${atm > towRating ? ' — this vehicle cannot legally tow it' : atm > towRating * 0.85 ? ' — little margin for hills, water and gear' : ''}.`));
      if (ballRating > 0 && atm > 0) verdicts.push(verdict(ball > ballRating ? 'fail' : 'ok', `Ball weight ~${kg(ball)} against ${kg(ballRating)} towball rating${ball > ballRating ? ' — exceeds the limit' : ''}.`));
      if (trailerPayload > 0) verdicts.push(verdict(loadKg > trailerPayload ? 'fail' : loadKg > trailerPayload * 0.85 ? 'warn' : 'ok', `${type === 'caravan' ? 'Caravan' : 'Trailer'} payload: ${kg(loadKg)} of gear and occupants against ${kg(trailerPayload)} available (ATM − tare)${loadKg > trailerPayload ? ' — would push it over ATM' : ''}.`));
    }
    if (berths > 0) verdicts.push(verdict(occupants > berths ? 'fail' : 'ok', `Space: sleeps ${berths} for ${occupants} ${occupants === 1 ? 'person' : 'people'}${occupants > berths ? ' — not enough berths' : ''}.`));

    const powerLines = [];
    if (bankCount) {
      powerLines.push(`Batteries: ${bankBits.join(' + ')} — ${Math.round(battWh).toLocaleString('en-AU')} Wh nominal, ~${Math.round(battUsable).toLocaleString('en-AU')} Wh usable after chemistry depth-of-discharge.`);
      powerLines.push(`Discharge headroom: ${Object.entries(bankDisA).map(([v, a]) => `${v}V side ≈ ${Math.round(a)}A continuous (chemistry/BMS limit)`).join('; ')} — inverters and simultaneous loads must stay under this.`);
      if (volts.size > 1) powerLines.push(`Mixed ${[...volts].join('V / ')}V banks — secondary banks charge from the solar bank via a DC-DC charger (allow for its cost and ~10% conversion loss).`);
      if (oddSeries) verdicts.push(verdict('warn', `A 24V bank built from 12V batteries needs series pairs — ${oddSeries} is an odd count; wire in pairs (2, 4, 6…) or one battery sits unused.`));
      if (monCount === 0) verdicts.push(verdict('warn', `No shunt/monitor listed — without one you can't see state of charge, only voltage (a poor gauge for LiFePO4).`));
      else if (monCount < bankRows) verdicts.push(verdict('warn', `${bankRows} banks but ${monCount} shunt(s) — unmonitored banks won't show state of charge.`));
      if (btMonitors > 0) powerLines.push(`Bluetooth monitoring exposes bank state (SoC, amps, history) to apps and services — the data hook for folding power cost into remote AI metering or power-sharing; see the <a href="databox.html">databox component</a>.`);
      if (solarW > 0) {
        const chargeV = solarBankV || [...volts][0] || 12;
        const needA = effSolarW / chargeV;
        if (mpptA <= 0) verdicts.push(verdict('warn', `No solar controller ticked — the ${solarW.toLocaleString('en-AU')} W array has no path into the bank.`));
        else {
          const capW = mpptA * chargeV;
          const dual = chargeV === 12 ? ` — a dual-voltage controller covers ~${(capW * 2).toLocaleString('en-AU')}W on a 24V bank` : '';
          verdicts.push(verdict(needA > mpptA ? 'fail' : needA > mpptA * 0.85 ? 'warn' : 'ok', `MPPT: ${solarW.toLocaleString('en-AU')}W nameplate ≈ ${Math.round(effSolarW).toLocaleString('en-AU')}W real into a ${chargeV}V bank needs ~${Math.ceil(needA)}A — controller(s) rated ${mpptA}A ≈ ${capW.toLocaleString('en-AU')}W at ${chargeV}V${needA > mpptA ? ` — undersized, the array will clip${dual}` : needA > mpptA * 0.85 ? ' — close to its limit' : ''}.`));
          if (solarBankAh > 0) {
            const chgA = Math.min(mpptA, needA), accA = solarBankAh * (cRateChg[solarBankChem] ?? 0.3);
            if (chgA > accA) verdicts.push(verdict('warn', `Charge rate: solar can push ~${Math.ceil(chgA)}A into a ${solarBankAh}Ah ${chemName[solarBankChem] || solarBankChem} bank — above its ~${Math.round(accA)}A recommended rate (${cRateChg[solarBankChem]}C); the excess harvest is wasted and ages the cells.`));
          }
        }
      }
    } else if (solarW > 0) {
      powerLines.push(`${solarW.toLocaleString('en-AU')} W of solar but no battery bank — add a bank to store it.`);
    }
    if (secondaryBanks > 0 && dcdcA <= 0) verdicts.push(verdict('warn', `Secondary bank(s) listed but no DC-DC charger row is ticked — they need a charging path from the solar bank.`));
    if (mainsWeek > 0 && bankRows > 0 && ac2dcA <= 0) verdicts.push(verdict('warn', `Plug-in power listed but no AC→DC charger — powered sites can't recharge the bank without one.`));
    if (solarW > 0) powerLines.push(`Generation ≈ ${(effSolarW * num('pshSummer') / 1000).toFixed(1)} kWh/day in summer, ${(effSolarW * num('pshWinter') / 1000).toFixed(1)} kWh/day in winter (real-world — nameplate × ${num('panelYield') || 75}%)${battUsable > 0 ? ` — a depleted bank takes ~${Math.max(1, Math.ceil(battUsable / (effSolarW * num('pshWinter') || 1)))} winter day(s) to refill` : ''}.`);
    if (acMax > 0) {
      if (invW <= 0) verdicts.push(verdict('fail', `Devices on 240V AC (largest ${acMax.toLocaleString('en-AU')}W) but no inverter — add one or switch them to 12V/USB.`));
      else if (acMax > invW) verdicts.push(verdict('fail', `Inverter ${invW}W can't run the largest 240V device (${acMax.toLocaleString('en-AU')}W).`));
      else if (acTotal > invW) verdicts.push(verdict('warn', `Inverter ${invW}W covers each 240V device, but combined AC draw is ${acTotal.toLocaleString('en-AU')}W — stagger use.`));
      else verdicts.push(verdict('ok', `Inverter ${invW}W covers the 240V load (largest ${acMax.toLocaleString('en-AU')}W).`));
    }
    if (bankCount > 0) {
      const has12V = volts.has(12), has24V = volts.has(24);
      if (need24W > 0 && !has24V) verdicts.push(verdict('fail', `${need24W.toLocaleString('en-AU')}W of 24V devices but no 24V bank — change their connection or the bank voltage.`));
      if (need12W > 0 && !has12V) {
        const needA = need12W / 12;
        if (buckA <= 0) verdicts.push(verdict('fail', `${need12W.toLocaleString('en-AU')}W of 12V/USB loads but no 12V bank — needs a 24V→12V step-down converter (~${Math.ceil(needA)}A).`));
        else verdicts.push(verdict(needA > buckA ? 'fail' : 'ok', `Step-down: 12V/USB loads ${need12W.toLocaleString('en-AU')}W (~${Math.ceil(needA)}A at 12V) against a ${buckA}A converter${needA > buckA ? ' — undersized' : ''}.`));
      }
      const invIdleW = num('invIdleW') || 0;
      const dcDemand = { 12: need12W, 24: need24W };
      if (!has12V && buckA > 0 && has24V) dcDemand[24] += need12W / 0.9;
      if (invFirstV) dcDemand[invFirstV] = (dcDemand[invFirstV] || 0) + invIdleW;
      [12, 24].forEach(v => {
        const w = dcDemand[v] || 0;
        if (w > 0 && bankAhV[v]) {
          const drawA = w / v, maxA = bankDisA[v];
          if (drawA > maxA) verdicts.push(verdict('warn', `All ${v}V loads on at once would draw ~${Math.ceil(drawA)}A — above the ${v}V bank's ~${Math.round(maxA)}A continuous discharge limit; stagger use or add capacity.`));
        }
      });
      Object.entries(invWV).forEach(([iv, w]) => {
        const v = Number(iv);
        if (!bankAhV[v]) verdicts.push(verdict('fail', `Inverter is ${v}V input but the bank has no ${v}V side — match the inverter's input voltage to the bank.`));
        else {
          const drawA = w / v / 0.88, maxA = bankDisA[v];
          const loadA = Math.min(w, acTotal) / v / 0.88;
          verdicts.push(verdict(drawA > maxA ? 'fail' : drawA > maxA * 0.85 ? 'warn' : 'ok', `Discharge rate: the ${w.toLocaleString('en-AU')}W rating is a ceiling — at full load it pulls ~${Math.ceil(drawA)}A from the ${v}V bank (limit ≈ ${Math.round(maxA)}A, ${Math.round(bankAhV[v])}Ah); the AC loads listed (~${Math.round(acTotal).toLocaleString('en-AU')}W combined) draw ~${Math.ceil(loadA)}A in practice${drawA > maxA ? ' — the bank cannot sustain full output (BMS trip or voltage sag)' : drawA > maxA * 0.85 ? ' — thin headroom at full load' : ''}${v === 12 && drawA > 80 ? ` — ${Math.ceil(drawA)}A also means heavy cable and fusing; on a 24V bank the same inverter draws ~${Math.ceil(w / 24 / 0.88)}A` : ''}.`));
        }
      });
    }
    const useWin = dailyWh + heaterWh, useSum = dailyWh + coolWh;
    if (useWin > 0 || useSum > 0) {
      const winGen = effSolarW * num('pshWinter'), sumGen = effSolarW * num('pshSummer');
      const useTxt = `~${(dailyWh / 1000).toFixed(2)} kWh/day${heaterWh > 0 ? ` (+${(heaterWh / 1000).toFixed(2)} kWh/day heater on cold nights)` : ''}${coolWh > 0 ? ` (+${(coolWh / 1000).toFixed(2)} kWh/day cooling on hot days)` : ''}`;
      if (solarW <= 0) verdicts.push(verdict('warn', `${useTxt} of devices but no solar — relies on plug-in power or alternator charging.`));
      else {
        const gaps = [];
        if (winGen < useWin) gaps.push(`winter ~${(winGen / 1000).toFixed(1)} vs ${(useWin / 1000).toFixed(2)} kWh/day used`);
        if (sumGen < useSum) gaps.push(`summer ~${(sumGen / 1000).toFixed(1)} vs ${(useSum / 1000).toFixed(2)} kWh/day used`);
        if (!gaps.length) verdicts.push(verdict('ok', `Energy balance: ${useTxt} of use covered in both seasons (~${(winGen / 1000).toFixed(1)} winter / ~${(sumGen / 1000).toFixed(1)} summer kWh/day generation).`));
        else verdicts.push(verdict(gaps.length === 2 ? 'fail' : 'warn', `Energy balance: generation falls short — ${gaps.join('; ')} — plug in or shed load in those months.`));
      }
      powerLines.push(`Use ≈ ${(dailyWh / 1000).toFixed(2)} kWh/day across ${devCount} device(s)${heaterWh > 0 ? ` — the diesel heater adds ${(heaterWh / 1000).toFixed(2)} kWh/day only when nights are cold` : ''}${coolWh > 0 ? `; cooling adds ${(coolWh / 1000).toFixed(2)} kWh/day on hot days` : ''}${invIdleWh > 0 ? `, incl. ~${Math.round(invIdleWh)} Wh/day inverter standby${ac247 && invW > 0 ? ' (24/7 AC gear keeps it on all day)' : ''}` : ''}${acWh > 0 ? ` (${Math.round(acWh).toLocaleString('en-AU')} Wh via 240V AC — allow ~10% inverter loss)` : ''}${battUsable > 0 ? ` — bank autonomy ≈ ${(battUsable / Math.max(useWin, useSum)).toFixed(1)} days` : ''}.`);
      if (aiW > 0 && solarW > 0) {
        const sSur = Math.max(0, sumGen - useSum) / 1000, wSur = Math.max(0, winGen - useWin) / 1000;
        if (sSur > 0.05) powerLines.push(`Spare solar ≈ ${sSur.toFixed(1)} kWh/day summer / ${wSur.toFixed(1)} winter — an AI-capable computer at ~${aiW} W could run ~${(sSur * 1000 / aiW).toFixed(0)} h/day of compute while the bank's full and the rig is idle. That's the metering hook for selling AI compute (see the <a href="databox.html">databox component</a>).`);
      }
    }
    if (field('dnOn')?.checked) {
      const dnD = num('dnDay'), dnN = Math.min(num('dnNight'), dnD);
      if (techW <= 0) verdicts.push(verdict('warn', `Digital nomad ticked but no work gear (laptop, workstation, hotspot…) is ticked below — the work hours need something to power.`));
      else {
        const entH = num('dnEnt') || 0;
        const nightWh = techW * dnN + entWh;
        verdicts.push(verdict(dnN > 0 && battUsable <= 0 ? 'fail' : nightWh > battUsable ? 'warn' : 'ok',
          `Digital nomad: the ticked work gear draws ~${Math.round(techW)}W — ${dnD}h/day powered, ${dnN}h of it after dark${entH > 0 ? ` + ${entH}h/day entertainment on the same gear (mostly after dark)` : ''} ≈ ${Math.round(nightWh).toLocaleString('en-AU')} Wh straight from the bank (~${Math.round(battUsable).toLocaleString('en-AU')} Wh usable)${nightWh > battUsable ? ' — the bank runs dry before morning: more storage, fewer night hours, or a powered site' : dnN > 0 ? ' — overnight use fits the bank; daytime hours overlap solar generation' : ' — daytime use largely overlaps solar generation'}.${acWh > 0 && dnN > 0 ? ' AC work gear also keeps the inverter on overnight (idle draw counts).' : ''}${ac247 && invW > 0 ? ' AC gear ticked 24/7 keeps the inverter on all day — standby is counted at 24h.' : ''}`));
      }
    }
    if (mainsWeek > 0) powerLines.push(`Plug-in power adds $${Math.round(mainsWeek).toLocaleString('en-AU')}/wk — on mains days the battery budget barely matters.`);
    if (offroadApplies) powerLines.push(`4WD-capable rig — unlocks remote bush camps (the ~$15/wk site option) that a road-going rig can't reach. A 4WD build typically costs ~${money.format(orUplift)} more per component (see the price lines above); rough tracks also raise fuel use and wear.`);
    if (offroad && type === 'bus') verdicts.push(verdict('warn', `Bus/coach conversions are road-going rigs — the 4WD option doesn't apply, and remote bush camps generally won't be accessible.`));
    heaterWk = 0;
    refreshItinerary?.(verdicts, powerLines, effSolarW, dailyWh, isTow ? num('fuelTow') : num('fuelHwy'), heaterWh, coolWh);

    const siteSel = field('siteScenario');
    siteSel.querySelectorAll('option[data-offroad]').forEach(o => { o.disabled = !offroadApplies; });
    if (!offroadApplies && siteSel.selectedOptions[0]?.dataset.offroad === '1') siteSel.value = '40';
    const siteFee = Number(siteSel.value) || 0;
    const onGrounds = siteSel.selectedOptions[0]?.dataset.grounds === '1';
    const regoWeekly = (num('regoYr') + (isTow ? num('trailerRegoYr') : 0) + num('assistYr') + num('tppYr') + num('compYr')) / 52;
    const weekly = siteFee + num('food') + num('fuel') + regoWeekly + num('repairs') + num('loan') + num('other') + techWeek + mainsWeek + heaterWk;
    const income = num('income');
    const balance = income - weekly;
    const withoutFee = onGrounds ? 350 : siteFee;
    const woWeekly = weekly - siteFee + withoutFee;
    const woBalance = income - woWeekly;

    const cgOn = field('cgOn')?.checked;
    let cgWeekly = 0, cgUpfront = 0;
    if (cgOn) {
      const cgFee = num('cgFee');
      cgWeekly = weekly - siteFee + cgFee;
      const cgAvoided = (field('cgNoSolar')?.checked ? solarCost : 0) + (field('cgNoBatt')?.checked ? battCost : 0) + (field('cgNoChg')?.checked ? gearCost : 0);
      cgUpfront = upfront - cgAvoided;
      const comparisonWeekly = onGrounds ? woWeekly : weekly;
      const wkDelta = comparisonWeekly - cgWeekly;
      const comparisonLabel = onGrounds ? 'the commercial-site benchmark' : 'the current site choice';
      const cgStay = num('cgStay') || 90;
      powerLines.push(`Community Grounds scenario: a powered site at ${money.format(cgFee)}/wk${field('cgCard')?.checked ? ' (concession rate, proven by the digital concession card)' : ''}, default stay cap ~${cgStay} days (vs 7–28-day caps common today) → weekly cost ${money.format(cgWeekly)} vs ${money.format(comparisonWeekly)} for ${comparisonLabel} — ${wkDelta >= 0 ? 'saves' : 'adds'} ${money.format(Math.abs(wkDelta))}/wk ≈ ${money.format(Math.abs(wkDelta) * 52)}/yr${cgAvoided > 0 ? `; and ${money.format(cgAvoided)} of owner-purchased energy gear isn't needed (upfront ${money.format(cgUpfront)} vs ${money.format(upfront)})` : ''}.`);
    }

    result.innerHTML = `
      ${powerLines.length ? `<div class="power-lines">${powerLines.map(l => `<div class="pline">${l}</div>`).join('')}</div>` : ''}
      <div class="verdicts">${verdicts.join('')}</div>
      <div class="res-groups">
        <div class="res-group">
          <h4>The rig — what the participant pays &amp; generates</h4>
          <div class="budget-result">
            <div><span>Owner pays upfront — vehicle, fit-out &amp; gear</span><strong>${money.format(upfront)}</strong></div>
            <div><span>Solar array — nameplate / real output</span><strong>${solarW ? solarW.toLocaleString('en-AU') + ' W / ~' + Math.round(effSolarW).toLocaleString('en-AU') + ' W' : '—'}</strong></div>
          </div>
        </div>
        <div class="res-group">
          <h4>Cost of living — without a community ground</h4>
          <div class="budget-result">
            <div><span>Weekly cost${onGrounds ? ' — caravan-park benchmark ($350/wk site)' : ' — as configured'}</span><strong>${money.format(woWeekly)}</strong></div>
            <div${woBalance < 0 ? ' class="neg"' : ''}><span>${woBalance < 0 ? 'Weekly shortfall' : 'Weekly margin'} (income − costs)</span><strong>${woBalance < 0 ? '−' : '+'}${money.format(Math.abs(woBalance))}/wk</strong></div>
          </div>
        </div>
        <div class="res-group">
          <h4>Cost of living — on a powered community ground</h4>
          ${cgOn ? `<div class="budget-result">
            <div><span>Weekly cost — ${money.format(num('cgFee'))}/wk site fee</span><strong>${money.format(cgWeekly)}</strong></div>
            <div${income - cgWeekly < 0 ? ' class="neg"' : ''}><span>${income - cgWeekly < 0 ? 'Weekly shortfall' : 'Weekly margin'} (income − costs)</span><strong>${income - cgWeekly < 0 ? '−' : '+'}${money.format(Math.abs(income - cgWeekly))}/wk</strong></div>
            <div><span>Owner upfront — less gear needed at a powered site</span><strong>${money.format(cgUpfront)}${cgUpfront !== upfront ? ` (−${money.format(upfront - cgUpfront)})` : ''}</strong></div>
          </div>` : `<p class="small">The comparison is switched off — tick "Compare with a supported Community Grounds / Walkabout scenario" at the top.</p>`}
        </div>
      </div>`;
  };

  const chemName = { lifepo4: 'LiFePO4', agm: 'AGM', gel: 'Gel', lead: 'Lead-acid' };
  const bankRow = p => {
    const row = document.createElement('div');
    row.className = 'item-row batt-row';
    row.innerHTML = `<input type="checkbox" data-batt checked><select data-chem aria-label="Battery chemistry">${Object.entries(chemName).map(([c, n]) => `<option value="${c}"${c === p.chem ? ' selected' : ''}>${n}</option>`).join('')}</select><span class="batt-spec"><input data-ah type="number" min="1" max="3000" step="1" value="${p.ah}" aria-label="Capacity (Ah)"> Ah @ <select data-volt aria-label="Bank voltage">${[12, 24, 48].map(v => `<option value="${v}"${v === p.v ? ' selected' : ''}>${v}V</option>`).join('')}</select> × <input data-bqty type="number" min="1" max="20" step="1" value="${p.qty}" aria-label="Quantity"></span><select data-role aria-label="Bank role"><option value="solar"${p.role === 'solar' ? ' selected' : ''}>Solar input</option><option value="secondary"${p.role === 'secondary' ? ' selected' : ''}>Secondary (DC-DC)</option></select><span class="money-input">$<input data-cost type="number" min="0" max="100000" step="1" value="${p.cost}"> ea</span><span class="money-input"><input data-kg type="number" min="0" max="500" step="0.5" value="${p.kg}"> kg ea</span><button type="button" class="item-del" aria-label="Remove item" title="Remove">×</button>`;
    return row;
  };
  const BANK_PRESETS = {
    single12: [{ chem: 'lifepo4', ah: 100, v: 12, qty: 1, role: 'solar', cost: 800, kg: 12 }],
    dual12: [{ chem: 'lifepo4', ah: 100, v: 12, qty: 1, role: 'solar', cost: 800, kg: 12 }, { chem: 'lifepo4', ah: 100, v: 12, qty: 1, role: 'secondary', cost: 800, kg: 12 }],
    solar24house12: [{ chem: 'lifepo4', ah: 100, v: 24, qty: 1, role: 'solar', cost: 1600, kg: 24 }, { chem: 'lifepo4', ah: 100, v: 12, qty: 1, role: 'secondary', cost: 800, kg: 12 }],
    only24: [{ chem: 'lifepo4', ah: 100, v: 24, qty: 1, role: 'solar', cost: 1600, kg: 24 }],
  };
  const topoSel = planner.querySelector('[data-f="topology"]');
  topoSel?.addEventListener('change', () => {
    const grid = planner.querySelector('[data-batt-grid]');
    grid.innerHTML = '';
    (BANK_PRESETS[topoSel.value] || BANK_PRESETS.single12).forEach(p => grid.appendChild(bankRow(p)));
    recalc();
  });

  const addItem = (gridSel, flag, placeholder, extra) => {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `<input type="checkbox" ${flag} checked><input class="item-name" type="text" placeholder="${placeholder}" aria-label="Item description"><span class="money-input">$<input data-cost type="number" min="0" max="1000000" step="1" value="0"></span>${extra}<button type="button" class="item-del" aria-label="Remove item" title="Remove">×</button>`;
    planner.querySelector(gridSel).appendChild(row);
    row.querySelector('.item-name').focus();
    recalc();
  };
  planner.querySelector('[data-add-solar]')?.addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'item-row solar-row';
    row.innerHTML = `<input type="checkbox" data-solar checked><input class="item-name" type="text" value="Solar panel" aria-label="Panel type"><span class="solar-spec"><input data-pw type="number" min="0" max="2000" step="10" value="300" aria-label="Panel wattage"> W × <input data-pqty type="number" min="1" max="50" step="1" value="1" aria-label="Panel quantity"></span><span class="money-input">$<input data-cost type="number" min="0" max="100000" step="1" value="150"> ea</span><span class="money-input"><input data-kg type="number" min="0" max="500" step="0.5" value="13.3"> kg ea</span><button type="button" class="item-del" aria-label="Remove item" title="Remove">×</button>`;
    planner.querySelector('[data-solar-grid]').appendChild(row);
    row.querySelector('[data-pw]').focus();
    recalc();
  });
  planner.querySelector('[data-add-batt]')?.addEventListener('click', () => {
    planner.querySelector('[data-batt-grid]').appendChild(bankRow({ chem: 'lifepo4', ah: 200, v: 12, qty: 1, role: 'secondary', cost: 0, kg: 0 }));
    recalc();
  });
  planner.querySelector('[data-add-mon]')?.addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'item-row mon-row';
    row.innerHTML = `<input type="checkbox" data-mon checked><select data-mtype aria-label="Monitor type"><option value="basic">Shunt + wired display</option><option value="bt" selected>Bluetooth smart shunt</option><option value="btdisp">Bluetooth shunt + display</option></select> × <input data-mqty type="number" min="1" max="10" step="1" value="1" aria-label="Quantity"><span class="money-input">$<input data-cost type="number" min="0" max="10000" step="1" value="0"> ea</span><span class="money-input"><input data-kg type="number" min="0" max="50" step="0.1" value="0"> kg ea</span><button type="button" class="item-del" aria-label="Remove item" title="Remove">×</button>`;
    planner.querySelector('[data-mon-grid]').appendChild(row);
    recalc();
  });
  planner.querySelector('[data-add-mains]')?.addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'item-row mains-row';
    row.innerHTML = `<input type="checkbox" data-mains checked><input class="item-name" type="text" value="Plug-in source" aria-label="Power source"><span class="mains-spec">$<input data-daycost type="number" min="0" max="500" step="1" value="0" aria-label="Dollars per day">/day × <input data-days type="number" min="0" max="7" step="0.5" value="7" aria-label="Days per week"> d/wk</span><span class="money-input">$<input data-cost type="number" min="0" max="10000" step="1" value="0"> upfront</span><button type="button" class="item-del" aria-label="Remove item" title="Remove">×</button>`;
    planner.querySelector('[data-mains-grid]').appendChild(row);
    recalc();
  });
  planner.querySelector('[data-add-chg]')?.addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'item-row chg-row';
    row.innerHTML = `<input type="checkbox" data-chg checked><select data-ctype aria-label="Charger type"><option value="mppt" selected>MPPT solar controller</option><option value="dcdc">DC-DC + MPPT (alternator / bank input)</option><option value="ac2dc">AC→DC charger (240V mains)</option><option value="buck">24V→12V step-down</option><option value="inv">Inverter DC→240V AC</option></select><span class="dev-spec"><input data-crate type="number" min="0" max="5000" step="1" value="20" aria-label="Rating"> <span class="crate-unit">A</span> <span class="carrow">→</span> <select data-cvolt aria-label="Output voltage"><option value="12" selected>12V</option><option value="24">24V</option></select></span><span class="money-input">$<input data-cost type="number" min="0" max="100000" step="1" value="0"></span><span class="money-input"><input data-kg type="number" min="0" max="500" step="0.1" value="0"> kg</span><button type="button" class="item-del" aria-label="Remove item" title="Remove">×</button>`;
    planner.querySelector('[data-chg-grid]').appendChild(row);
    recalc();
  });
  planner.querySelector('[data-add-dev]')?.addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'item-row dev-row';
    row.innerHTML = `<input type="checkbox" data-dev checked><input class="item-name" type="text" value="Device" aria-label="Device"><span class="dev-spec"><input data-w type="number" min="0" max="5000" step="1" value="60" aria-label="Watts"> W × <input data-hrs type="number" min="0" max="24" step="0.5" value="2" aria-label="Hours per day"> h/day × <input data-dqty type="number" min="1" max="20" step="1" value="1" aria-label="Quantity"></span><select data-conn aria-label="Connection"><option value="dc12" selected>12V DC</option><option value="dc24">24V DC</option><option value="ac240">240V AC</option><option value="usbpd">USB-C PD</option><option value="usb">USB</option></select><span class="money-input">$<input data-cost type="number" min="0" max="100000" step="1" value="0"></span><span class="money-input"><input data-kg type="number" min="0" max="500" step="0.5" value="0"> kg</span><button type="button" class="item-del" aria-label="Remove item" title="Remove">×</button>`;
    planner.querySelector('[data-dev-grid]').appendChild(row);
    recalc();
  });
  planner.querySelector('[data-add-fit]')?.addEventListener('click', () => addItem('[data-fit-grid]', 'data-fit', 'Item (e.g. 800W solar kit)', `<span class="money-input"><input data-kg type="number" min="0" max="5000" step="0.5" value="0"> kg</span>`));
  planner.querySelector('[data-add-tech]')?.addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `<input type="checkbox" data-tech checked><input class="item-name" type="text" placeholder="Item (e.g. tablet + plan)" aria-label="Item description"><span class="dev-spec"><input data-w type="number" min="0" max="5000" step="1" value="10" aria-label="Watts"> W × <input data-hrs type="number" min="0" max="24" step="0.5" value="2" aria-label="Hours per day"> h/day × <input data-dqty type="number" min="1" max="20" step="1" value="1" aria-label="Quantity"></span><select data-conn aria-label="Connection"><option value="dc12">12V DC</option><option value="dc24">24V DC</option><option value="ac240">240V AC</option><option value="usbpd">USB-C PD</option><option value="usb" selected>USB</option></select><label class="mini-check" title="Runs continuously — active hours at rated draw, the rest of the day at idle"><input type="checkbox" data-always aria-label="Runs 24/7"> 24/7</label><span class="money-input">$<input data-cost type="number" min="0" max="1000000" step="1" value="0"></span><span class="money-input">$<input data-week type="number" min="0" max="10000" step="1" value="0"> <select data-period aria-label="Billing period"><option value="wk" selected>/wk</option><option value="mo">/mo</option></select></span><button type="button" class="item-del" aria-label="Remove item" title="Remove">×</button>`;
    planner.querySelector('[data-tech-grid]').appendChild(row);
    row.querySelector('.item-name').focus();
    recalc();
  });
  // Starlink and a phone signal booster solve the same problem — ticking one unticks the other.
  const FRIDGE_PRESETS = {
    fridge: { 40: [40, 8, 700, 18], 50: [45, 9, 800, 20], 60: [50, 10, 900, 22], 70: [55, 11, 1000, 25], 80: [60, 12, 1150, 27], 90: [65, 13, 1300, 30] },
    ff: { 40: [50, 10, 850, 20], 50: [55, 11, 950, 23], 60: [62, 12, 1100, 25], 70: [68, 13, 1250, 28], 80: [75, 14, 1400, 30], 90: [80, 15, 1550, 33] }
  };
  planner.addEventListener('change', e => {
    if (e.target.dataset?.f === 'cgCard') { const fee = field('cgFee'); if (fee) fee.value = e.target.checked ? 105 : 210; }
    if (e.target.matches?.('[data-ftype],[data-fsize]')) {
      const row = e.target.closest('.item-row');
      const p = (FRIDGE_PRESETS[row?.querySelector('[data-ftype]')?.value === 'ff' ? 'ff' : 'fridge'][row?.querySelector('[data-fsize]')?.value] || []);
      if (p.length) {
        const set = (sel, v) => { const el = row.querySelector(sel); if (el) el.value = v; };
        set('[data-w]', p[0]); set('[data-hrs]', p[1]); set('[data-cost]', p[2]); set('[data-kg]', p[3]);
      }
    }
    const cb = e.target.closest?.('[data-tech]');
    if (!cb?.checked) return;
    const name = cb.closest('.item-row')?.querySelector('.item-name')?.value || '';
    const ct = e.target.closest?.('[data-ctype]');
    if (ct) {
      const r = ct.closest('.item-row'), inv = ct.value === 'inv';
      const u = r?.querySelector('.crate-unit'); if (u) u.textContent = inv ? 'W' : 'A';
      const a = r?.querySelector('.carrow'); if (a) a.textContent = inv ? '←' : '→';
      const cv = r?.querySelector('[data-cvolt]'); if (cv) cv.setAttribute('aria-label', inv ? 'Input (bank) voltage' : 'Output voltage');
    }
    const rival = /starlink/i.test(name) ? /signal\s*booster|antenna/i : (/signal\s*booster|antenna/i.test(name) ? /starlink/i : null);
    if (rival) planner.querySelectorAll('[data-tech]').forEach(o => {
      if (o !== cb && o.checked && rival.test(o.closest('.item-row')?.querySelector('.item-name')?.value || '')) o.checked = false;
    });
  });
  planner.addEventListener('click', e => {
    const del = e.target.closest('.item-del');
    if (del && planner.contains(del)) { del.closest('.item-row').remove(); recalc(); }
  });

  planner.querySelectorAll('input[name="setup-type"]').forEach(r => r.addEventListener('change', () => { applyPreset(r.value); recalc(); }));
  planner.addEventListener('input', event => {
    if (event.target.matches('.item-name')) labelPlannerRow(event.target.closest('.item-row'));
    recalc();
  });
  planner.addEventListener('change', recalc);
  recalc();

  // Itinerary + solar exposure — shared SunMap module (assets/sunmap.js, BOM AWAP grid)
  const sunMapEl = planner.querySelector('[data-setup-map]');
  if (sunMapEl && window.SunMap) {
    const SM = window.SunMap;
    const barsEl = planner.querySelector('[data-month-bars]');
    const sunNote = planner.querySelector('[data-sun-note]');
    let grid = null, tgrid = null, maxgrid = null, map = null, markers = null, routeLine = null;

    const stopRows = () => [...planner.querySelectorAll('[data-stop-grid] .item-row')];
    const stopAt = row => ({ lat: parseFloat(row.querySelector('[data-slat]')?.value), lon: parseFloat(row.querySelector('[data-slon]')?.value) });

    const stopRowHtml = (n, p = {}) => {
      const row = document.createElement('div');
      row.className = 'item-row stop-row';
      row.innerHTML = `<span class="stop-num">${n}</span><input class="item-name" type="text" value="${p.name || 'New stop'}" aria-label="Stop name"><span class="stop-spec"><select data-smonth aria-label="Arrival month">${SM.MNAME.map((m, i) => `<option value="${i}"${i === (p.month ?? 0) ? ' selected' : ''}>${m}</option>`).join('')}</select> · <input data-sdays type="number" min="1" max="365" step="1" value="${p.days ?? 14}" aria-label="Days staying"> days · next leg <input data-skm type="number" min="0" max="5000" step="10" value="${p.km ?? 0}" aria-label="km to next stop"> km @ $<input data-sfuel type="number" min="0" max="5" step="0.01" value="${p.price ?? 1.95}" aria-label="Fuel dollars per litre">/L · <select data-spower aria-label="Site type"><option value="unpowered"${p.power === 'powered' ? '' : ' selected'}>Unpowered</option><option value="powered"${p.power === 'powered' ? ' selected' : ''}>Powered</option></select> site ~$<input data-sfee type="number" min="0" max="500" step="1" value="${p.fee ?? 0}" aria-label="Cost per night" style="width:44px">/night</span><button type="button" class="stop-locate" title="Set on map">pin</button><input type="hidden" data-slat value="${p.lat ?? ''}"><input type="hidden" data-slon value="${p.lon ?? ''}"><button type="button" class="item-del" aria-label="Remove stop" title="Remove">×</button>`;
      return row;
    };

    const redrawMap = () => {
      if (!markers) return;
      markers.clearLayers();
      const pts = [];
      stopRows().forEach((row, i) => {
        const { lat, lon } = stopAt(row);
        const num = row.querySelector('.stop-num');
        if (num) num.textContent = i + 1;
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
        pts.push([lat, lon]);
        L.marker([lat, lon], { icon: SM.pinIcon(i + 1) }).addTo(markers);
      });
      if (routeLine) { map.removeLayer(routeLine); routeLine = null; }
      if (pts.length > 1) routeLine = L.polyline(pts, { color: '#2d6a4f', weight: 2, dashArray: '6 6' }).addTo(map);
    };

    refreshItinerary = (verdicts, powerLines, solarW, dailyWh, l100, heaterWh = 0, coolWh = 0) => {
      redrawMap();
      const fuelType = field('fuelType')?.value || 'diesel';
      const rows = stopRows();
      const heatLph = num('heaterLph'), heatHrs = num('heaterHrs'), heatBelow = num('heatBelow'), coolAbove = num('coolAbove') || 30;
      const heaterOn = heaterWh > 0, coolingOn = coolWh > 0;
      let totalKm = 0, totalL = 0, totalFuel = 0, worstStop = null, heatL = 0, heatFuel = 0, coldNoHeater = null, hotNoCooler = null;
      let totalNights = 0, stayCost = 0, poweredNights = 0;
      rows.forEach((row, i) => {
        const { lat, lon } = stopAt(row);
        const name = row.querySelector('.item-name')?.value || `Stop ${i + 1}`;
        const month = Number(row.querySelector('[data-smonth]')?.value) || 0;
        const days = Number(row.querySelector('[data-sdays]')?.value) || 0;
        const km = Number(row.querySelector('[data-skm]')?.value) || 0;
        const pl = Number(row.querySelector('[data-sfuel]')?.value) || 0;
        const powered = row.querySelector('[data-spower]')?.value === 'powered';
        const fee = Number(row.querySelector('[data-sfee]')?.value) || 0;
        totalNights += days; stayCost += days * fee; if (powered) poweredNights += days;
        let legKm = km, est = false;
        const next = rows[i + 1] ? stopAt(rows[i + 1]) : null;
        if (!legKm && next && Number.isFinite(lat) && Number.isFinite(next.lat)) { legKm = Math.round(SM.haversineKm({ lat, lon }, next) * 1.35); est = true; }
        if (legKm > 0) { totalKm += legKm; const l = legKm / 100 * l100; totalL += l; totalFuel += l * pl; }
        if (Number.isFinite(lat) && grid) {
          const months = SM.sample(grid, lat, lon);
          if (months) {
            const span = Math.max(1, Math.min(12, Math.ceil(days / 30.4)));
            const worstMj = Math.min(...Array.from({ length: span }, (_, k) => months[(month + k) % 12]));
            const pshW = worstMj / 3.6;
            const gen = solarW * pshW / 1000;
            const leg = legKm > 0 ? ` · next leg ~${Math.round(legKm)}${est ? '~' : ''} km` : '';
            let heatTxt = '', coldStop = false, hotStop = false;
            const mx = maxgrid ? SM.sample(maxgrid, lat, lon) : null;
            if (mx) {
              const maxs = Array.from({ length: span }, (_, k) => mx[(month + k) % 12]).filter(v => v >= 0);
              if (maxs.length) {
                const hi = Math.max(...maxs);
                hotStop = maxs.some(v => v > coolAbove);
                heatTxt = ` · days avg-max ~${hi.toFixed(0)}°C`;
                if (hotStop && !coolingOn && !hotNoCooler) hotNoCooler = `${name} (${SM.MNAME[(month + maxs.indexOf(hi)) % 12]}, ~${hi.toFixed(0)}°C)`;
              }
            }
            const tm = tgrid ? SM.sample(tgrid, lat, lon) : null;
            if (tm) {
              const mins = Array.from({ length: span }, (_, k) => tm[(month + k) % 12]).filter(v => v >= 0);
              if (mins.length) {
                const lo = Math.min(...mins);
                const coldMo = mins.filter(v => v < heatBelow).length;
                coldStop = coldMo > 0;
                heatTxt = ` · nights avg-min ~${lo.toFixed(0)}°C` + heatTxt;
                if (coldMo > 0) {
                  const nights = Math.round(days * coldMo / mins.length);
                  if (heaterOn && heatLph > 0 && heatHrs > 0) {
                    const l = nights * heatHrs * heatLph;
                    heatL += l; heatFuel += l * pl;
                    heatTxt += ` → heater ~${nights} nights ≈ ${Math.round(l)} L diesel ($${Math.round(l * pl).toLocaleString('en-AU')})`;
                  } else if (!heaterOn && !coldNoHeater) coldNoHeater = `${name} (${SM.MNAME[(month + span - 1) % 12]}, ~${lo.toFixed(0)}°C)`;
                }
              }
            }
            const siteTxt = ` · ${powered ? 'powered' : 'unpowered'}${fee > 0 ? ` ~$${fee}/n` : ''}`;
            const useHere = dailyWh + (coldStop ? heaterWh : 0) + (hotStop ? coolWh : 0);
            const useTag = [coldStop && heaterWh > 0 ? 'heater' : '', hotStop && coolWh > 0 ? 'cooling' : ''].filter(Boolean).join(' + ');
            powerLines.push(`Stop ${i + 1} — ${name}: ${SM.MNAME[month]}${span > 1 ? '–' + SM.MNAME[(month + span - 1) % 12] : ''}, ${days}d — worst-month sun ~${pshW.toFixed(1)} PSH → ~${gen.toFixed(1)} kWh/day${useHere > 0 ? ` vs ${(useHere / 1000).toFixed(1)} used${useTag ? ` (incl. ${useTag})` : ''}` : ''}${powered ? ' (mains covers the gap)' : ''}${siteTxt}${leg}${heatTxt}.`);
            if (solarW > 0 && useHere > 0 && gen < useHere / 1000 && !worstStop && !powered) worstStop = `${name} (${SM.MNAME[(month + span - 1) % 12]})`;
          }
        } else if (name) {
          powerLines.push(`Stop ${i + 1} — ${name}: ${SM.MNAME[month]}, ${days}d · ${powered ? 'powered' : 'unpowered'}${fee > 0 ? ` ~$${fee}/n` : ''} — click the map to set its location for solar data.`);
        }
      });
      if (totalKm > 0) powerLines.push(`Route ≈ ${Math.round(totalKm).toLocaleString('en-AU')} km → ~${Math.round(totalL).toLocaleString('en-AU')} L ${fuelType} ≈ $${Math.round(totalFuel).toLocaleString('en-AU')} at the pump prices entered (per-leg prices editable).${num('fuelUrb') > 0 ? ` Local driving around stops uses ~${num('fuelUrb')} L/100km urban.` : ''}`);
      heaterWk = totalNights > 0 ? heatFuel / totalNights * 7 : 0;
      if (heatL > 0) powerLines.push(`Heating: ~${Math.round(heatL)} L diesel ≈ $${Math.round(heatFuel).toLocaleString('en-AU')} across the cold nights in this itinerary (at each leg's pump price) — ~$${heaterWk.toFixed(0)}/wk averaged over the trip, added to the weekly budget below. On top of the drive fuel above.`);
      if (totalNights > 0) powerLines.push(`Stays: ${totalNights} nights total${poweredNights > 0 ? ` (${poweredNights} powered)` : ''}${stayCost > 0 ? ` ≈ $${Math.round(stayCost).toLocaleString('en-AU')} site fees — ~$${(stayCost / totalNights).toFixed(0)}/night averaged` : ' — all unpowered/free as entered'}. Powered stops recharge the bank via an AC→DC charger; mix in extra stops for places in the same region.`);
        if (heaterOn && ![...planner.querySelectorAll('[data-fit]')].some(cb => cb.checked && /jerry/i.test(cb.closest('.item-row')?.querySelector('.item-name')?.value || ''))) verdicts.push(verdict('warn', `Diesel heater ticked but no jerry can listed — the heater needs fuel carriage; add a diesel jerry can in the fit-out list.`));
      if (coldNoHeater) verdicts.push(verdict('warn', `Cold nights: ${coldNoHeater} averages below ${heatBelow}°C minimum — tick a diesel heater in the energy list or plan warmer stops.`));
      if (hotNoCooler) verdicts.push(verdict('warn', `Hot days: ${hotNoCooler} averages above ${coolAbove}°C maximum — list cooling in the energy list (an evaporative cooler is the low-power option; air-con needs serious inverter + solar) or plan cooler stops.`));
      if (worstStop) verdicts.push(verdict('warn', `Seasonal check: at ${worstStop} the array won't cover daily use — plan plug-in days, more panels, or shorter stays.`));
    };

    const applySun = months => {
      const psh = SM.toPsh(months);
      const s = field('pshSummer'), w = field('pshWinter');
      if (s) s.value = ((psh[11] + psh[0] + psh[1]) / 3).toFixed(1);
      if (w) w.value = ((psh[5] + psh[6] + psh[7]) / 3).toFixed(1);
      SM.renderBars(barsEl, psh);
    };

    try {
      SM.loadGrid().then(g => { grid = g; if (g) { const m0 = SM.sample(g, -35.28, 149.13); if (m0) applySun(m0); } recalc(); });
      SM.loadTempGrid().then(g => { tgrid = g; recalc(); });
      SM.loadTmaxGrid?.().then(g => { maxgrid = g; recalc(); });
    } catch {}

    const pickStop = async latlng => {
      let row = stopRows().find(r => !Number.isFinite(parseFloat(r.querySelector('[data-slat]')?.value)));
      if (!row) {
        row = stopRowHtml(stopRows().length + 1);
        planner.querySelector('[data-stop-grid]').appendChild(row);
      }
      row.querySelector('[data-slat]').value = latlng.lat.toFixed(3);
      row.querySelector('[data-slon]').value = latlng.lng.toFixed(3);
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json&zoom=8`);
        if (r.ok) { const j = await r.json(); const nm = j.display_name?.split(',').slice(0, 2).join(','); if (nm) row.querySelector('.item-name').value = nm; }
      } catch {}
      const months = SM.sample(grid, latlng.lat, latlng.lng);
      if (months) applySun(months);
      else if (sunNote) sunNote.textContent = 'Outside BOM grid coverage—click a land point within Australia.';
      recalc();
    };

    const bootMap = () => {
      map = SM.createMap(sunMapEl, { center: [-35.28, 149.13], zoom: 5 });
      if (!map) { if (sunNote) sunNote.textContent += ' (Map library unavailable—fields still editable.)'; return; }
      markers = L.layerGroup().addTo(map);
      map.on('click', e => pickStop(e.latlng));
      redrawMap();
    };
    if (document.readyState === 'complete') bootMap();
    else window.addEventListener('load', bootMap);

    planner.querySelector('[data-add-stop]')?.addEventListener('click', () => {
      const row = stopRowHtml(stopRows().length + 1);
      planner.querySelector('[data-stop-grid]').appendChild(row);
      row.querySelector('.item-name').focus();
      recalc();
    });
    planner.addEventListener('click', e => {
      const loc = e.target.closest('.stop-locate');
      if (loc && planner.contains(loc)) {
        const row = loc.closest('.item-row');
        row.querySelector('[data-slat]').value = '';
        row.querySelector('[data-slon]').value = '';
        if (sunNote) sunNote.textContent = 'Now click the map to pin that stop.';
      }
    });
  }

}
