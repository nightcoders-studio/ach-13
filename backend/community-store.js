/**
 * Community contribution store - manages vocabulary submissions.
 */
import { db, FieldValue } from './firebase-admin.js';

const contributionsCollection = db.collection('contributions');

/**
 * Submit a new vocabulary contribution.
 */
export async function submitContribution(user, { word, translation, example }) {
  if (!word || !translation) {
    throw new Error('word and translation are required.');
  }

  const contribution = {
    uid: user.uid,
    authorName: user.name || 'Anonim',
    authorEmail: user.email || null,
    word: word.trim(),
    translation: translation.trim(),
    example: example?.trim() || null,
    status: 'pending', // pending | approved | rejected
    reviewedBy: null,
    reviewedAt: null,
    createdAt: FieldValue.serverTimestamp(),
  };

  const docRef = await contributionsCollection.add(contribution);
  return { id: docRef.id, ...contribution };
}

/**
 * Get contributions by status (for admin moderation).
 */
export async function getContributions(status = 'pending', limit = 50) {
  let query = contributionsCollection.orderBy('createdAt', 'desc').limit(limit);

  if (status !== 'all') {
    query = contributionsCollection
      .where('status', '==', status)
      .orderBy('createdAt', 'desc')
      .limit(limit);
  }

  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Get contributions by a specific user.
 */
export async function getUserContributions(uid, limit = 20) {
  const snapshot = await contributionsCollection
    .where('uid', '==', uid)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Approve or reject a contribution (admin only).
 */
export async function reviewContribution(contributionId, adminUid, decision) {
  if (!['approved', 'rejected'].includes(decision)) {
    throw new Error('decision must be "approved" or "rejected".');
  }

  const ref = contributionsCollection.doc(contributionId);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    throw new Error('Contribution not found.');
  }

  await ref.update({
    status: decision,
    reviewedBy: adminUid,
    reviewedAt: FieldValue.serverTimestamp(),
  });

  return { id: contributionId, status: decision };
}
