
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import 'dotenv/config';
import express from 'express';
import { GoogleAuth } from 'google-auth-library';
import fetch from 'node-fetch';
import rateLimit from 'express-rate-limit';
import { WebSocketServer, WebSocket } from 'ws';
import { authenticateFirebaseToken, requireAdmin } from './auth-middleware.js';
import { ensureUserProfile, updateUserProgress } from './profile-store.js';
import { generateSpeech } from './tts-handler.js';
import { enforceUserQuota } from './usage-limiter.js';
import { getWeeklyLeaderboard, getAllTimeLeaderboard, getUserRank } from './leaderboard-store.js';
import { submitContribution, getContributions, getUserContributions, reviewContribution } from './community-store.js';
import { getCachedTranslation, cacheTranslation } from './dictionary-cache.js';

const app = express();
app.use(express.json({limit: process?.env?.API_PAYLOAD_MAX_SIZE || "7mb"}));

// Set COOP/COEP headers for cross-origin isolation compatibility
app.use((_req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// Serve static frontend files in production
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');
import fs from 'fs';
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

const PORT = Number(process?.env?.PORT || process?.env?.API_BACKEND_PORT || 5000);
const API_BACKEND_HOST = process?.env?.API_BACKEND_HOST || "0.0.0.0";

const GOOGLE_CLOUD_LOCATION = process?.env?.GOOGLE_CLOUD_LOCATION;
const GOOGLE_CLOUD_PROJECT = process?.env?.GOOGLE_CLOUD_PROJECT;
if (!GOOGLE_CLOUD_PROJECT || !GOOGLE_CLOUD_LOCATION) {
  console.error("Error: Environment variables GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_LOCATION must be set.");
  process.exit(1);
}
const PROXY_HEADER = process?.env?.PROXY_HEADER;
if (!PROXY_HEADER) {
  console.error("Error: Environment variables PROXY_HEADER must be set.");
  process.exit(1);
}

app.set('trust proxy', 1 /* number of proxies between user and server */);

// IMPORTANT: Vertex AI Studio Rate Limiting
// This rate limiting configuration protects your backend APIs from abuse.
// Removing it exposes your service to DoS attacks and unexpected costs.
const proxyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Set ratelimit window at 15min (in ms)
    max: 60, // Limit each IP to 60 requests per window (reduced from 100)
    standardHeaders: true, // Return rate limit info in the "RateLimit-*" headers
    legacyHeaders: false, // no "X-RateLimit-*" headers
    message: {
      error: 'Too many requests',
      message: 'You have exceed the request limit, please try again later.'
    },
});

// TTS rate limiter - more restrictive since TTS is expensive
const ttsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 TTS requests per 15min
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many TTS requests',
      message: 'Batas permintaan audio tercapai. Coba lagi nanti.'
    },
});

// Global API rate limiter for all /api/* routes
const globalApiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many requests',
      message: 'Terlalu banyak permintaan. Coba lagi dalam 1 menit.'
    },
});
app.use('/api', globalApiLimiter);
// Apply the rate limiter to the /api-proxy route before the main proxy logic
app.use('/api-proxy', proxyLimiter);

app.get('/health', (_req, res) => {
  res.status(200).json({status: 'ok'});
});

app.get('/api/auth/session', authenticateFirebaseToken, async (req, res) => {
  try {
    const profile = await ensureUserProfile(req.user);
    res.status(200).json({ user: profile, progress: profile.progress });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load session.';
    res.status(500).json({ error: 'SessionError', message });
  }
});

app.get('/api/users/me', authenticateFirebaseToken, async (req, res) => {
  try {
    const profile = await ensureUserProfile(req.user);
    res.status(200).json({ user: profile, progress: profile.progress });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load profile.';
    res.status(500).json({ error: 'ProfileError', message });
  }
});

app.patch('/api/users/me/progress', authenticateFirebaseToken, async (req, res) => {
  if (!req.body || typeof req.body !== 'object' || !req.body.progress || typeof req.body.progress !== 'object') {
    return res.status(400).json({ error: 'Bad Request', message: 'progress object is required.' });
  }

  try {
    const profile = await updateUserProgress(req.user, req.body.progress);
    res.status(200).json({ user: profile, progress: profile.progress });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update progress.';
    res.status(500).json({ error: 'ProgressUpdateError', message });
  }
});

app.get('/api/admin/health', authenticateFirebaseToken, requireAdmin, (_req, res) => {
  res.status(200).json({ status: 'ok', role: 'admin' });
});

const API_CLIENT_MAP = [
 {
    name: "VertexGenAi:generateContent",
    patternForProxy: "https://aiplatform.googleapis.com/{{version}}/publishers/google/models/{{model}}:generateContent",
    getApiEndpoint: (context, params) => {
      return `https://aiplatform.clients6.google.com/${params['version']}/projects/${context.projectId}/locations/${context.region}/publishers/google/models/${params['model']}:generateContent`;
    },
    isStreaming: false,
    transformFn: null,
  },
 {
    name: "VertexGenAi:predict",
    patternForProxy: "https://aiplatform.googleapis.com/{{version}}/publishers/google/models/{{model}}:predict",
    getApiEndpoint: (context, params) => {
      return `https://aiplatform.clients6.google.com/${params['version']}/projects/${context.projectId}/locations/${context.region}/publishers/google/models/${params['model']}:predict`;
    },
    isStreaming: false,
    transformFn: null,
  },
 {
    name: "VertexGenAi:streamGenerateContent",
    patternForProxy: "https://aiplatform.googleapis.com/{{version}}/publishers/google/models/{{model}}:streamGenerateContent",
    getApiEndpoint: (context, params) => {
      return `https://aiplatform.clients6.google.com/${params['version']}/projects/${context.projectId}/locations/${context.region}/publishers/google/models/${params['model']}:streamGenerateContent`;
    },
    isStreaming: true,
    transformFn: (response) => {
        let normalizedResponse = response.trim();
        while (normalizedResponse.startsWith(',') || normalizedResponse.startsWith('[')) {
          normalizedResponse = normalizedResponse.substring(1).trim();
        }
        while (normalizedResponse.endsWith(',') || normalizedResponse.endsWith(']')) {
          normalizedResponse = normalizedResponse.substring(0, normalizedResponse.length - 1).trim();
        }

        if (!normalizedResponse.length) {
          return {result: null, inProgress: false};
        }

        if (!normalizedResponse.endsWith('}')) {
          return {result: normalizedResponse, inProgress: true};
        }

        try {
          const parsedResponse = JSON.parse(`${normalizedResponse}`);
          const transformedResponse = `data: ${JSON.stringify(parsedResponse)}\n\n`;
          return {result: transformedResponse, inProgress: false};
        } catch (error) {
          throw new Error(`Failed to parse response: ${error}.`);
        }
    },
  },
 {
    name: "ReasoningEngine:query",
    patternForProxy: "https://{{endpoint_location}}-aiplatform.googleapis.com/{{version}}/projects/{{project_id}}/locations/{{location_id}}/reasoningEngines/{{engine_id}}:query",
    getApiEndpoint: (context, params) => {
      return `https://${params['endpoint_location']}-aiplatform.clients6.google.com/v1beta1/projects/${params['project_id']}/locations/${params['location_id']}/reasoningEngines/${params['engine_id']}:query`;
    },
    isStreaming: false,
    transformFn: null,
  },
 {
    name: "ReasoningEngine:streamQuery",
    patternForProxy: "https://{{endpoint_location}}-aiplatform.googleapis.com/{{version}}/projects/{{project_id}}/locations/{{location_id}}/reasoningEngines/{{engine_id}}:streamQuery",
    getApiEndpoint: (context, params) => {
      return `https://${params['endpoint_location']}-aiplatform.clients6.google.com/v1beta1/projects/${params['project_id']}/locations/${params['location_id']}/reasoningEngines/${params['engine_id']}:streamQuery`;
    },
    isStreaming: true,
    transformFn: null,
  },
].map((client) => ({ ...client, patternInfo: parsePattern(client.patternForProxy) }));

// Uses Google Application Default Credentials (ADC).
// Users need to run "gcloud auth application-default login" in order to use the proxy.
const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parsePattern(pattern) {
  const paramRegex = /\{\{(.*?)\}\}/g;
  const params = [];
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = paramRegex.exec(pattern)) !== null) {
    params.push(match[1]);
    const literalPart = pattern.substring(lastIndex, match.index);
    parts.push(escapeRegex(literalPart));
    parts.push(`(?<${match[1]}>[^/]+)`);
    lastIndex = paramRegex.lastIndex;
  }
  parts.push(escapeRegex(pattern.substring(lastIndex)));
  const regexString = parts.join('');

  return {regex: new RegExp(`^${regexString}$`), params};
}

function extractParams(patternInfo, url) {
  const match = url.match(patternInfo.regex);
  if (!match) return null;
  const params = {};
  patternInfo.params.forEach((paramName, index) => {
    params[paramName] = match[index + 1];
  });
  return params;
}

async function getAccessToken(res) {
  try {
    const authClient = await auth.getClient();
    const token = await authClient.getAccessToken();
    return token.token;
  } catch (error) {
    console.error('[Node Proxy] Authentication error:', error);
    if (!res) return null;
    if (error.code === 'ERR_GCLOUD_NOT_LOGGED_IN' || (error.message && error.message.includes('Could not load the default credentials'))) {
      res.status(401).json({
        error: 'Authentication Required',
        message: 'Google Cloud Application Default Credentials not found or invalid. Please run "gcloud auth application-default login" and try again.',
      });
    } else {
      res.status(500).json({ error: `Authentication failed: ${error.message}` });
    }
    return null;
  }
}

function getRequestHeaders(accessToken) {
  return {
    'Authorization': `Bearer ${accessToken}`,
    'X-Goog-User-Project': GOOGLE_CLOUD_PROJECT,
    'Content-Type': 'application/json',
  };
}

// --- Proxy Endpoint ---
app.post('/api-proxy', authenticateFirebaseToken, enforceUserQuota, async (req, res) => {

  // Check for the custom header added by the shim (defense-in-depth)
  if (req.headers['x-app-proxy'] !== PROXY_HEADER) {
    return res.status(403).json({ error: 'Forbidden', message: 'Invalid proxy header.' });
  }

  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Bad Request', message: 'JSON body is required.' });
  }

  const { originalUrl, method, headers, body } = req.body;
  if (!originalUrl || typeof originalUrl !== 'string') {
    return res.status(400).send('Bad Request: originalUrl is required.');
  }

  // 1. Find the matching API client
  const apiClient = API_CLIENT_MAP.find(p => {
    // We store extractedParams on req for use later if needed, though getVertexUrl takes it as arg.
    req.extractedParams = extractParams(p.patternInfo, originalUrl);
    return req.extractedParams !== null;
  });

  if (!apiClient) {
    console.error(`[Node Proxy] No API client handler found for URL: ${originalUrl}`);
    return res.status(404).json({ error: `No proxy handler found for URL: ${originalUrl}` });
  }

  const extractedParams = req.extractedParams;
  console.log(`[Node Proxy] Matched API client: ${apiClient.name}`);
  try {
    // 2. Get authenticated access token
    const accessToken = await getAccessToken(res);
    if (!accessToken) return;

    // 3. Construct the full API URL using env-set GOOGLE_CLOUD_PROJECT/LOCATION and extracted params
    const context = {projectId: GOOGLE_CLOUD_PROJECT, region: GOOGLE_CLOUD_LOCATION};
    const apiUrl = apiClient.getApiEndpoint(context, extractedParams);
    console.log(`[Node Proxy] Forwarding to Vertex API: ${apiUrl}`);

    // 4. Prepare headers for the API call
    const apiHeaders = getRequestHeaders(accessToken);

    const apiFetchOptions = {
      method: method || 'POST',
      headers: {...apiHeaders, ...(headers && typeof headers === 'object' ? headers : {})},
      body: body ? body : undefined,
    };

    // 5. Make the call to the API
    const apiResponse = await fetch(apiUrl, apiFetchOptions);

    // 6. Respond to the client based on stream type
    if (apiClient.isStreaming) {
      console.log(`[Node Proxy] Sending STREAMING response for ${apiClient.name}`);
      // Set headers for a streaming JSON response
      res.writeHead(apiResponse.status, {
        'Content-Type': 'text/event-stream',
        'Transfer-Encoding': 'chunked',
        'Connection': 'keep-alive',
      });
      // Immediately send headers
      res.flushHeaders();

      if (!apiResponse.body) {
        console.error('[Node Proxy] Streaming response has no body.');
        return res.end(JSON.stringify({ error: 'Streaming response body is null' }));
      }

      const decoder = new TextDecoder();
      let deltaChunk = '';
      apiResponse.body.on('data', (encodedChunk) => {
        if (res.writableEnded) return; // Prevent writing after res.end()

        try {
          if (!apiClient.transformFn) {
            res.write(encodedChunk);
          } else {
            const decodedChunk = decoder.decode(encodedChunk, { stream: true });
            deltaChunk = deltaChunk + decodedChunk;

            const {result, inProgress} = apiClient.transformFn(deltaChunk);
            if (result && !inProgress) {
              deltaChunk = '';
              res.write(new TextEncoder().encode(result));
            }
          }
        } catch (error) {
          console.error(`[Node Proxy] Error processing streaming response for ${apiClient.name}`);
          console.error(error);
        }
      });

      apiResponse.body.on('end', () => {
        deltaChunk = '';
        console.log(`[Node Proxy] Vertex stream finished and all data processed for ${apiClient.name}`);
        res.end();
      });

      apiResponse.body.on('error', (streamError) => {
        console.error('[Node Proxy] Error from Vertex stream:', streamError);
        if (!res.writableEnded) {
          res.end(JSON.stringify({ proxyError: 'Stream error from Vertex AI', details: streamError.message }));
        }
      });

      res.on('error', (resError) => {
        console.error('[Node Proxy] Error writing to client response:', resError);
        // The source stream might need to be destroyed if an error occurs here.
        if (apiResponse.body && typeof apiResponse.body.destroy === 'function') {
             apiResponse.body.destroy(resError);
        }
      });
    } else {
      // Non-streaming response handling
      console.log(`[Node Proxy] Sending JSON response for ${apiClient.name}`);
      const data = await apiResponse.json();
      res.status(apiResponse.status).json(data);
    }
  } catch (error) {
    console.error(`[Node Proxy] Error proxying request for ${apiClient.name}`);
    console.error(error)
    const message = error instanceof Error ? error.message : 'Unknown proxy error';
    res.status(500).json({ error: 'ProxyError', message });
  }
});

// --- Leaderboard Endpoints ---
app.get('/api/leaderboard/weekly', authenticateFirebaseToken, async (req, res) => {
  try {
    const leaderboard = await getWeeklyLeaderboard(20);
    const userRank = await getUserRank(req.user.uid);
    res.status(200).json({ leaderboard, currentUser: userRank });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load leaderboard.';
    console.error('[Leaderboard] Weekly error:', message);
    res.status(500).json({ error: 'LeaderboardError', message });
  }
});

app.get('/api/leaderboard/alltime', authenticateFirebaseToken, async (req, res) => {
  try {
    const leaderboard = await getAllTimeLeaderboard(20);
    const userRank = await getUserRank(req.user.uid);
    res.status(200).json({ leaderboard, currentUser: userRank });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load leaderboard.';
    console.error('[Leaderboard] All-time error:', message);
    res.status(500).json({ error: 'LeaderboardError', message });
  }
});

// --- Community Contribution Endpoints ---
app.post('/api/contributions', authenticateFirebaseToken, async (req, res) => {
  const { word, translation, example } = req.body || {};
  if (!word || !translation) {
    return res.status(400).json({ error: 'Bad Request', message: 'word and translation are required.' });
  }

  try {
    const contribution = await submitContribution(req.user, { word, translation, example });
    res.status(201).json({ contribution });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit contribution.';
    res.status(500).json({ error: 'ContributionError', message });
  }
});

app.get('/api/contributions/mine', authenticateFirebaseToken, async (req, res) => {
  try {
    const contributions = await getUserContributions(req.user.uid);
    res.status(200).json({ contributions });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load contributions.';
    res.status(500).json({ error: 'ContributionError', message });
  }
});

app.get('/api/admin/contributions', authenticateFirebaseToken, requireAdmin, async (req, res) => {
  const status = req.query.status || 'pending';
  try {
    const contributions = await getContributions(status);
    res.status(200).json({ contributions });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load contributions.';
    res.status(500).json({ error: 'ContributionError', message });
  }
});

app.patch('/api/admin/contributions/:id', authenticateFirebaseToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { decision } = req.body || {};
  if (!decision || !['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ error: 'Bad Request', message: 'decision must be "approved" or "rejected".' });
  }

  try {
    const result = await reviewContribution(id, req.user.uid, decision);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to review contribution.';
    res.status(500).json({ error: 'ContributionError', message });
  }
});

// --- Dictionary Cache Endpoint ---
app.get('/api/dictionary/cache', authenticateFirebaseToken, async (req, res) => {
  const word = req.query.word;
  if (!word || typeof word !== 'string') {
    return res.status(400).json({ error: 'Bad Request', message: 'word query parameter is required.' });
  }

  try {
    const cached = await getCachedTranslation(word);
    if (cached) {
      res.status(200).json({ cached: true, result: cached });
    } else {
      res.status(404).json({ cached: false, result: null });
    }
  } catch (error) {
    res.status(500).json({ error: 'CacheError', message: 'Failed to check cache.' });
  }
});

app.post('/api/dictionary/cache', authenticateFirebaseToken, async (req, res) => {
  const { word, result } = req.body || {};
  if (!word || !result) {
    return res.status(400).json({ error: 'Bad Request', message: 'word and result are required.' });
  }

  try {
    await cacheTranslation(word, result);
    res.status(201).json({ cached: true });
  } catch (error) {
    res.status(500).json({ error: 'CacheError', message: 'Failed to cache result.' });
  }
});

// --- TTS Endpoint ---
app.post('/api/tts', ttsLimiter, authenticateFirebaseToken, enforceUserQuota, async (req, res) => {
  await generateSpeech(req, res);
});

// SPA fallback: serve index.html for any non-API route (must be after all API routes)
if (fs.existsSync(publicDir)) {
  app.use((req, res, next) => {
    // Only handle GET requests that aren't API calls and don't have a file extension match
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/api-proxy') && !req.path.startsWith('/health')) {
      res.sendFile(path.join(publicDir, 'index.html'));
    } else {
      next();
    }
  });
}

const server = app.listen(PORT, API_BACKEND_HOST, () => {
  console.log(`Vertex AI Backend listening at http://${API_BACKEND_HOST}:${PORT}`);
});


const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', async (request, socket, head) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (url.pathname === '/ws-proxy') {
    
    let targetUrl = url.searchParams.get('target');
    if (!targetUrl) {
      console.log('[Node Proxy] Missing target URL');
      socket.destroy();
      return;
    }

    if (targetUrl === 'wss://aiplatform.googleapis.com//ws/google.cloud.aiplatform.v1beta1.LlmBidiService/BidiGenerateContent') {
      const location = GOOGLE_CLOUD_LOCATION === 'global' ? 'us-central1' : GOOGLE_CLOUD_LOCATION;
      targetUrl = `wss://${location}-aiplatform.googleapis.com//ws/google.cloud.aiplatform.v1beta1.LlmBidiService/BidiGenerateContent`;
    } else {
      console.log('[Node Proxy] Invalid target URL');
      socket.destroy();
      return;
    }

    let accessToken;

    try {
      accessToken = await getAccessToken();
      if (!accessToken) throw new Error('No token');
    } catch (err) {
      console.log('[Node Proxy] Authentication failed');
      socket.destroy();
      return;
    }

    console.log(`[Node Proxy] Initiating upstream connection to: ${targetUrl}`);

    let upstreamWs;

    try {
      upstreamWs = new WebSocket(targetUrl, {
        headers: getRequestHeaders(accessToken)
      });
    } catch (e) {
      console.error('[Node Proxy] Invalid Upstream URL');
      socket.destroy();
      return;
    }

    const initialErrorHandler = (error) => {
      console.error('[Node Proxy] Upstream connection failed:', error);
      upstreamWs.removeEventListener('open', onUpstreamOpen);

      if (socket.writable) {
        socket.write('HTTP/1.1 502 Bad Gateway\r\n\r\n');
        socket.destroy();
      }
    };

    upstreamWs.once('error', initialErrorHandler);

    // 5. Handle Successful Upstream Connection
    const onUpstreamOpen = () => {
      // Remove the "bootstrapping" error handler
      upstreamWs.removeListener('error', initialErrorHandler);

      // Perform the HTTP -> WebSocket upgrade for the Client
      wss.handleUpgrade(request, socket, head, (ws) => {

        upstreamWs.on('message', (data, isBinary) => {
          const logMsg = isBinary ? '<Binary Data>' : data.toString();
          console.log(`[Upstream -> Client] [${new Date().toISOString()}]: ${logMsg}`);

          if (ws.readyState === WebSocket.OPEN) {
            if (data === undefined || data === null) {
              console.warn('[Node Proxy] Attempted to send undefined/null data to client');
              return;
            }
            ws.send(data, { binary: isBinary });
          }
        });

        ws.on('message', (data, isBinary) => {
          const logMsg = isBinary ? '<Binary Data>' : data.toString();

          let dataJson = {};
          try {
            dataJson = JSON.parse(data.toString());
          } catch (error) {
            console.error('[Node Proxy] Failed to parse message from client:', error);
            ws.close(1011, 'Failed to parse message');
          }

          if (dataJson['setup']) {
            dataJson['setup']['model'] = `projects/${GOOGLE_CLOUD_PROJECT}/locations/${GOOGLE_CLOUD_LOCATION}/${dataJson['setup']['model']}`;
          }

          if (upstreamWs.readyState === WebSocket.OPEN) {
            upstreamWs.send(JSON.stringify(dataJson), { binary: false });
          }
        });

        upstreamWs.on('error', (error) => {
          console.error('[Node Proxy] Upstream error:', error);
          ws.close(1011, error.message);
        });

        upstreamWs.on('close', (code, reason) => {
          console.log(`[Node Proxy] Upstream closed: ${code} ${reason}`);
          if (ws.readyState === WebSocket.OPEN) {
            ws.close(code, reason);
          }
        });

        ws.on('error', (error) => {
          console.error('[Node Proxy] Client error:', error);
          upstreamWs.close(1011, error.message);
        });

        ws.on('close', (code, reason) => {
          console.log(`[Node Proxy] Client closed: ${code} ${reason}`);
          if (upstreamWs.readyState === WebSocket.OPEN) {
            upstreamWs.close(1000, reason);
          }
        });

        wss.emit('connection', ws, request);
      });
    };

    upstreamWs.once('open', onUpstreamOpen);

  } else {
    // Path did not match
    socket.destroy();
  }
});


