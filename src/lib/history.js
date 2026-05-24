const STORAGE_KEY = "lecture-notes:history";

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function listHistory() {
  return load().sort((a, b) => b.createdAt - a.createdAt);
}

export function addHistory(item) {
  const list = load();
  const entry = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    ...item,
  };
  list.push(entry);
  save(list);
  return entry;
}

export function updateHistory(id, patch) {
  const list = load();
  const idx = list.findIndex((x) => x.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...patch };
  save(list);
  return list[idx];
}

export function removeHistory(id) {
  const list = load().filter((x) => x.id !== id);
  save(list);
}

export function groupBySubject(list) {
  const map = new Map();
  for (const item of list) {
    const key = item.subject || "その他";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0], "ja"));
}
