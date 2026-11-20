// Leonida Ledger — every view: the checklist, the trophy detail, the roadmap,
// the missables page and the sources page. All text is built from data/trophies.json.
import { KIND_LABELS, KIND_ORDER, GRADE_LETTER, STAGE_LABELS, trophyById, gradeCounts, isHiddenFromPlayer, displayName, displayDescription } from './data.js';

export function medalDot(grade) {
  const span = document.createElement('span');
  span.className = `medal ${grade}`;
  span.textContent = GRADE_LETTER[grade];
  span.title = grade;
  return span;
}

function tag(text, cls) {
  const span = document.createElement('span');
  span.className = `tag${cls ? ' ' + cls : ''}`;
  span.textContent = text;
  return span;
}

function el(name, cls, text) {
  const node = document.createElement(name);
  if (cls) node.className = cls;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

// --- Checklist ----------------------------------------------------------------

export function filteredTrophies(doc, filters, state) {
  const q = filters.search.trim().toLowerCase();
  return doc.trophies.filter((t) => {
    if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
    if (filters.status === 'earned' && !state.earnedSet.has(t.id)) return false;
    if (filters.status === 'unearned' && state.earnedSet.has(t.id)) return false;
    if (filters.kind === 'missable' && !t.missable) return false;
    if (filters.kind === 'online') return false; // GTA VI has no online trophies (see the empty state).
    if (filters.kind !== 'all' && filters.kind !== 'missable' && t.kind !== filters.kind) return false;
    if (q) {
      const hay = `${t.name} ${t.description} ${t.guide} ${KIND_LABELS[t.kind] || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function renderKindChips(container, activeKind, onPick) {
  container.replaceChildren();
  const kinds = [{ id: 'all', label: 'All kinds' }, ...KIND_ORDER.map((k) => ({ id: k, label: KIND_LABELS[k] })), { id: 'missable', label: 'Missable' }, { id: 'online', label: 'Online' }];
  for (const k of kinds) {
    const button = el('button', 'chip' + (k.id === 'missable' ? ' missable-chip' : ''), k.label);
    button.type = 'button';
    button.setAttribute('aria-pressed', String(k.id === activeKind));
    if (k.id === activeKind) button.classList.add('active');
    button.addEventListener('click', () => onPick(k.id));
    container.append(button);
  }
}

export function renderChecklist(listEl, metaEl, emptyEl, doc, filters, state, selectedId, onSelect, onToggle) {
  const rows = filteredTrophies(doc, filters, state);
  listEl.replaceChildren();
  if (filters.kind === 'online') {
    emptyEl.hidden = false;
    emptyEl.textContent = 'No online trophies in GTA VI — all 55 are single-player, and the Platinum can never expire with a server. (PowerPyx: 0 online trophies.)';
  } else if (rows.length === 0) {
    emptyEl.hidden = false;
    emptyEl.textContent = 'Nothing matches those filters. Try clearing the search or picking another kind.';
  } else {
    emptyEl.hidden = true;
  }
  const earnedShown = rows.filter((t) => state.earnedSet.has(t.id)).length;
  metaEl.textContent = `Showing ${rows.length} of ${doc.trophies.length} trophies · ${earnedShown} earned in this view`;
  for (const t of rows) {
    const hidden = isHiddenFromPlayer(t, state);
    const li = el('li');
    const row = el('button', 'trophy-row' + (state.earnedSet.has(t.id) ? ' earned' : '') + (t.id === selectedId ? ' selected' : ''));
    row.type = 'button';
    row.addEventListener('click', () => onSelect(t.id));
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = state.earnedSet.has(t.id);
    box.setAttribute('aria-label', `Mark ${hidden ? 'hidden trophy' : t.name} as earned`);
    box.addEventListener('click', (event) => {
      event.stopPropagation();
      onToggle(t.id, box.checked);
    });
    const main = el('div', 'trophy-main');
    const name = el('div', 'trophy-name');
    if (hidden) {
      const tagEl = el('span', 'hidden-tag', 'Hidden story trophy');
      name.append(tagEl);
    } else {
      name.textContent = t.name;
    }
    const desc = el('div', 'trophy-desc', displayDescription(t, state));
    const tags = el('div', 'trophy-tags');
    tags.append(tag(t.grade, `grade-${t.grade}`));
    tags.append(tag(KIND_LABELS[t.kind]));
    if (t.chapter) tags.append(tag(`Chapter ${t.chapter}`));
    if (t.missable) tags.append(tag('Potentially missable', 'missable'));
    if (t.target) tags.append(tag(`${t.target} ${t.targetLabel}`, 'target'));
    if (t.hidden) tags.append(tag('Hidden on PSN'));
    main.append(name, desc, tags);
    const side = el('div', 'trophy-side');
    const counter = state.counters[t.id];
    if (t.target && counter) side.append(el('div', null, `${counter} / ${t.target}`));
    side.append(el('div', 'guide-hint', t.id === selectedId ? 'Guide open ↓' : 'Guide →'));
    row.append(box, medalDot(t.grade), main, side);
    li.append(row);
    listEl.append(li);
  }
}

// --- Detail panel ---------------------------------------------------------------

export function renderDetail(detailEl, doc, state, selectedId, onCounter) {
  detailEl.replaceChildren();
  const card = el('div', 'detail-card');
  const t = selectedId ? trophyById(doc, selectedId) : null;
  if (!t) {
    card.classList.add('empty');
    card.append(el('p', null, 'Pick a trophy from the list to see its guide. The guide is this ledger\u2019s own words, with its sources named beside it.'));
    detailEl.append(card);
    return;
  }
  const hidden = isHiddenFromPlayer(t, state);
  const head = el('div', 'detail-head');
  head.append(medalDot(t.grade));
  const headText = el('div');
  headText.append(el('h3', null, hidden ? 'Hidden story trophy' : t.name));
  const sub = el('div', 'trophy-tags');
  sub.append(tag(t.grade, `grade-${t.grade}`));
  sub.append(tag(KIND_LABELS[t.kind]));
  if (t.chapter) sub.append(tag(`Chapter ${t.chapter}`));
  if (t.hidden) sub.append(tag('Hidden on PSN'));
  if (t.missable) sub.append(tag('Potentially missable', 'missable'));
  headText.append(sub);
  head.append(headText);
  card.append(head);

  const official = el('div', 'official');
  official.append(el('div', 'label', 'Official description — as PlayStation publishes it'));
  official.append(el('p', null, hidden ? 'Hidden until earned.' : t.description));
  card.append(official);

  if (t.target) {
    const row = el('div', 'counter-row');
    row.append(el('label', null, `Your progress (${t.targetLabel}):`));
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.max = String(t.target);
    input.value = String(state.counters[t.id] ?? 0);
    input.setAttribute('aria-label', `Progress toward ${t.name}`);
    input.addEventListener('change', () => {
      const value = Math.max(0, Math.min(t.target, Number(input.value) || 0));
      input.value = String(value);
      onCounter(t.id, value);
    });
    row.append(input, el('span', 'of-target', `/ ${t.target}`));
    card.append(row);
  }

  const guide = el('div', 'guide-block');
  guide.append(el('div', 'label', 'Guide — this ledger\u2019s own words'));
  if (hidden) {
    guide.append(el('p', null, 'This is a story trophy, and the spoiler setting is hiding it. Earn it in the game — or turn spoilers off — to read the guide.'));
  } else {
    guide.append(el('p', null, t.guide));
  }
  card.append(guide);

  if (t.missable) {
    const warn = el('div', 'warn-box');
    warn.innerHTML = '<strong>Potentially missable.</strong> ';
    warn.append(document.createTextNode('The only trophy in the game flagged as possibly missable. Do the Chapter 1 meditation at Jason\u2019s house (see the guide above) — after Chapter 1 it is gone for good.'));
    card.append(warn);
  }

  if (!hidden) {
    const sources = el('div', 'sources');
    sources.append(el('div', 'label', 'Sources for this guide'));
    const ul = el('ul');
    for (const s of t.sources) {
      const li = el('li');
      const a = document.createElement('a');
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = s.name;
      li.append(a);
      ul.append(li);
    }
    sources.append(ul);
    card.append(sources);
  }

  card.append(el('p', 'stage-note', `${STAGE_LABELS[t.stage]} · ${t.hidden ? 'Hidden on PlayStation until earned.' : 'Visible on PlayStation from the start.'}`));
  detailEl.append(card);
}

// --- Progress header ------------------------------------------------------------

export function renderProgress(doc, state) {
  const earned = state.earnedSet.size;
  const total = doc.trophies.length;
  document.getElementById('earned-count').textContent = String(earned);
  document.getElementById('total-count').textContent = String(total);
  document.getElementById('earned-pct').textContent = `${Math.round((earned / total) * 100)}%`;
  document.getElementById('progress-fill').style.width = `${(earned / total) * 100}%`;
  const counts = gradeCounts(doc, state.earnedSet);
  const parts = Object.entries(counts).map(([grade, [got, all]]) => `${grade}: ${got}/${all}`);
  document.getElementById('grade-counts').textContent = parts.join(' · ');
  document.getElementById('missable-badge').textContent = String(doc.trophies.filter((t) => t.missable).length);
}

// --- Roadmap --------------------------------------------------------------------

export function renderRoadmap(doc, state) {
  const container = document.getElementById('roadmap-steps');
  container.replaceChildren();
  for (const step of doc.roadmap) {
    const card = el('article', 'step-card');
    const h = el('h3');
    const num = el('span', 'step-num', String(step.step));
    h.append(num, document.createTextNode(step.title + ' '));
    const time = el('span', 'time', `· ${step.time}`);
    h.append(time);
    card.append(h);
    card.append(el('p', null, step.summary));
    const warn = el('p', null, step.warning);
    warn.style.cssText = 'color: var(--coral-soft); font-weight: 600;';
    card.append(warn);
    const chips = el('div', 'step-trophies');
    for (const t of doc.trophies.filter((x) => x.stage === step.step)) {
      const a = document.createElement('a');
      a.href = `#/trophy/${t.id}`;
      a.className = 'mini' + (state.earnedSet.has(t.id) ? ' done' : '');
      a.textContent = (state.earnedSet.has(t.id) ? '✓ ' : '') + t.name;
      chips.append(a);
    }
    card.append(chips);
    container.append(card);
  }
  const rows = [
    ['Optional missions (any 100)', '100', '200+'],
    ['Vehicles scanned (base models)', '200', '277'],
    ['Animals studied (binoculars)', '100', '255'],
    ['Weapons (50 of 66)', '50', '66'],
    ['Stunts completed', '300', '397'],
    ['Challenges completed', '70', '80'],
    ['Meditation spots', '15', '18'],
    ['Collectible card sets', '15', '18'],
    ['Shooting Range gold medals', '42', '42'],
    ['Top Fun drone races won', '42', '42'],
    ['Bank vaults robbed', '8', '8'],
    ['Illegal gang operations', '39', '39'],
    ['Target decks (Bret)', '15', '15'],
  ];
  const tbody = document.querySelector('#completion-table tbody');
  tbody.replaceChildren();
  for (const [what, need, of] of rows) {
    const tr = document.createElement('tr');
    tr.append(el('td', null, what), el('td', null, need), el('td', null, of));
    tbody.append(tr);
  }
}

// --- Missables ------------------------------------------------------------------

export function renderMissables(doc, state) {
  const container = document.getElementById('missable-cards');
  container.replaceChildren();
  for (const t of doc.trophies.filter((x) => x.missable)) {
    const hero = el('article', 'missable-hero');
    hero.append(el('h3', null, `⚠ ${t.name} — ${t.description}`));
    hero.append(el('p', null, t.guide));
    const link = document.createElement('a');
    link.href = `#/trophy/${t.id}`;
    link.textContent = 'Open its guide in the checklist →';
    hero.append(link);
    container.append(hero);
  }
  const safe = document.getElementById('safe-list');
  safe.replaceChildren();
  const items = [
    'Every story trophy is automatic — finish the missions and chapters and they pop. None can be missed.',
    'Nothing on the 100% Completion checklist is missable. Everything stays open in free roam after the story.',
    'Character quest givers who go quiet mid-story (Kenton, for one) come back later — their trophies stay earnable.',
    'Optional missions that disappear do not matter for trophies: there are far more than the 100 the checklist asks for.',
    'Some fences and magazine collectibles vanish, but neither affects any trophy or the 100% checklist.',
  ];
  for (const text of items) safe.append(el('li', null, text));
}

// --- Sources --------------------------------------------------------------------

export function renderSources(doc) {
  const container = document.getElementById('source-cards');
  container.replaceChildren();
  const notes = {
    'Exophase — GTA VI trophy list': 'The trophy trackers\u2019 listing of the official list: every name, description and grade, and the hidden flags.',
    'PSNProfiles — Grand Theft Auto VI trophies': 'The second tracker listing the same list, including the counts PlayStation tracks (such as 42 Shooting Range challenges). The two trackers agree on every name, description and grade.',
    'PowerPyx — GTA 6 Trophy Guide & Roadmap': 'The full launch guide this ledger\u2019s how-to steps draw on: the roadmap, the one potentially missable meditation, the questlines and the counts behind the 100% checklist.',
    'GTA Zone — GTA 6 Trophy List': 'A second full list with the visible/hidden split (27 visible, 28 hidden) and per-trophy tips from PowerPyx and GTABase.',
    'Push Square — GTA 6 Trophy Guide & Roadmap': 'A second guide confirming the list, the 100% checklist and the ~200–300 hour estimate.',
  };
  for (const s of doc.sources) {
    const card = el('article', 'source-card');
    const h = el('h3');
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.name;
    h.append(a);
    card.append(h);
    card.append(el('p', null, notes[s.name] || ''));
    container.append(card);
  }
}
