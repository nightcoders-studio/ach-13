export function createDefaultProgress(name = 'Pengguna') {
  return {
    name,
    xp: 0,
    streak: 0,
    hearts: 5,
    level: 1,
    savedWords: [],
    masteredWords: 0,
    subscribed: false,
    pretestCompleted: false,
    leaderboardCategory: null,
    notifications: [],
  };
}

export function normalizeProgress(progress = {}, fallbackName = 'Pengguna') {
  return {
    ...createDefaultProgress(fallbackName),
    ...progress,
    name: typeof progress.name === 'string' && progress.name.trim() ? progress.name : fallbackName,
    savedWords: Array.isArray(progress.savedWords) ? progress.savedWords : [],
    notifications: Array.isArray(progress.notifications) ? progress.notifications : [],
  };
}
