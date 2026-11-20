// Leonida Ledger — boot: load the data, wire the toolbar, tabs and hash routing,
// and keep the checklist, detail panel and progress in sync with the saved state.
import { loadState, saveState, exportState, importStateFile } from './store.js';
import { loadTrophies } from './data.js';
import { renderKindChips, renderChecklist, renderDetail, renderProgress, renderRoadmap, renderMissables, renderSources } from './views.js';

const rawState = loadState();
const state = {
  earned: rawState.earned,
  earnedSet: new Set(rawState.earned),
  counters: rawState.counters,
  settings: rawState.settings,
};

const filters = { search: '', grade: 'all', status: 'all', kind: 'all' };
let doc = null;
let selectedId = null;

const listEl = document.getElementById('trophy-list');
const metaEl = document.getElementById('list-meta');
const emptyEl = document.getElementById('empty-note');
const detailEl = document.getElementById('detail');
const chipsEl = document.getElementById('kind-chips');

function persist() {
  state.earned = [...state.earnedSet];
  saveState({ earned: state.earned, counters: state.counters, settings: state.settings });
}

function renderAll() {
  renderProgress(doc, state);
  renderKindChips(chipsEl, filters.kind, (kind) => {
    filters.kind = kind;
    renderAll();
  });
  renderChecklist(listEl, metaEl, emptyEl, doc, filters, state, selectedId, selectTrophy, toggleEarned);
  renderDetail(detailEl, doc, state, selectedId, (id, value) => {
    if (value > 0) state.counters[id] = value;
    else delete state.counters[id];
    persist();
    renderAll();
  });
}

function toggleEarned(id, earned) {
  if (earned) state.earnedSet.add(id);
  else state.earnedSet.delete(id);
  persist();
  renderAll();
}

function selectTrophy(id) {
  selectedId = id;
  renderAll();
  if (location.hash.startsWith('#/trophy/')) history.replaceState(null, '', '#/checklist');
}

function showView(name) {
  for (const view of document.querySelectorAll('.view')) view.hidden = view.id !== `view-${name}`;
  for (const tab of document.querySelectorAll('.tab')) tab.classList.toggle('active', tab.dataset.tab === name);
}

function route() {
  const hash = location.hash || '#/checklist';
  const match = hash.match(/^#\/trophy\/(\d+)$/);
  if (match) {
    selectedId = Number(match[1]);
    showView('checklist');
    renderAll();
    return;
  }
  const name = ['checklist', 'roadmap', 'missables', 'sources'].includes(hash.slice(2)) ? hash.slice(2) : 'checklist';
  showView(name);
  if (name === 'roadmap') renderRoadmap(doc, state);
  if (name === 'missables') renderMissables(doc, state);
}

async function boot() {
  doc = await loadTrophies();
  renderSources(doc);
  renderRoadmap(doc, state);
  renderMissables(doc, state);

  document.getElementById('search').addEventListener('input', (e) => {
    filters.search = e.target.value;
    renderAll();
  });
  document.getElementById('grade-filter').addEventListener('change', (e) => {
    filters.grade = e.target.value;
    renderAll();
  });
  document.getElementById('status-filter').addEventListener('change', (e) => {
    filters.status = e.target.value;
    renderAll();
  });
  const spoilerToggle = document.getElementById('spoiler-toggle');
  spoilerToggle.checked = state.settings.spoilersHidden;
  spoilerToggle.addEventListener('change', () => {
    state.settings.spoilersHidden = spoilerToggle.checked;
    persist();
    renderAll();
  });
  document.getElementById('export-btn').addEventListener('click', () => {
    exportState({ earned: state.earned, counters: state.counters, settings: state.settings });
  });
  document.getElementById('import-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    const status = document.getElementById('import-status');
    if (!file) return;
    const result = await importStateFile(file);
    if (!result.ok) {
      status.textContent = result.error;
      return;
    }
    state.earned = result.state.earned;
    state.earnedSet = new Set(result.state.earned);
    state.counters = result.state.counters;
    state.settings = result.state.settings;
    spoilerToggle.checked = state.settings.spoilersHidden;
    persist();
    status.textContent = `Imported ${state.earned.length} earned trophies.`;
    renderAll();
  });
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (!confirm('Reset all progress? This clears every tick and counter.')) return;
    state.earnedSet.clear();
    state.counters = {};
    persist();
    renderAll();
  });

  window.addEventListener('hashchange', route);
  renderAll();
  route();
}

boot().catch((error) => {
  document.getElementById('trophy-list').innerHTML = `<li class="empty-note">Could not load the trophy list: ${error.message}</li>`;
});
