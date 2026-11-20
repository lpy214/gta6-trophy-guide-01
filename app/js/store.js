// Leonida Ledger — saved progress: what the player ticked, their counters, and their settings.
// Everything lives in localStorage under one key; nothing is ever sent anywhere.
export const STORAGE_KEY = 'leonida-ledger-v1';

export const DEFAULT_SETTINGS = { spoilersHidden: true };

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { earned: [], counters: {}, settings: { ...DEFAULT_SETTINGS } };
    const parsed = JSON.parse(raw);
    return {
      earned: Array.isArray(parsed.earned) ? parsed.earned.filter((x) => typeof x === 'number') : [],
      counters: parsed.counters && typeof parsed.counters === 'object' ? parsed.counters : {},
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
    };
  } catch {
    return { earned: [], counters: {}, settings: { ...DEFAULT_SETTINGS } };
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Export the whole state as a JSON file the player can keep or move to another browser.
export function exportState(state) {
  const blob = new Blob([JSON.stringify({ app: 'leonida-ledger', version: 1, ...state }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Read an exported file back in. Returns { ok: true } or { ok: false, error }.
export async function importStateFile(file) {
  try {
    const parsed = JSON.parse(await file.text());
    if (!parsed || typeof parsed !== 'object') return { ok: false, error: 'That file is not a progress export.' };
    const earned = Array.isArray(parsed.earned) ? parsed.earned.filter((x) => typeof x === 'number') : null;
    if (earned === null) return { ok: false, error: 'That file has no earned list in it.' };
    return {
      ok: true,
      state: {
        earned,
        counters: parsed.counters && typeof parsed.counters === 'object' ? parsed.counters : {},
        settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
      },
    };
  } catch {
    return { ok: false, error: 'That file could not be read as JSON.' };
  }
}
