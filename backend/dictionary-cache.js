/**
 * Dictionary cache - stores AI translation results in Firestore
 * to avoid repeated API calls for the same word.
 */
import { db, FieldValue } from './firebase-admin.js';

const cacheCollection = db.collection('dictionary_cache');

/**
 * Look up a cached translation.
 * Returns the cached result or null if not found.
 */
export async function getCachedTranslation(word) {
  const normalizedWord = word.trim().toLowerCase();
  const docId = encodeURIComponent(normalizedWord).replace(/\./g, '%2E');

  try {
    const snapshot = await cacheCollection.doc(docId).get();
    if (snapshot.exists) {
      const data = snapshot.data();
      // Update hit count
      await cacheCollection.doc(docId).update({
        hits: FieldValue.increment(1),
        lastAccessedAt: FieldValue.serverTimestamp(),
      });
      return data.result || null;
    }
  } catch (error) {
    console.error('[DictCache] Error reading cache:', error.message);
  }

  return null;
}

/**
 * Store a translation result in cache.
 */
export async function cacheTranslation(word, result) {
  const normalizedWord = word.trim().toLowerCase();
  const docId = encodeURIComponent(normalizedWord).replace(/\./g, '%2E');

  try {
    await cacheCollection.doc(docId).set({
      word: normalizedWord,
      originalQuery: word.trim(),
      result,
      hits: 1,
      createdAt: FieldValue.serverTimestamp(),
      lastAccessedAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('[DictCache] Error writing cache:', error.message);
  }
}
