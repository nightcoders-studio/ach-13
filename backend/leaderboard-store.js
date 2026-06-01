/**
 * Leaderboard service - queries Firestore for top users by XP.
 */
import { db } from './firebase-admin.js';

const usersCollection = db.collection('users');

/**
 * Get weekly leaderboard (users active in the last 7 days).
 */
export async function getWeeklyLeaderboard(limit = 20) {
  try {
    // Simple approach: get all users, filter in memory (fine for MVP scale)
    const snapshot = await usersCollection.limit(200).get();

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const users = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          uid: data.uid || doc.id,
          name: data.name || 'Pengguna',
          xp: data.progress?.xp || 0,
          level: data.progress?.level || 1,
          streak: data.progress?.streak || 0,
          category: data.progress?.leaderboardCategory || null,
          updatedAt: data.updatedAt?.toDate?.() || new Date(0),
        };
      })
      .filter(u => u.updatedAt >= oneWeekAgo && u.xp > 0);

    // Sort by XP descending
    users.sort((a, b) => b.xp - a.xp);

    return users.slice(0, limit).map((user, index) => ({
      uid: user.uid,
      name: user.name,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      category: user.category,
      rank: index + 1,
    }));
  } catch (error) {
    console.error('[Leaderboard] Weekly query error:', error.message);
    return [];
  }
}

/**
 * Get all-time leaderboard (top users by XP).
 */
export async function getAllTimeLeaderboard(limit = 20) {
  try {
    const snapshot = await usersCollection.limit(200).get();

    const users = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          uid: data.uid || doc.id,
          name: data.name || 'Pengguna',
          xp: data.progress?.xp || 0,
          level: data.progress?.level || 1,
          streak: data.progress?.streak || 0,
          category: data.progress?.leaderboardCategory || null,
        };
      })
      .filter(u => u.xp > 0);

    // Sort by XP descending
    users.sort((a, b) => b.xp - a.xp);

    return users.slice(0, limit).map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
  } catch (error) {
    console.error('[Leaderboard] All-time query error:', error.message);
    return [];
  }
}

/**
 * Get a user's rank in the leaderboard.
 */
export async function getUserRank(uid) {
  try {
    const allTime = await getAllTimeLeaderboard(200);
    const userEntry = allTime.find(u => u.uid === uid);
    return userEntry || { uid, rank: allTime.length + 1, xp: 0, name: 'Kamu', level: 1, streak: 0, category: null };
  } catch (error) {
    console.error('[Leaderboard] getUserRank error:', error.message);
    return { uid, rank: 1, xp: 0, name: 'Kamu', level: 1, streak: 0, category: null };
  }
}
