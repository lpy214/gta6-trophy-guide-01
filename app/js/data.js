// Leonida Ledger — the trophy data: loading it, and the small lookups the views share.
export const KIND_LABELS = {
  story: 'Story',
  side: 'Side quest',
  collectibles: 'Collectibles',
  activities: 'Activities',
  robberies: 'Robberies',
  exploration: 'Exploration',
  money: 'Money',
  completion: 'Completion',
  misc: 'Miscellaneous',
};

export const KIND_ORDER = ['story', 'side', 'collectibles', 'activities', 'robberies', 'exploration', 'money', 'completion', 'misc'];

export const GRADE_LETTER = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };

export const STAGE_LABELS = {
  1: 'Step 1 — Play the story',
  2: 'Step 2 — The 100% checklist',
  3: 'Step 3 — Cleanup',
};

let cached = null;

export async function loadTrophies() {
  if (cached) return cached;
  const res = await fetch('data/trophies.json');
  if (!res.ok) throw new Error('Could not load data/trophies.json');
  cached = await res.json();
  return cached;
}

export function trophyById(doc, id) {
  return doc.trophies.find((t) => t.id === id) || null;
}

export function gradeCounts(doc, earnedSet) {
  const counts = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const t of doc.trophies) {
    counts[t.grade][1] += 1;
    if (earnedSet.has(t.id)) counts[t.grade][0] += 1;
  }
  return counts;
}

export function isHiddenFromPlayer(trophy, state) {
  // The spoiler setting hides story trophies until they are earned.
  return state.settings.spoilersHidden && trophy.kind === 'story' && !state.earnedSet.has(trophy.id);
}

export function displayName(trophy, state) {
  return isHiddenFromPlayer(trophy, state) ? null : trophy.name;
}

export function displayDescription(trophy, state) {
  return isHiddenFromPlayer(trophy, state) ? 'Hidden story trophy — earn it to reveal its name and description.' : trophy.description;
}
