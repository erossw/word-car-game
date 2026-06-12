const SCORE_STORAGE_KEY = "wordCarGame_scores";

function normalizeScoreEntry(entry) {
  if (!entry || typeof entry !== "object") return null;

  const score = Math.max(0, Math.floor(Number(entry.score)));
  const stage = Math.max(1, Math.floor(Number(entry.stage)));
  if (!Number.isFinite(score) || !Number.isFinite(stage)) return null;

  const name = String(entry.name || "PLAYER")
    .trim()
    .slice(0, 10)
    .toUpperCase() || "PLAYER";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(entry.date))
    ? String(entry.date)
    : new Date().toISOString().slice(0, 10);

  return { name, score, stage, date };
}

function loadScores() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SCORE_STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeScoreEntry)
      .filter(Boolean)
      .sort((a, b) => b.score - a.score || b.stage - a.stage)
      .slice(0, 10);
  } catch {
    return [];
  }
}

function saveScore(entry) {
  const normalized = normalizeScoreEntry(entry);
  if (!normalized) return loadScores();

  const scores = [...loadScores(), normalized]
    .sort((a, b) => b.score - a.score || b.stage - a.stage)
    .slice(0, 10);
  try {
    localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(scores));
  } catch {
    return loadScores();
  }
  return scores;
}

window.ScoreStorage = {
  key: SCORE_STORAGE_KEY,
  load: loadScores,
  save: saveScore,
};
