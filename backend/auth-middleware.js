import { adminAuth } from './firebase-admin.js';

function getBearerToken(req) {
  const header = req.headers.authorization;
  if (!header || typeof header !== 'string') return null;
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

export async function authenticateFirebaseToken(req, res, next) {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Bearer token is required.' });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email || null,
      name: decoded.name || decoded.email?.split('@')[0] || 'Pengguna',
      role: decoded.role === 'admin' ? 'admin' : 'user',
    };
    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid token.';
    res.status(401).json({ error: 'Unauthorized', message });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden', message: 'Admin role is required.' });
  }
  next();
}
