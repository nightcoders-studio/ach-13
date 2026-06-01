import { adminAuth, db, FieldValue, projectId } from '../firebase-admin.js';
import { normalizeProgress } from '../default-progress.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'yudhae@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME || 'Yudha E';

if (!ADMIN_PASSWORD) {
  console.error('ADMIN_PASSWORD is required. Example: ADMIN_PASSWORD="your-password" npm run seed:admin --prefix backend');
  process.exit(1);
}

let userRecord;

try {
  userRecord = await adminAuth.getUserByEmail(ADMIN_EMAIL);
  userRecord = await adminAuth.updateUser(userRecord.uid, {
    password: ADMIN_PASSWORD,
    displayName: userRecord.displayName || ADMIN_NAME,
    emailVerified: true,
    disabled: false,
  });
  console.log(`Updated existing admin auth user: ${ADMIN_EMAIL}`);
} catch (error) {
  if (error?.code !== 'auth/user-not-found') {
    throw error;
  }

  userRecord = await adminAuth.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    displayName: ADMIN_NAME,
    emailVerified: true,
    disabled: false,
  });
  console.log(`Created admin auth user: ${ADMIN_EMAIL}`);
}

await adminAuth.setCustomUserClaims(userRecord.uid, { role: 'admin' });

const progress = normalizeProgress(
  {
    name: ADMIN_NAME,
    xp: 340,
    streak: 3,
    masteredWords: 47,
    pretestCompleted: true,
    leaderboardCategory: 'Aneuk Miet',
  },
  ADMIN_NAME,
);

await db.collection('users').doc(userRecord.uid).set(
  {
    uid: userRecord.uid,
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    role: 'admin',
    progress,
    seededAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  { merge: true },
);

console.log(`Seeded admin profile for ${ADMIN_EMAIL} in project ${projectId}.`);
