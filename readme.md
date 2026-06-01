# HabaGet - Product & Technical Blueprint

Last updated: 2026-06-01

HabaGet adalah aplikasi belajar Bahasa Aceh berbasis AI, gamifikasi, kamus, cerita, latihan pengucapan, kontribusi komunitas, dan layanan les. Dokumen ini menjadi acuan sebelum melakukan perbaikan, pengembangan, dan penambahan fitur.

## Implementation Status

Phase 0 sudah dimulai pada 2026-06-01. Perbaikan awal yang sudah diterapkan: `.gitignore`, lockfile, dependency pinning, TypeScript config, import/type fix, scoring fix, `index.html` cleanup, warna `danger`, metadata permission microphone, backend `PORT`/`0.0.0.0`, health endpoint, basic request validation, dan `.env.local` dikeluarkan dari git tracking tanpa menghapus file lokal.

## Design Constraint

Desain UI setiap halaman yang sudah ada dianggap fix. Pengembangan berikutnya harus mempertahankan layout, warna, komposisi, navigasi, dan gaya visual saat ini. Perubahan yang diperbolehkan hanya untuk integrasi data, perbaikan bug, aksesibilitas, validasi, loading/error state, keamanan, dan koneksi backend tanpa mengubah karakter visual halaman.

## 01 Project Overview, Vision, Goals

### Project Overview

HabaGet saat ini adalah MVP/prototype aplikasi edukasi Bahasa Aceh dengan frontend React/Vite dan backend Node.js/Express yang berperan sebagai proxy ke Google Cloud Vertex AI. Banyak fitur sudah terlihat secara visual, tetapi sebagian besar data masih mock atau tersimpan lokal di browser.

Modul yang sudah ada:

- Landing page dan auth mock.
- Dashboard progres belajar.
- Kamus AI.
- Latihan belajar dan lesson modal.
- Pre-test penempatan.
- Leaderboard.
- Profil pengguna.
- Paket les via WhatsApp.
- Admin panel mock.
- Hikayat/cerita AI.
- Scan teks dari kamera.
- Latihan pengucapan dengan audio.
- Kontribusi kosakata komunitas.

### Vision

Menjadi platform digital utama untuk belajar, melestarikan, dan mengembangkan Bahasa Aceh dengan bantuan AI, data yang tervalidasi komunitas, dan infrastruktur Google Cloud yang siap scale.

### Goals

- Mengubah prototype menjadi MVP yang stabil, aman, dan siap deploy.
- Memindahkan state penting dari `localStorage` ke backend/database.
- Mengganti mock auth dengan autentikasi nyata dan role-based access.
- Menjadikan AI sebagai layanan backend yang terkontrol, bukan dipanggil langsung dari browser.
- Menyediakan database kosakata, lesson, progress, leaderboard, dan kontribusi komunitas.
- Menyiapkan deployment production di Google Cloud Services.
- Menjaga UI existing tetap sama sambil memperkuat logic, data, dan arsitektur.

## 02 Problem Statement

Bahasa Aceh membutuhkan media belajar modern yang mudah diakses, menyenangkan, dan relevan untuk pengguna muda maupun dewasa. Materi pembelajaran yang tersedia sering tersebar, tidak interaktif, dan tidak selalu memiliki konteks budaya atau pengucapan.

Masalah yang ditemukan pada audit awal:

- Auth masih mock dan tidak aman.
- Data pengguna, progress, saved words, dan notifikasi masih di `localStorage`.
- Admin panel belum diproteksi.
- Leaderboard, pre-test, paket les, dan kontribusi komunitas masih mock.
- Integrasi Gemini/Vertex AI masih berada di frontend melalui interceptor prototype.
- Backend belum Cloud Run ready karena belum memakai `PORT` dan `0.0.0.0`.
- Belum ada database, migration, schema, test, CI/CD, Dockerfile, atau infrastructure config.
- `.env.local` semula terlacak git dan perlu dipindahkan ke Secret Manager/env runtime untuk deployment.
- Dependency semula belum dipin dan belum ada lockfile.
- Beberapa bug teknis semula perlu diperbaiki sebelum development lanjutan.

Masalah pengguna yang ingin diselesaikan:

- Pengguna ingin belajar Bahasa Aceh secara bertahap dan menyenangkan.
- Pengguna butuh kamus dengan konteks budaya, contoh kalimat, dan pengucapan.
- Pengguna butuh latihan harian, skor, streak, dan progress yang tersimpan.
- Pengguna butuh cerita/hikayat sederhana untuk memahami bahasa dalam konteks.
- Pengguna butuh validasi pengucapan dan feedback.
- Komunitas butuh mekanisme kontribusi kosakata yang bisa divalidasi.
- Admin/tutor butuh panel untuk mengelola pengguna, kosakata, lesson, kontribusi, dan pendaftar les.

## 03 Features List / Functional Modules, Core Features

### A. Core Existing Modules

1. Landing & onboarding
   - Menampilkan brand HabaGet.
   - CTA register/login.
   - Menjelaskan value utama aplikasi.

2. Authentication
   - Saat ini masih mock.
   - Perlu diganti dengan auth nyata.
   - Perlu session persistence yang aman.

3. Dashboard
   - Menampilkan sapaan pengguna.
   - Menampilkan XP, level, streak, mastered words.
   - Word/motivasi harian.
   - Shortcut ke belajar, cerita, dan kamus.

4. Learning Path
   - Unit belajar dan topic path.
   - Lesson modal dengan soal pilihan ganda.
   - Reward XP setelah menyelesaikan lesson.

5. AI Dictionary
   - Translate Indonesia <-> Aceh.
   - Nuansa/konteks budaya.
   - Contoh kalimat.
   - Save word.
   - Text-to-speech browser.

6. Stories / Hikayat
   - Generate cerita pendek.
   - Terjemahan per kalimat.
   - Audio playback via browser speech synthesis.

7. Scan Text
   - Akses kamera.
   - Capture image.
   - AI OCR/translation.

8. Pronunciation Practice
   - Rekam audio.
   - AI scoring.
   - Feedback pengucapan.
   - Reward XP.

9. Pre-test Placement
   - Soal awal untuk menentukan kategori level.
   - Unlock leaderboard.

10. Leaderboard
    - Peringkat mingguan dan semua waktu.
    - Podium top 3.
    - Highlight user saat ini.

11. Profile
    - Ringkasan level, XP, streak, badges, saved words.
    - Logout.
    - Shortcut admin saat ini masih tanpa proteksi.

12. Paket Les
    - Paket kelas anak, dewasa, privat.
    - CTA WhatsApp.
    - Notifikasi lokal setelah daftar.

13. Admin Panel
    - Dashboard statistik mock.
    - List pengguna mock.
    - List pendaftar les mock.
    - Perlu role admin dan backend.

14. Community Contribution
    - Form usulan kosakata.
    - Saat ini submission masih mock.
    - Perlu moderation workflow.

### B. Required Fixes

Status per 2026-06-01:

- Done: tambah `.gitignore` dan keluarkan `.env.local` dari tracking git.
- Done: tambah lockfile dan pin versi dependency.
- Partial: tambah `tsconfig`; lint config dan test config masih pending.
- Done: fix import `frontend/services/gemini.ts` dari `./types` ke path yang benar.
- Done: samakan naming level ke `Aneuk Miet`.
- Done: fix scoring pre-test dan lesson agar jawaban terakhir ikut dihitung.
- Done: hapus script tidak valid `/index.js` dari `frontend/index.html`.
- Done: tambah warna `danger` dan `dangerDark` ke Tailwind config.
- Pending: ganti Tailwind CDN dengan build-time Tailwind package untuk production.
- Done: ubah backend agar listen ke `process.env.PORT` dan host `0.0.0.0`.
- Done: tambah health endpoint `GET /health`.
- Partial: validasi request payload backend dasar sudah ditambahkan; validasi schema lengkap masih pending.
- Pending: ganti `console.log` mentah dengan structured logging.
- Pending: jangan expose proxy header statis di frontend.

### C. Required Development

- Backend domain API:
  - `/api/auth/session`
  - `/api/users/me`
  - `/api/progress`
  - `/api/lessons`
  - `/api/dictionary`
  - `/api/stories`
  - `/api/pronunciation`
  - `/api/scan`
  - `/api/contributions`
  - `/api/leaderboard`
  - `/api/subscriptions`
  - `/api/admin/*`

- Database persistence:
  - users
  - user profiles
  - progress
  - lessons
  - questions
  - dictionary entries
  - saved words
  - stories
  - pronunciation attempts
  - community contributions
  - subscriptions/lesson inquiries
  - notifications
  - leaderboard snapshots
  - audit logs

- AI service layer:
  - Prompt templates.
  - Response schema validation.
  - Model version config.
  - Rate limiting per user.
  - Cost guardrails.
  - Moderation/safety handling.
  - Caching untuk dictionary/story generation.
  - Logging request metadata tanpa menyimpan data sensitif berlebihan.

- Admin workflow:
  - Role admin.
  - Approve/reject contribution.
  - Manage dictionary.
  - Manage lesson topics/questions.
  - Manage users.
  - Manage paket les inquiries.
  - Review AI-generated content.

### D. Feature Additions

- Real onboarding setelah register.
- Placement test dinamis dan tersimpan.
- Daily mission dan streak calculation berdasarkan tanggal nyata.
- Spaced repetition untuk saved words.
- Bookmark dan riwayat belajar.
- Native Acehnese audio asset upload/management.
- Manual dictionary fallback jika AI gagal.
- Content moderation queue.
- User feedback untuk hasil AI.
- Admin analytics.
- Export/import dictionary data.
- Cloud logging dashboard.
- Basic payment/booking workflow untuk paket les pada fase lanjut.

## 04 User Flow

### New User Flow

1. User membuka landing page.
2. User register/login.
3. User mengisi profil dasar.
4. User mengikuti pre-test.
5. Sistem menentukan level awal.
6. User masuk dashboard.
7. User memilih aktivitas: belajar, kamus, cerita, scan, pengucapan, atau paket les.
8. Progress, XP, streak, saved words, dan attempt tersimpan di backend.
9. User melihat leaderboard sesuai kategori.
10. User dapat kontribusi kosakata untuk divalidasi admin.

### Returning User Flow

1. User login.
2. Sistem mengambil profil dan progress dari backend.
3. Dashboard menampilkan streak, XP, level, dan misi harian.
4. User melanjutkan lesson terakhir.
5. Sistem menyimpan hasil lesson dan memperbarui leaderboard.

### Dictionary Flow

1. User mengetik kata/frasa.
2. Frontend memanggil backend dictionary endpoint.
3. Backend cek cache/database.
4. Jika belum ada, backend memanggil Vertex AI.
5. Backend validasi response.
6. Result dikirim ke frontend.
7. User dapat menyimpan kata.

### Lesson Flow

1. User memilih topic aktif.
2. Backend mengirim lesson/questions.
3. User menjawab soal.
4. Frontend menghitung state UI sementara.
5. Backend menerima attempt final.
6. Backend menghitung XP, mastery, streak, dan unlock state.
7. Frontend memperbarui tampilan tanpa mengubah desain.

### Contribution Flow

1. User mengirim kata, terjemahan, contoh.
2. Data masuk status `pending`.
3. Admin review.
4. Admin approve/reject/revise.
5. Entry approved masuk dictionary.
6. Contributor mendapat XP/badge kontribusi.

### Admin Flow

1. Admin login.
2. Backend memverifikasi role admin.
3. Admin membuka panel.
4. Admin mengelola pengguna, kosakata, kontribusi, lesson, dan pendaftar les.
5. Semua aksi penting dicatat ke audit log.

## 05 Functional Requirements

### Authentication & Authorization

- Sistem harus mendukung register, login, logout, dan session restore.
- Sistem harus memverifikasi identity token di backend.
- Sistem harus memiliki role minimal: `user`, `admin`.
- Route admin harus hanya bisa diakses admin.
- User tidak boleh bisa membaca/mengubah data user lain tanpa izin.

### User Profile & Progress

- Sistem harus menyimpan nama, email, avatar, level, XP, streak, hearts, dan category.
- Progress harus persist di database.
- XP harus dihitung dari event belajar yang valid.
- Streak harus dihitung berdasarkan aktivitas harian nyata.
- Saved words harus tersimpan per user.

### Learning

- Sistem harus menampilkan unit/topic sesuai progress user.
- Lesson harus bisa berasal dari database atau AI-generated draft yang tervalidasi.
- Jawaban benar/salah harus tersimpan sebagai attempt.
- Score final harus akurat termasuk jawaban terakhir.
- Lesson completion harus memberi XP sesuai rule backend.

### Pre-test

- Pre-test harus tersimpan sebagai placement attempt.
- Kategori level harus dihitung di backend.
- User hanya unlock leaderboard setelah pre-test selesai, kecuali admin override.

### Dictionary

- Sistem harus menerima query Indonesia/Aceh.
- Sistem harus mengembalikan translation, nuance, dan examples.
- Sistem harus memakai cache/database sebelum memanggil AI.
- User bisa save/unsave word.
- Admin bisa menandai entry sebagai verified.

### Stories

- Sistem harus generate atau mengambil cerita berdasarkan level.
- Cerita harus berisi title dan pasangan kalimat Aceh/Indonesia.
- Konten AI harus divalidasi schema.
- Story bisa disimpan untuk reuse/caching.

### Scan Text

- Frontend tetap meminta izin kamera dari browser.
- Backend menerima image payload dengan limit ukuran.
- Backend mengirim image ke AI vision endpoint.
- Sistem harus menolak file terlalu besar atau mime type tidak valid.

### Pronunciation

- Frontend merekam audio dengan izin browser.
- Backend menerima audio payload dengan limit ukuran dan mime type.
- AI mengembalikan score dan feedback.
- Backend menyimpan attempt dan memberi XP jika memenuhi threshold.

### Community Contribution

- User bisa submit kosakata.
- Submission default status `pending`.
- Admin bisa approve/reject.
- Approved contribution masuk dictionary.
- Contributor mendapat credit.

### Leaderboard

- Leaderboard harus dihitung dari XP event valid.
- Harus ada weekly dan all-time ranking.
- Ranking harus bisa difilter berdasarkan category/level.
- Weekly leaderboard reset mengikuti zona waktu yang ditentukan.

### Paket Les

- User bisa memilih paket.
- Sistem menyimpan inquiry/subscription interest.
- WhatsApp tetap bisa menjadi channel kontak awal.
- Admin bisa melihat status pendaftar.

### Admin

- Admin dapat melihat statistik.
- Admin dapat mengelola pengguna.
- Admin dapat mengelola dictionary.
- Admin dapat mengelola kontribusi.
- Admin dapat mengelola pendaftar les.
- Admin action harus masuk audit log.

### Security & Reliability

- Secret tidak boleh disimpan di repository.
- Semua endpoint mutasi harus auth protected.
- Backend harus memakai rate limit.
- Backend harus validasi input.
- Error response tidak boleh membocorkan stack trace atau token.
- Logging harus cukup untuk debugging tanpa menyimpan data sensitif.

## 06 Technical Stack / Architecture

### Current Stack

- Frontend: React, Vite, TypeScript, React Router, Lucide React.
- Styling: Tailwind CDN di `index.html`.
- AI SDK: `@google/genai`.
- Backend: Node.js, Express, Google Auth Library, WebSocket proxy.
- Runtime config: `.env.local`.
- Data persistence: browser `localStorage`.
- Database: belum ada.
- Test/CI/CD: belum ada.

### Target Production Stack

- Frontend:
  - React + Vite.
  - Tailwind build-time package.
  - Hosted di Firebase Hosting atau Cloud Run static service.

- Backend:
  - Node.js + Express atau framework Node yang lebih terstruktur.
  - Cloud Run.
  - Service account dengan IAM least privilege.
  - Secret Manager untuk secret/config sensitif.

- Authentication:
  - Firebase Auth atau Google Cloud Identity Platform.
  - Backend token verification.
  - Role-based access control.
  - Admin seed script melalui `npm run seed:admin`.

```bash
ADMIN_PASSWORD="set-local-password" npm run seed:admin
```

Default seed email: `yudhae@gmail.com`. Password tidak disimpan di repository; set melalui environment lokal atau Secret Manager.

- Database:
  - Opsi 1: Firestore untuk MVP cepat, fleksibel, dan cocok untuk data user/progress.
  - Opsi 2: Cloud SQL PostgreSQL jika membutuhkan relasi kuat, reporting, dan transaksi kompleks.
  - Rekomendasi awal: Firestore untuk MVP, evaluasi Cloud SQL saat domain data makin kompleks.

- Storage:
  - Cloud Storage untuk audio/image assets.
  - Signed URL untuk akses file terbatas.

- AI:
  - Vertex AI / Gemini melalui backend service layer.
  - Prompt/version management.
  - Schema validation.
  - Caching.
  - Safety and moderation checks.

- Observability:
  - Cloud Logging.
  - Cloud Monitoring.
  - Error Reporting.
  - Request latency and error metrics.

- CI/CD:
  - GitHub Actions atau Cloud Build.
  - Build frontend.
  - Test backend.
  - Build container.
  - Push ke Artifact Registry.
  - Deploy Cloud Run.

### Target Architecture

```text
User Browser
  |
  | HTTPS
  v
Frontend Hosting
  |
  | API calls with auth token
  v
Cloud Run Backend API
  |       |        |        |
  |       |        |        +--> Secret Manager
  |       |        +----------> Firestore / Cloud SQL
  |       +-------------------> Cloud Storage
  +---------------------------> Vertex AI / Gemini
```

### Backend Service Boundaries

- `auth`: token verification and role extraction.
- `users`: profile and settings.
- `progress`: XP, streak, hearts, level.
- `learning`: units, topics, lessons, attempts.
- `dictionary`: lookup, save words, verified entries.
- `ai`: Gemini/Vertex AI abstraction.
- `community`: contribution lifecycle.
- `leaderboard`: weekly/all-time ranking.
- `subscriptions`: paket les inquiry.
- `admin`: protected management endpoints.
- `observability`: logs, metrics, audit events.

## 07 Timeline

Timeline ini estimasi untuk mengubah prototype menjadi MVP production-ready tanpa mengubah desain UI existing.

### Phase 0 - Stabilization & Cleanup (Week 1)

- Tambah `.gitignore`, lockfile, `tsconfig`, lint/test config.
- Fix import, naming type, scoring bug, Tailwind danger color, dan script `/index.js`.
- Hapus `.env.local` dari git tracking.
- Dokumentasikan env yang dibutuhkan.
- Pastikan frontend build berhasil.
- Pastikan backend start lokal berhasil.

### Phase 1 - Cloud-Ready Backend Foundation (Week 2)

- Ubah backend untuk Cloud Run: `PORT`, `0.0.0.0`, health endpoint.
- Tambah structured logging.
- Tambah input validation.
- Tambah error handler standar.
- Pisahkan file backend dari satu `server.js` besar menjadi module terstruktur.
- Tambah Dockerfile dan basic deployment config.

### Phase 2 - Auth, Roles, Database (Week 3-4)

- Integrasi Firebase Auth / Identity Platform.
- Backend token verification.
- Role admin/user.
- Setup Firestore atau Cloud SQL.
- Implement profile, progress, saved words, notifications.
- Migrasi state penting dari `localStorage` ke backend.

### Phase 3 - AI Service Layer (Week 5)

- Pindahkan AI calls dari frontend ke backend.
- Implement endpoint AI untuk lesson, dictionary, story, scan, pronunciation.
- Tambah prompt template dan schema validation.
- Tambah rate limit per user.
- Tambah caching dictionary/story.
- Tambah AI request metadata logging.

### Phase 4 - Functional Modules Completion (Week 6-7)

- Implement real lessons and attempts.
- Implement pre-test persistence.
- Implement leaderboard calculation.
- Implement community contribution moderation.
- Implement paket les inquiry persistence.
- Protect admin panel with backend role.

### Phase 5 - Production Readiness (Week 8)

- CI/CD pipeline.
- Secret Manager.
- Cloud Run deployment.
- Monitoring and alerting.
- Basic automated tests.
- Security review.
- MVP release checklist.

### Phase 6 - Post-MVP Enhancements

- Spaced repetition.
- Native speaker audio library.
- Advanced admin analytics.
- Payment/booking workflow.
- Content review workflow with AI assist.
- Offline-friendly caching.
- Multi-dialect support.

## 08 Scope & Deliverables

### In Scope

- Mempertahankan UI existing.
- Memperbaiki bug teknis yang menghambat build/runtime.
- Menyiapkan project agar siap deploy ke Google Cloud.
- Mengganti mock auth dengan auth nyata.
- Menambahkan backend/database untuk data user dan progress.
- Memindahkan AI integration ke backend.
- Menambahkan role admin dan proteksi admin route.
- Menambahkan persistence untuk modul inti.
- Menambahkan observability, CI/CD, dan secret management.

### Out of Scope for Initial MVP

- Redesign UI halaman existing.
- Mengubah visual identity HabaGet.
- Payment gateway penuh.
- Mobile native app.
- Realtime multiplayer/social feed.
- Advanced LMS authoring tool.
- Sertifikat resmi.
- Full offline mode.

### Deliverables Phase 0

- README blueprint ini.
- `.gitignore`.
- Lockfile.
- TypeScript config.
- Lint/test baseline.
- Build frontend hijau.
- Backend start lokal hijau.
- Bug import/type/scoring/index fixed.

### Deliverables Phase 1

- Backend module structure.
- Cloud Run compatible server.
- Health endpoint.
- Dockerfile.
- Env documentation.
- Structured error response.
- Structured logging.

### Deliverables Phase 2

- Auth provider configured.
- Backend auth middleware.
- User/profile persistence.
- Role-based admin protection.
- Progress persistence.
- Saved words persistence.

### Deliverables Phase 3

- AI backend endpoints.
- Prompt templates.
- Schema validators.
- Rate limit.
- AI cache strategy.
- Error handling for AI failures.

### Deliverables Phase 4

- Lessons stored and tracked.
- Pre-test stored.
- Leaderboard real data.
- Community contribution moderation.
- Paket les inquiry tracking.
- Admin panel connected to backend.

### Deliverables Phase 5

- CI/CD workflow.
- Cloud Run deployment.
- Secret Manager integration.
- Monitoring dashboard.
- Release checklist.
- Basic production runbook.

## MVP Release Checklist

- Frontend build passes.
- Backend starts locally and in Cloud Run.
- No secret file tracked in git.
- Auth works for user/admin.
- Admin route protected.
- User progress persists after logout/login.
- AI calls go through backend.
- Rate limit active.
- Database security rules or backend authorization active.
- Error logs visible in Cloud Logging.
- README and env docs updated.
