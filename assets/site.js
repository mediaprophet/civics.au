// Responsive nav hamburger toggle
const navToggle = document.querySelector('.nav-toggle');
if (navToggle) {
  const nav = navToggle.closest('.nav');
  navToggle.addEventListener('click', () => {
    const open = nav.getAttribute('aria-expanded') === 'true';
    nav.setAttribute('aria-expanded', String(!open));
    navToggle.setAttribute('aria-expanded', String(!open));
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

// Cooperative Stepper
const stepper = document.querySelector('[data-coop-stepper]');
if (stepper) {
  const buttons = [...stepper.querySelectorAll('[data-step-btn]')];
  const panels = [...stepper.querySelectorAll('[data-step-panel]')];
  buttons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.setAttribute('aria-selected', 'false'));
      panels.forEach(p => { p.style.display = 'none'; });
      btn.setAttribute('aria-selected', 'true');
      if (panels[index]) {
        panels[index].style.display = 'block';
      }
    });
  });
}

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


