// Leonida Trophy Guide — checklist, roadmap, filters and spoiler mode.
// All data comes from app/data/trophies.json (official names, descriptions,
// grades, plus original guides with cited sources). Progress lives in
// localStorage only; export/import move it as a JSON file.

const DATA_URL = 'data/trophies.json';
const STORAGE_KEY = 'gta6-trophy-guide-v1';
const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
const KIND_LABELS = {
  story: 'Story', collectible: 'Collectible', activity: 'Activity',
  crime: 'Crime', exploration: 'Exploration', money: 'Money', misc: 'Misc',
};

const state = {
  trophies: [],
  sources: {},
  roadmap: [],
  earned: new Set(),
  filter: 'all',
  query: '',
  sort: 'grade',
  spoilers: false,
  view: 'list',
  openId: null,
};

const $ = (id) => document.getElementById(id);

function loadStoredEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed.earned) ? parsed.earned : []);
  } catch {
    return new Set();
  }
}

function saveEarned() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ earned: [...state.earned] }));
}

function readHashState() {
  const hash = new URLSearchParams(location.hash.slice(1));
  if (hash.get('view') === 'roadmap' || hash.get('view') === 'missables') state.view = hash.get('view');
  if (['all', 'story', 'missable', 'collectible', 'activity', 'online'].includes(hash.get('filter'))) state.filter = hash.get('filter');
  if (hash.get('spoilers') === 'on') state.spoilers = true;
  if (['grade', 'name', 'stage'].includes(hash.get('sort'))) state.sort = hash.get('sort');
  if (hash.get('open')) state.openId = hash.get('open');
  const earned = hash.get('earned');
  if (earned) for (const id of earned.split(',')) if (id) state.earned.add(id);
}

function isStoryHidden(trophy) {
  return state.spoilers && trophy.hidden && trophy.kind === 'story' && !state.earned.has(trophy.id);
}

function visibleTrophies() {
  let list = state.trophies;
  if (state.filter === 'online') return [];
  if (state.filter === 'missable') list = list.filter((t) => t.missable);
  else if (state.filter !== 'all') list = list.filter((t) => t.kind === state.filter);
  if (state.query) {
    const q = state.query.toLowerCase();
    list = list.filter((t) => (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q));
  }
  const sorted = [...list];
  if (state.sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
  else if (state.sort === 'stage') sorted.sort((a, b) => a.stage - b.stage || GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade]);
  else sorted.sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || a.name.localeCompare(b.name));
  return sorted;
}

function gradeBadge(trophy) {
  return `<span class="grade grade-${trophy.grade}">${trophy.grade}</span>`;
}

function sourceLinks(trophy) {
  const links = (trophy.sources || []).map((key) => {
    const src = state.sources[key];
    if (!src) return key;
    return `<a href="${src.url}" target="_blank" rel="noopener">${src.name}</a>`;
  });
  return links.length ? `Sources: ${links.join(' · ')}` : '';
}

function trophyCard(trophy) {
  const earned = state.earned.has(trophy.id);
  const hidden = isStoryHidden(trophy);
  const li = document.createElement('li');
  li.className = 'trophy' + (earned ? ' is-earned' : '');
  li.id = 'trophy-' + trophy.id;
  const nameHtml = hidden ? '<span class="spoiler-hidden">Hidden story trophy — earn it to reveal</span>' : escapeHtml(trophy.name);
  const descHtml = hidden ? '' : `<p class="trophy-desc">“${escapeHtml(trophy.description)}”</p>`;
  const guideHtml = hidden
    ? '<div class="trophy-guide"><h3>Guide</h3><p class="spoiler-hidden">Hidden until earned — turn spoiler mode off to read it, or earn this trophy in the game.</p></div>'
    : `<div class="trophy-guide"><h3>Guide</h3><p>${escapeHtml(trophy.guide)}</p></div>`;
  const countTag = trophy.count ? `<span class="tag">${formatCount(trophy.count)} needed</span>` : '';
  li.innerHTML = `
    <div class="trophy-head">
      <input class="trophy-check" type="checkbox" ${earned ? 'checked' : ''} aria-label="Mark ${escapeHtml(trophy.name)} as earned">
      <h3 class="trophy-title">${nameHtml}${hidden ? '' : gradeBadge(trophy)}</h3>
    </div>
    ${descHtml}
    <div class="trophy-tags">
      <span class="tag">${KIND_LABELS[trophy.kind] || trophy.kind}</span>
      <span class="tag">Roadmap stage ${trophy.stage}</span>
      ${trophy.hidden ? '<span class="tag tag-hidden">Hidden on PS5</span>' : ''}
      ${trophy.missable ? '<span class="tag tag-missable">Missable — do it before the finale</span>' : ''}
      ${countTag}
    </div>
    ${guideHtml}
    ${hidden ? '' : `<p class="trophy-sources">${sourceLinks(trophy)}</p>`}`;
  li.querySelector('.trophy-check').addEventListener('change', (event) => {
    if (event.target.checked) state.earned.add(trophy.id);
    else state.earned.delete(trophy.id);
    saveEarned();
    renderAll();
  });
  return li;
}

function formatCount(count) {
  return count >= 1000 ? '$' + count.toLocaleString('en-US') : String(count);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderList() {
  const list = $('trophyList');
  list.innerHTML = '';
  const shown = visibleTrophies();
  for (const trophy of shown) list.appendChild(trophyCard(trophy));
  const empty = $('emptyNote');
  if (state.filter === 'online') {
    empty.hidden = false;
    empty.textContent = 'No online trophies — all 55 trophies are single-player and can be earned offline. Nothing to do here.';
  } else if (shown.length === 0) {
    empty.hidden = false;
    empty.textContent = 'No trophies match this filter and search. Try clearing the search or picking another filter.';
  } else {
    empty.hidden = true;
  }
  $('countLine').textContent = `Showing ${shown.length} of ${state.trophies.length} trophies · ${state.earned.size} earned`;
}

function renderMissables() {
  const list = $('missableList');
  list.innerHTML = '';
  for (const trophy of state.trophies.filter((t) => t.missable)) list.appendChild(trophyCard(trophy));
}

function renderRoadmap() {
  const list = $('roadmapList');
  list.innerHTML = '';
  for (const step of state.roadmap) {
    const names = state.trophies
      .filter((t) => t.stage === step.stage)
      .map((t) => t.name)
      .join(', ');
    const li = document.createElement('li');
    li.innerHTML = `<h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.text)}</p><p class="stage-trophies">Trophies: ${escapeHtml(names)}</p>`;
    list.appendChild(li);
  }
}

function updateProgress() {
  const total = state.trophies.length;
  const done = state.earned.size;
  const pct = total ? Math.round((done / total) * 100) : 0;
  $('progressFill').style.width = pct + '%';
  $('progressText').textContent = `${done} of ${total} trophies earned — ${pct}% toward the platinum`;
  const byGrade = {};
  for (const t of state.trophies) {
    byGrade[t.grade] = byGrade[t.grade] || { done: 0, total: 0 };
    byGrade[t.grade].total += 1;
    if (state.earned.has(t.id)) byGrade[t.grade].done += 1;
  }
  $('progressGrades').textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${g}: ${byGrade[g].done}/${byGrade[g].total}`)
    .join(' · ');
}

function setView(view) {
  state.view = view;
  document.querySelectorAll('.view-btn').forEach((btn) => btn.classList.toggle('is-active', btn.dataset.view === view));
  $('view-list').hidden = view !== 'list';
  $('view-roadmap').hidden = view !== 'roadmap';
  $('view-missables').hidden = view !== 'missables';
}

function renderAll() {
  renderList();
  renderMissables();
  renderRoadmap();
  updateProgress();
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...state.earned] }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(url);
  $('actionNote').textContent = 'Progress exported.';
}

function importProgressFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const ids = Array.isArray(parsed.earned) ? parsed.earned : [];
      const known = new Set(state.trophies.map((t) => t.id));
      state.earned = new Set(ids.filter((id) => known.has(id)));
      saveEarned();
      renderAll();
      $('actionNote').textContent = `Imported ${state.earned.size} earned trophies.`;
    } catch {
      $('actionNote').textContent = 'That file could not be read as a progress export.';
    }
  };
  reader.readAsText(file);
}

function copyProgressLink() {
  const url = `${location.origin}${location.pathname}#earned=${[...state.earned].join(',')}`;
  const done = () => { $('actionNote').textContent = 'Progress link copied.'; };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, done);
  else $('actionNote').textContent = url;
}

function wireControls() {
  document.querySelectorAll('.view-btn').forEach((btn) => btn.addEventListener('click', () => setView(btn.dataset.view)));
  document.querySelectorAll('.filter-btn').forEach((btn) => btn.addEventListener('click', () => {
    state.filter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach((b) => b.classList.toggle('is-active', b === btn));
    renderList();
  }));
  $('search').addEventListener('input', (event) => { state.query = event.target.value.trim(); renderList(); });
  $('sort').addEventListener('change', (event) => { state.sort = event.target.value; renderList(); });
  $('spoilers').addEventListener('change', (event) => { state.spoilers = event.target.checked; renderAll(); });
  $('exportBtn').addEventListener('click', exportProgress);
  $('importBtn').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', (event) => { if (event.target.files[0]) importProgressFile(event.target.files[0]); });
  $('shareBtn').addEventListener('click', copyProgressLink);
  $('resetBtn').addEventListener('click', () => {
    if (window.confirm('Clear every checked trophy?')) {
      state.earned.clear();
      saveEarned();
      renderAll();
      $('actionNote').textContent = 'Checklist reset.';
    }
  });
}

async function loadTrophies() {
  const response = await fetch(DATA_URL);
  const data = await response.json();
  state.trophies = data.trophies;
  state.sources = data.sources || {};
  state.roadmap = data.roadmap || [];
}

async function initGuide() {
  state.earned = loadStoredEarned();
  readHashState();
  await loadTrophies();
  if (state.openId) saveEarned();
  wireControls();
  document.querySelectorAll('.filter-btn').forEach((b) => b.classList.toggle('is-active', b.dataset.filter === state.filter));
  $('spoilers').checked = state.spoilers;
  $('sort').value = state.sort;
  setView(state.view);
  renderAll();
  if (state.openId) {
    // Highlight the opened trophy's card. (Deliberately no scripted scroll:
    // headless screenshot runs paint a blank frame after one.)
    const el = document.getElementById('trophy-' + state.openId);
    if (el) el.style.outline = '2px solid var(--accent-2)';
  }
}

initGuide();
