/* GTA VI Trophy Guide & Tracker — checklist, filters, roadmap, source matrix.
   Progress is stored in localStorage on this device only. No network calls. */
(function () {
  'use strict';

  var STORAGE_KEY = 'gta6-trophy-guide-01-v1';
  var DATA_URL = 'data/trophies.json';

  var STAGES = [
    { n: 1, title: 'Story playthrough', text: 'Chapters 1–4, the named story missions and the final mission. Play in order; the chapter and mission trophies unlock on their own. Check the missable watchlist before the finale.' },
    { n: 2, title: 'Side missions & strangers', text: 'Andy, Kenton, Billy, Randy, Tyrone and Bret, plus three more stranger strands to reach eight. Strands unlock in order — if one stalls, play more story.' },
    { n: 3, title: 'Collectibles & exploration', text: 'Card sets, WAiNK It locations, meditation spots, vehicle discoveries and every area of Leonida. One thorough road trip covers several trophies at once.' },
    { n: 4, title: 'Activities & challenges', text: 'Shooting Range golds, drone races, 20 different race wins, fishing vs Cal, the arcade, bowling, 250 stunts and 50 challenges. Sample activities as you travel; grind them now.' },
    { n: 5, title: 'Combat & crime', text: 'Combat Focus, the VCIA departure, the Rhino, the jewelry store, bank vaults, the armored truck and a gang operation for each gang. Do the two partner trophies here while the story still has you together.' },
    { n: 6, title: 'Economy, 100% & platinum', text: 'Launder $250,000 of Marked Bills, spend $100,000 in shops, buy every garage, register 10 vehicles — then check the in-game completion tracker and close out 100%. Platinum pops with the last trophy.' }
  ];

  var state = { trophies: [], earned: {}, spoiler: false };
  var params = new URLSearchParams(location.search);

  var $ = function (id) { return document.getElementById(id); };
  var listEl = $('trophyList'), stagesEl = $('stages'), watchEl = $('watchlistItems'),
      matrixEl = $('matrixBody'), emptyEl = $('emptyMsg'), shownEl = $('shownCount');

  function loadEarned() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return {};
      var out = {};
      Object.keys(parsed).forEach(function (k) { if (parsed[k]) out[Number(k)] = true; });
      return out;
    } catch (e) { return {}; }
  }
  function saveEarned() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.earned)); } catch (e) { /* storage full or blocked */ }
  }

  function gradeLabel(g) { return g.charAt(0).toUpperCase() + g.slice(1); }
  function kindLabel(k) {
    return { story: 'Story', side: 'Side mission', collectible: 'Collectible', activity: 'Activity', combat: 'Combat & crime', exploration: 'Exploration', economy: 'Economy' }[k] || k;
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function isHidden(t) { return state.spoiler && t.hidden && !state.earned[t.id]; }

  function trophyCard(t) {
    var li = document.createElement('li');
    li.className = 'trophy' + (state.earned[t.id] ? ' earned' : '');
    li.dataset.id = String(t.id);
    var hidden = isHidden(t);
    var nameHtml = hidden ? '<span class="spoiler">Hidden trophy — earn it to reveal</span>' : esc(t.name);
    var descHtml = hidden ? '<p class="desc">A story trophy. Its name and description stay hidden until you earn it.</p>'
      : '<p class="desc">' + esc(t.description) + '</p>';
    var countTag = t.count !== null && t.count !== undefined
      ? '<span class="tag count">' + (t.count >= 1000 ? '$' + t.count.toLocaleString('en-US') : t.count) + ' to go</span>' : '';
    var missTag = t.missable ? '<span class="tag missable">MISSABLE — do it when the chance appears</span>' : '';
    li.innerHTML =
      '<div class="top"><input type="checkbox" aria-label="Earned: ' + esc(t.name) + '"' + (state.earned[t.id] ? ' checked' : '') + '>' +
      '<span class="name">' + nameHtml + '</span>' +
      '<span class="grade ' + t.grade + '">' + gradeLabel(t.grade) + '</span></div>' +
      descHtml +
      '<div class="tags"><span class="tag">' + kindLabel(t.kind) + '</span><span class="tag">Stage ' + t.stage + '</span>' + countTag + missTag + '</div>' +
      (hidden ? '' :
        '<details><summary>Guide &amp; source</summary><p class="guide">' + esc(t.guide) + '</p>' +
        '<p class="source"><strong>Source:</strong> ' + esc(t.source) + '</p></details>') +
      (state.earned[t.id] ? '<p class="earned-note">Earned ✓</p>' : '');
    var box = li.querySelector('input[type="checkbox"]');
    box.addEventListener('change', function () {
      if (box.checked) state.earned[t.id] = true; else delete state.earned[t.id];
      saveEarned();
      render();
    });
    return li;
  }

  function matches(t) {
    var q = $('search').value.trim().toLowerCase();
    if ($('gradeFilter').value !== 'all' && t.grade !== $('gradeFilter').value) return false;
    if ($('kindFilter').value !== 'all' && t.kind !== $('kindFilter').value) return false;
    if ($('missableOnly').checked && !t.missable) return false;
    if ($('hideEarned').checked && state.earned[t.id]) return false;
    if (q) {
      var hay = (t.name + ' ' + t.description + ' ' + t.guide + ' ' + t.source).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }

  function renderProgress() {
    var total = state.trophies.length;
    var earned = state.trophies.filter(function (t) { return state.earned[t.id]; }).length;
    var pct = total ? Math.round(earned / total * 100) : 0;
    $('earnedCount').textContent = String(earned);
    $('progressPct').textContent = pct + '%';
    $('progressFill').style.width = pct + '%';
    var grades = ['platinum', 'gold', 'silver', 'bronze'];
    $('gradeCounts').textContent = grades.map(function (g) {
      var gt = state.trophies.filter(function (t) { return t.grade === g; });
      var ge = gt.filter(function (t) { return state.earned[t.id]; }).length;
      return gradeLabel(g) + ' ' + ge + '/' + gt.length;
    }).join(' · ');
    STAGES.forEach(function (s) {
      var st = state.trophies.filter(function (t) { return t.stage === s.n; });
      var se = st.filter(function (t) { return state.earned[t.id]; }).length;
      var bar = document.querySelector('.stage[data-stage="' + s.n + '"] .stage-fill');
      var meta = document.querySelector('.stage[data-stage="' + s.n + '"] .stage-meta');
      if (bar) bar.style.width = (st.length ? se / st.length * 100 : 0) + '%';
      if (meta) meta.textContent = se + ' of ' + st.length + ' trophies earned';
    });
  }

  function renderRoadmap() {
    stagesEl.innerHTML = '';
    STAGES.forEach(function (s) {
      var li = document.createElement('li');
      li.className = 'stage';
      li.dataset.stage = String(s.n);
      var st = state.trophies.filter(function (t) { return t.stage === s.n; });
      var se = st.filter(function (t) { return state.earned[t.id]; }).length;
      li.innerHTML = '<h3>' + esc(s.title) + '</h3><p>' + esc(s.text) + '</p>' +
        '<p class="stage-meta">' + se + ' of ' + st.length + ' trophies earned</p>' +
        '<div class="stage-bar"><div class="stage-fill" style="width:' + (st.length ? se / st.length * 100 : 0) + '%"></div></div>';
      stagesEl.appendChild(li);
    });
    watchEl.innerHTML = '';
    state.trophies.filter(function (t) { return t.missable; }).forEach(function (t) {
      var li = document.createElement('li');
      var label = (state.spoiler && t.hidden) ? 'Hidden trophy (name withheld until earned)' : '<strong>' + esc(t.name) + '</strong> — ' + esc(t.description);
      li.innerHTML = label + ' <span class="tag missable">Stage ' + t.stage + '</span>';
      watchEl.appendChild(li);
    });
  }

  function renderMatrix(data) {
    matrixEl.innerHTML = '';
    (data.sources || []).forEach(function (s) {
      var n = state.trophies.filter(function (t) { return t.source.indexOf(s.name) !== -1; }).length;
      if (s.covers.indexOf('All 55 official') === 0) n = state.trophies.length;
      var tr = document.createElement('tr');
      tr.innerHTML = '<td><strong>' + esc(s.name) + '</strong></td><td>' + esc(s.covers) + '</td><td>' + n + ' of 55</td>';
      matrixEl.appendChild(tr);
    });
  }

  function render() {
    var shown = state.trophies.filter(matches);
    listEl.innerHTML = '';
    shown.forEach(function (t) { listEl.appendChild(trophyCard(t)); });
    emptyEl.hidden = shown.length !== 0;
    shownEl.textContent = '(' + shown.length + ' of ' + state.trophies.length + ' shown)';
    renderProgress();
  }

  function applyDemo() {
    // ?demo=1 pre-ticks a realistic spread so the cover screenshot shows progress, filters and an open guide.
    if (params.get('demo') !== '1') return;
    [2, 3, 4, 5, 8, 9, 10, 15, 16, 21, 28, 35, 42, 44, 46, 51].forEach(function (id) { state.earned[id] = true; });
  }
  function applyParams() {
    if (params.get('spoiler') === 'on') { state.spoiler = true; $('spoilerToggle').checked = true; }
    if (params.get('grade')) $('gradeFilter').value = params.get('grade');
    if (params.get('kind')) $('kindFilter').value = params.get('kind');
    if (params.get('missable') === '1') $('missableOnly').checked = true;
    if (params.get('view') === 'roadmap') setTimeout(function () { $('roadmap').scrollIntoView(); }, 50);
    if (params.get('view') === 'sources') setTimeout(function () { $('sources').scrollIntoView(); }, 50);
  }
  function openGuide(id) {
    var card = listEl.querySelector('.trophy[data-id="' + id + '"] details');
    if (card) { card.open = true; card.scrollIntoView({ block: 'center' }); }
  }

  fetch(DATA_URL).then(function (r) { return r.json(); }).then(function (data) {
    state.trophies = data.trophies.slice().sort(function (a, b) { return a.id - b.id; });
    state.earned = loadEarned();
    applyDemo();
    applyParams();
    renderRoadmap();
    renderMatrix(data);
    render();
    if (params.get('open')) setTimeout(function () { openGuide(params.get('open')); }, 80);
  }).catch(function () {
    listEl.innerHTML = '<li class="trophy"><p class="desc">Could not load the trophy data. Check that data/trophies.json is present.</p></li>';
  });

  ['search', 'gradeFilter', 'kindFilter', 'missableOnly', 'hideEarned'].forEach(function (id) {
    $(id).addEventListener('input', render);
    $(id).addEventListener('change', render);
  });
  $('spoilerToggle').addEventListener('change', function () {
    state.spoiler = $('spoilerToggle').checked;
    renderRoadmap();
    render();
  });
  $('exportBtn').addEventListener('click', function () {
    var blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: Object.keys(state.earned).map(Number).sort(function (a, b) { return a - b; }), exported: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gta6-trophies-progress.json';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });
  $('importBtn').addEventListener('click', function () { $('importFile').click(); });
  $('importFile').addEventListener('change', function () {
    var file = $('importFile').files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var parsed = JSON.parse(String(reader.result));
        var ids = Array.isArray(parsed) ? parsed : parsed.earned;
        if (!Array.isArray(ids)) throw new Error('no earned list');
        var next = {};
        ids.forEach(function (id) { if (typeof id === 'number' && id >= 1 && id <= 55) next[id] = true; });
        state.earned = next;
        saveEarned();
        render();
      } catch (e) { alert('That file is not a valid progress export.'); }
      $('importFile').value = '';
    };
    reader.readAsText(file);
  });
  $('resetBtn').addEventListener('click', function () {
    if (confirm('Clear all earned trophies?')) { state.earned = {}; saveEarned(); render(); }
  });
})();
