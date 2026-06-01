import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

export const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || 'probable-force-311023';

const app = getApps().length > 0 ? getApps()[0] : initializeApp({ projectId });

export const adminAuth = getAuth(app);
export const db = getFirestore(app);
export { FieldValue };
