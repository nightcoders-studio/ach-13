/**
 * Per-user daily API usage limiter.
 * Tracks AI API calls per user per day using in-memory store.
 * For production scale, replace with Firestore or Redis.
 */

// In-memory store: { [uid]: { date: 'YYYY-MM-DD', count: number } }
const usageStore = new Map();

const DEFAULT_DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT_PER_USER || 50);
const ADMIN_DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT_ADMIN || 200);

function getTodayKey() {
  return new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
}

/**
 * Check if user has exceeded their daily AI call quota.
 * Returns { allowed: boolean, remaining: number, limit: number }
 */
export function checkUserQuota(uid, role = 'user') {
  const today = getTodayKey();
  const limit = role === 'admin' ? ADMIN_DAILY_LIMIT : DEFAULT_DAILY_LIMIT;

  const entry = usageStore.get(uid);

  if (!entry || entry.date !== today) {
    // New day or new user — reset
    return { allowed: true, remaining: limit, limit };
  }

  const remaining = Math.max(0, limit - entry.count);
  return { allowed: entry.count < limit, remaining, limit };
}

/**
 * Increment the usage counter for a user.
 */
export function incrementUsage(uid) {
  const today = getTodayKey();
  const entry = usageStore.get(uid);

  if (!entry || entry.date !== today) {
    usageStore.set(uid, { date: today, count: 1 });
  } else {
    entry.count += 1;
  }
}

/**
 * Express middleware that enforces per-user daily AI quota.
 * Must be used AFTER authenticateFirebaseToken middleware.
 */
export function enforceUserQuota(req, res, next) {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
  }

  const role = req.user?.role || 'user';
  const { allowed, remaining, limit } = checkUserQuota(uid, role);

  // Set quota headers for client visibility
  res.set('X-RateLimit-Limit-Daily', String(limit));
  res.set('X-RateLimit-Remaining-Daily', String(remaining));

  if (!allowed) {
    return res.status(429).json({
      error: 'Daily Quota Exceeded',
      message: `Anda telah mencapai batas ${limit} permintaan AI per hari. Coba lagi besok.`,
      limit,
      remaining: 0,
    });
  }

  // Increment after allowing the request through
  incrementUsage(uid);
  next();
}

/**
 * Cleanup old entries (call periodically to prevent memory leak).
 */
export function cleanupExpiredEntries() {
  const today = getTodayKey();
  for (const [uid, entry] of usageStore.entries()) {
    if (entry.date !== today) {
      usageStore.delete(uid);
    }
  }
}

// Cleanup every hour
setInterval(cleanupExpiredEntries, 60 * 60 * 1000);
