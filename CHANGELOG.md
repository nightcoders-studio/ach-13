# HabaGet - Changelog & Development Status

Terakhir diperbarui: 2026-06-01

---

## Ringkasan Deployment

| Item | Detail |
|------|--------|
| URL Production | https://habaget-944212261019.asia-southeast1.run.app |
| GCP Project ID | probable-force-311023 |
| Region | asia-southeast1 |
| Platform | Cloud Run (managed) |
| Max Instances | 3 |
| Memory | 512Mi |
| Firebase Auth | Email/Password (enabled) |
| Database | Firestore |

---

## Update yang Sudah Dilakukan (2026-06-01)

### 1. Deployment ke Google Cloud Run

- Dibuat `Dockerfile` multi-stage (build frontend → serve via backend)
- Backend Express serve static files dari `frontend/dist/` di production
- SPA fallback middleware untuk React Router (HashRouter)
- Fix Express 5 wildcard route compatibility (`path-to-regexp` v8+)
- Dibuat `.dockerignore` untuk optimasi build
- Dibuat `cloudbuild.yaml` untuk CI/CD pipeline

### 2. Firebase Authentication (Real)

- Firebase Auth Email/Password provider di-enable
- API key baru dibuat khusus untuk Firebase Web (`AIzaSyAIEP_...`)
- Frontend build di-inject env vars Firebase via Docker build args
- `onAuthStateChanged` listener untuk persistent auth state
- Register: `createUserWithEmailAndPassword` + set displayName
- Login: `signInWithEmailAndPassword` — akun tidak terdaftar ditolak
- Logout: `signOut`
- Backend: `authenticateFirebaseToken` middleware verifikasi ID token
- Role admin via Firebase custom claims
- Authorized domain Cloud Run ditambahkan di Firebase Console
- Global auth reference (`window.__HABAGET_AUTH`) untuk proxy interceptor

### 3. Security & Cost Protection

- **Auth pada `/api-proxy`**: Firebase Bearer token + PROXY_HEADER (defense-in-depth)
- **Auth pada `/api/tts`**: Firebase Bearer token required
- **Rate limiting berlapis**:
  - Global API: 60 req/menit per IP
  - Proxy: 60 req/15 menit per IP
  - TTS: 20 req/15 menit per IP
- **Per-user daily quota**:
  - User biasa: max 50 AI calls/hari
  - Admin: max 200 AI calls/hari
  - Header `X-RateLimit-Remaining-Daily` dikirim ke client
- **Cloud Run max-instances=3**: mencegah auto-scale tak terbatas
- **Budget alert**: $10 USD dengan notifikasi di 50%, 90%, 100%
- **Usage limiter** (`usage-limiter.js`): in-memory tracker dengan auto-cleanup

### 4. Leaderboard Real

- Backend endpoint `/api/leaderboard/weekly` dan `/api/leaderboard/alltime`
- Query Firestore untuk ranking berdasarkan XP nyata
- Frontend menampilkan data real dari semua user terdaftar
- Podium top 3 + list lengkap dengan rank user saat ini

### 5. Streak Tracking Real

- Field `lastActiveDate` (ISO date string) di UserProgress
- Logic: hari berturut-turut = streak naik, skip 1 hari = reset ke 1
- Dashboard & Profile menampilkan streak visual berdasarkan data aktual
- Streak dihitung saat user mendapat XP (lesson, pronunciation, dll)

### 6. Community Contribution Persistence

- Backend endpoints:
  - `POST /api/contributions` — submit kosakata baru
  - `GET /api/contributions/mine` — riwayat kontribusi user
  - `GET /api/admin/contributions` — list untuk moderasi admin
  - `PATCH /api/admin/contributions/:id` — approve/reject
- Firestore collection `contributions` dengan status workflow
- Frontend: form submit + tab "Riwayat Saya" dengan status badge

### 7. Dictionary Caching

- Backend endpoints:
  - `GET /api/dictionary/cache?word=...` — lookup cache
  - `POST /api/dictionary/cache` — simpan hasil terjemahan
- Firestore collection `dictionary_cache`
- Frontend: cek cache sebelum panggil AI → hemat quota
- Hit counter dan `lastAccessedAt` untuk analytics

### 8. Gemini TTS (Text-to-Speech)

- Backend handler `tts-handler.js` menggunakan model `gemini-2.5-flash-preview-tts`
- Endpoint `/api/tts` mengembalikan audio WAV (24kHz, 16-bit, mono)
- Region fixed `us-central1` (TTS model availability)
- Halaman Cerita: tombol "Dengarkan Hikayat" menggunakan Gemini TTS
- Fallback ke browser `speechSynthesis` jika TTS gagal

### 9. Hearts System

- Heart berkurang 1 setiap jawab salah di LessonModal
- `onWrongAnswer` callback dari LessonModal → Learn → App
- Minimum 0 hearts (tidak bisa negatif)

### 10. Halaman Baru

| Halaman | Route | Deskripsi |
|---------|-------|-----------|
| Saved Words | `#/kata-tersimpan` | List kata tersimpan, dengarkan audio, hapus |
| Forgot Password | `#/forgot-password` | Kirim email reset via Firebase Auth |

### 11. Perbaikan UI/UX

- Link "Lupa password?" di halaman login
- Profile → "Kata yang disimpan" navigate ke halaman dedicated
- Streak visual di Dashboard & Profile menggunakan data real
- Community page: toggle form/riwayat, status badge per kontribusi

---

## Arsitektur Saat Ini

```
User Browser (HTTPS)
  │
  ├── Static Files (HTML/JS/CSS) ← Cloud Run serves from /public
  │
  ├── /api/users/me ← Firebase Auth token → Firestore profile
  ├── /api/users/me/progress ← Firebase Auth token → Firestore update
  ├── /api/leaderboard/* ← Firebase Auth token → Firestore query
  ├── /api/contributions/* ← Firebase Auth token → Firestore CRUD
  ├── /api/dictionary/cache ← Firebase Auth token → Firestore cache
  ├── /api/tts ← Firebase Auth + rate limit → Vertex AI TTS
  ├── /api-proxy ← Firebase Auth + PROXY_HEADER → Vertex AI Gemini
  └── /ws-proxy ← WebSocket → Vertex AI Live API
```

---

## Backend Endpoints Lengkap

| Endpoint | Method | Auth | Rate Limit | Fungsi |
|----------|--------|------|------------|--------|
| `/health` | GET | ❌ | ❌ | Health check |
| `/api/auth/session` | GET | ✅ | Global | Load session |
| `/api/users/me` | GET | ✅ | Global | Get profile + progress |
| `/api/users/me/progress` | PATCH | ✅ | Global | Update progress |
| `/api/admin/health` | GET | ✅ Admin | Global | Admin health check |
| `/api/leaderboard/weekly` | GET | ✅ | Global | Weekly ranking |
| `/api/leaderboard/alltime` | GET | ✅ | Global | All-time ranking |
| `/api/contributions` | POST | ✅ | Global | Submit kosakata |
| `/api/contributions/mine` | GET | ✅ | Global | User's contributions |
| `/api/admin/contributions` | GET | ✅ Admin | Global | List for moderation |
| `/api/admin/contributions/:id` | PATCH | ✅ Admin | Global | Approve/reject |
| `/api/dictionary/cache` | GET | ✅ | Global | Lookup cached translation |
| `/api/dictionary/cache` | POST | ✅ | Global | Cache translation result |
| `/api/tts` | POST | ✅ | TTS (20/15min) + Daily quota | Generate speech audio |
| `/api-proxy` | POST | ✅ | Proxy (60/15min) + Daily quota | Vertex AI proxy |

---

## Firestore Collections

| Collection | Dokumen | Fungsi |
|------------|---------|--------|
| `users` | `{uid}` | Profile, progress, role, timestamps |
| `contributions` | auto-ID | Kosakata submissions + moderation status |
| `dictionary_cache` | encoded word | Cached AI translation results |

---

## Environment Variables

### Backend (Cloud Run runtime)

| Variable | Deskripsi |
|----------|-----------|
| `GOOGLE_CLOUD_PROJECT` | GCP project ID |
| `GOOGLE_CLOUD_LOCATION` | Region untuk Vertex AI |
| `PROXY_HEADER` | Secret header untuk proxy validation |
| `AI_DAILY_LIMIT_PER_USER` | Max AI calls/hari per user (default: 50) |
| `AI_DAILY_LIMIT_ADMIN` | Max AI calls/hari per admin (default: 200) |
| `PORT` | Port (set otomatis oleh Cloud Run: 8080) |

### Frontend (build-time, di-inject via Dockerfile ARG)

| Variable | Deskripsi |
|----------|-----------|
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase/GCP project ID |
| `VITE_API_BASE_URL` | API base URL (kosong = same-origin) |

---

## Yang Masih Perlu Dikembangkan

### Prioritas Tinggi

1. **Admin Panel Real** — Connect ke Firestore: list users, manage contributions, statistik real
2. **Pretest dari AI/Database** — Generate soal dinamis, simpan hasil placement ke Firestore
3. **Hearts refill** — Reset hearts harian (misal setiap 24 jam kembali ke 5)
4. **Email verification** — Verifikasi email setelah register
5. **Dictionary page: tampilkan cached results** — Suggest kata populer dari cache

### Prioritas Sedang

6. **Daily Mission** — 3 misi harian (translate 5 kata, selesaikan 1 lesson, dll)
7. **Achievement/Badge System** — Badge nyata berdasarkan milestone
8. **Riwayat Belajar** — Halaman history: lesson selesai, kata dipelajari, tanggal
9. **Learn page: unlock topics** — Unlock berdasarkan progress, tambah lebih banyak unit
10. **Paket Les persistence** — Simpan inquiry ke Firestore, notifikasi admin
11. **Prompt injection protection** — Sanitize user input sebelum masuk ke AI prompt
12. **Structured logging** — Ganti console.log dengan structured JSON logging

### Prioritas Rendah

13. **Offline Mode** — Cache lesson/kamus yang sudah diakses (Service Worker)
14. **Social Login** — Login via Google account
15. **Admin Analytics** — Grafik penggunaan, user growth, popular words
16. **Push Notification** — Streak reminder, daily mission reminder
17. **Multi-dialect Support** — Pilihan dialek Aceh (Banda Aceh, Pidie, Aceh Utara)
18. **Spaced Repetition** — Review kata berdasarkan algoritma SM-2
19. **Native Audio Assets** — Upload/manage audio penutur asli
20. **CI/CD Pipeline** — GitHub Actions: test → build → deploy otomatis
21. **Tailwind build-time** — Ganti CDN dengan PostCSS build (reduce bundle size)
22. **Code splitting** — Dynamic import untuk halaman (reduce initial load)
23. **CORS middleware** — Tambahkan jika API diakses cross-origin
24. **Secret Manager** — Pindahkan PROXY_HEADER ke GCP Secret Manager

---

## Fitur/Modul/Halaman Baru yang Bisa Ditambahkan

| # | Fitur | Deskripsi | Kompleksitas |
|---|-------|-----------|--------------|
| 1 | **Halaman Onboarding** | Tutorial interaktif setelah register pertama kali | Sedang |
| 2 | **Halaman Riwayat Belajar** | Timeline aktivitas: lesson, kamus, cerita, XP gained | Sedang |
| 3 | **Halaman Daily Mission** | 3 misi harian dengan progress bar dan reward XP | Sedang |
| 4 | **Halaman Achievements** | Grid badge/lencana dengan progress unlock | Sedang |
| 5 | **Halaman Settings** | Ubah nama, email, password, preferensi notifikasi | Sedang |
| 6 | **Halaman Admin: Users** | List user real dari Firestore, search, filter, detail | Tinggi |
| 7 | **Halaman Admin: Dictionary** | Manage kosakata verified, edit, hapus | Tinggi |
| 8 | **Halaman Admin: Contributions** | Moderation queue dengan approve/reject/edit | Sedang |
| 9 | **Halaman Admin: Analytics** | Dashboard statistik: DAU, retention, popular words | Tinggi |
| 10 | **Modul Spaced Repetition** | Review kata tersimpan dengan interval SM-2 | Tinggi |
| 11 | **Modul Chat AI** | Percakapan bebas dengan AI tutor Bahasa Aceh | Sedang |
| 12 | **Modul Quiz Harian** | 5 soal random harian dengan timer | Sedang |
| 13 | **Modul Flashcard** | Kartu bolak-balik untuk review kosakata | Rendah |
| 14 | **Modul Grammar** | Penjelasan tata bahasa Aceh dengan contoh | Sedang |
| 15 | **Notifikasi In-App** | Bell icon dengan dropdown notifikasi real-time | Sedang |
| 16 | **PWA Support** | Manifest + Service Worker untuk install di homescreen | Rendah |
| 17 | **Dark Mode** | Toggle tema gelap/terang | Rendah |
| 18 | **Multi-language UI** | UI dalam Bahasa Aceh selain Indonesia | Rendah |

---

## Tech Debt & Perbaikan Teknis

| # | Item | Dampak |
|---|------|--------|
| 1 | Ganti Tailwind CDN → build-time PostCSS | Reduce load time, enable purge |
| 2 | Code splitting (React.lazy) | Reduce initial bundle dari 747KB |
| 3 | Move PROXY_HEADER ke Secret Manager | Security best practice |
| 4 | Structured logging (pino/winston) | Better debugging di Cloud Logging |
| 5 | Input sanitization pada AI prompts | Prevent prompt injection |
| 6 | Firestore security rules | Defense-in-depth untuk database |
| 7 | Error boundary component | Graceful error handling di UI |
| 8 | Loading skeleton components | Better perceived performance |
| 9 | API response caching (SWR/React Query) | Reduce redundant API calls |
| 10 | Unit tests (Vitest) | Prevent regressions |
| 11 | E2E tests (Playwright) | Verify critical user flows |
| 12 | Monitoring & alerting | Cloud Monitoring dashboards |
| 13 | Backup strategy | Firestore export schedule |
| 14 | Rate limit per-user (bukan per-IP) | More accurate throttling |
| 15 | WebSocket auth | Tambah token verification pada ws-proxy |
