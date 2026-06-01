import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'probable-force-311023',
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId);

const firebaseApp = isFirebaseConfigured
    ? (getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig))
    : null;

export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;

// Expose auth instance globally for the proxy interceptor
if (firebaseAuth) {
    (window as unknown as Record<string, unknown>).__HABAGET_AUTH = firebaseAuth;
}
