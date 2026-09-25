const dashboard = document.querySelector('[data-evidence-dashboard]');

if (dashboard) {
  const number = new Intl.NumberFormat('en-AU');
  const score = new Intl.NumberFormat('en-AU', { maximumFractionDigits: 0 });
  const escape = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

  const renderArea = (area, data) => {
    const population = area.population === undefined ? 'Not reported' : number.format(area.population);
    dashboard.querySelector('[data-evidence-area]').innerHTML = `
      <div class="evidence-area-head"><div><p class="label">Selected local government area</p><h3>${escape(area.name)}</h3><p>${escape(area.geographyVersion)} · ${escape(area.referencePeriod)}</p></div><div class="evidence-pop"><span>Usual resident population</span><strong>${population}</strong></div></div>
      <div class="evidence-metrics">
        <div><span>Relative disadvantage</span><strong>${score.format(area.irsd)}</strong><small>SEIFA IRSD</small></div>
        <div><span>Relative advantage &amp; disadvantage</span><strong>${score.format(area.irsad)}</strong><small>SEIFA IRSAD</small></div>
        <div><span>Economic resources</span><strong>${score.format(area.ier)}</strong><small>SEIFA IER</small></div>
        <div><span>Education &amp; occupation</span><strong>${score.format(area.ieo)}</strong><small>SEIFA IEO</small></div>
      </div>
      <p class="evidence-context"><strong>How to read this:</strong> these are area-level context indicators, not a judgement about residents. They help a town start a grounded conversation alongside local knowledge, service capacity and lived experience. ${escape(data.seifa.limitation)}</p>`;
  };

  const render = data => {
    const families = data.q42.sourceFamilies.map(item => `<li>${escape(item.title)}</li>`).join('');
    dashboard.innerHTML = `
      <div class="evidence-kpis" aria-label="Evidence preparation summary">
        <div><strong>${number.format(data.q42.releaseCount)}</strong><span>public source releases prepared</span></div>
        <div><strong>${number.format(data.q42.fullVerificationPasses)}</strong><span>release packages fully checked</span></div>
        <div><strong>${number.format(data.seifa.areas.length)}</strong><span>local government areas ready to explore</span></div>
      </div>
      <div class="evidence-picker"><label for="evidence-area-select">Choose a local government area</label><select id="evidence-area-select" data-evidence-select>${data.seifa.areas.map(area => `<option value="${escape(area.id)}">${escape(area.name)}</option>`).join('')}</select><p>Showing the ABS SEIFA 2021 context data already prepared for the planning environment.</p></div>
      <div data-evidence-area></div>
      <details class="evidence-sources"><summary>See the public information now prepared for planning</summary><p>These release packages are checked and kept review-gated. They support questions about housing, homelessness services, work, education, tourism, business, retirement and safety; they are not profiles of individual people.</p><ul>${families}</ul><p><a href="${escape(data.seifa.sourceUrl)}">ABS SEIFA source and definitions ↗</a></p></details>`;
    const select = dashboard.querySelector('[data-evidence-select]');
    const preferred = data.seifa.areas.find(area => area.name === 'Albury') ?? data.seifa.areas[0];
    select.value = preferred.id;
    const update = () => renderArea(data.seifa.areas.find(area => area.id === select.value) ?? preferred, data);
    select.addEventListener('change', update);
    update();
  };

  dashboard.innerHTML = '<p class="small">Loading prepared public evidence…</p>';
  fetch('assets/evidence-dashboard.json')
    .then(response => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`)))
    .then(render)
    .catch(() => { dashboard.innerHTML = '<div class="note"><p>The evidence view could not load. The planning tools remain available; refresh once the local data bundle is present.</p></div>'; });
}
