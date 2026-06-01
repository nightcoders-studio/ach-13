import { db, FieldValue } from './firebase-admin.js';
import { normalizeProgress } from './default-progress.js';

const usersCollection = db.collection('users');

export async function ensureUserProfile(user) {
  const ref = usersCollection.doc(user.uid);
  const snapshot = await ref.get();
  const fallbackName = user.name || user.email?.split('@')[0] || 'Pengguna';
  const role = user.role || 'user';

  if (!snapshot.exists) {
    const progress = normalizeProgress({ name: fallbackName }, fallbackName);
    const profile = {
      uid: user.uid,
      email: user.email || null,
      name: fallbackName,
      role,
      progress,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await ref.set(profile);
    return { uid: profile.uid, email: profile.email, name: profile.name, role: profile.role, progress };
  }

  const data = snapshot.data() || {};
  const progress = normalizeProgress(data.progress, data.name || fallbackName);
  const profile = {
    uid: data.uid || user.uid,
    email: data.email || user.email || null,
    name: data.name || progress.name || fallbackName,
    role: data.role || role,
    progress,
  };

  await ref.set(
    {
      uid: profile.uid,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      progress,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return profile;
}

export async function updateUserProgress(user, progressPatch) {
  const currentProfile = await ensureUserProfile(user);
  const { uid: _uid, email: _email, role: _role, ...safeProgressPatch } = progressPatch;
  const progress = normalizeProgress(
    {
      ...currentProfile.progress,
      ...safeProgressPatch,
    },
    currentProfile.name,
  );

  await usersCollection.doc(user.uid).set(
    {
      name: progress.name,
      progress,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return {
    ...currentProfile,
    name: progress.name,
    progress,
  };
}
