# HabaGet — Project Brief

---

## 1. Ringkasan Eksekutif

**HabaGet** adalah platform edukasi digital berbasis AI untuk belajar Bahasa Aceh yang menggabungkan gamifikasi, kecerdasan buatan, dan kontribusi komunitas. Nama "HabaGet" berasal dari kata Aceh "Haba" (kabar/bahasa) dan "Get" (bagus/baik), dengan tagline **"Meureuno Bahasa Makin Get"** (Belajar Bahasa Makin Bagus).

Aplikasi ini menjawab kebutuhan pelestarian dan pembelajaran Bahasa Aceh yang selama ini kurang memiliki media digital modern, interaktif, dan mudah diakses oleh generasi muda.

---

## 2. Latar Belakang & Masalah

### Masalah yang Diselesaikan

1. **Bahasa Aceh terancam punah secara digital** — generasi muda lebih terpapar bahasa Indonesia dan Inggris, sementara materi Bahasa Aceh sangat terbatas di platform digital.

2. **Tidak ada platform belajar Bahasa Aceh yang modern** — materi yang ada tersebar, tidak interaktif, dan tidak memiliki konteks budaya atau pengucapan.

3. **Kurangnya motivasi belajar** — tanpa gamifikasi, progress tracking, dan komunitas, pelajar cepat kehilangan minat.

4. **Keterbatasan akses ke penutur asli** — tidak semua orang punya akses ke guru atau penutur asli Bahasa Aceh untuk validasi pengucapan dan pemahaman.

### Peluang

- 5+ juta penutur Bahasa Aceh di Indonesia
- Tren global pelestarian bahasa daerah melalui teknologi
- Ketersediaan AI generatif (Gemini/Vertex AI) untuk konten edukatif
- Dukungan pemerintah daerah untuk pelestarian budaya Aceh
- Pasar les privat Bahasa Aceh yang belum terdigitalisasi

---

## 3. Visi & Misi

### Visi
Menjadi platform digital utama untuk belajar, melestarikan, dan mengembangkan Bahasa Aceh dengan bantuan AI dan partisipasi komunitas.

### Misi
1. Menyediakan pengalaman belajar Bahasa Aceh yang menyenangkan dan efektif melalui gamifikasi.
2. Memanfaatkan AI untuk menghasilkan konten edukatif yang akurat dan kontekstual.
3. Membangun komunitas kontributor untuk memperkaya dan memvalidasi kosakata.
4. Menyediakan layanan les/tutoring yang terstruktur dan terjangkau.
5. Melestarikan hikayat, ungkapan, dan budaya Aceh dalam format digital modern.

---

## 4. Target Pengguna

### Segmen Primer

| Segmen | Deskripsi | Kebutuhan |
|--------|-----------|-----------|
| **Pelajar Muda (15-25)** | Mahasiswa, siswa SMA/SMK di Aceh dan perantauan | Belajar bahasa daerah dengan cara modern dan menyenangkan |
| **Perantau Aceh (25-45)** | Orang Aceh yang tinggal di luar daerah | Mempertahankan kemampuan bahasa dan mengajarkan ke anak |
| **Pecinta Budaya (20-50)** | Non-Aceh yang tertarik budaya dan bahasa Aceh | Belajar dari nol dengan panduan AI |

### Segmen Sekunder

| Segmen | Deskripsi |
|--------|-----------|
| **Guru/Tutor** | Pengajar Bahasa Aceh yang butuh platform digital |
| **Peneliti** | Akademisi linguistik dan budaya Aceh |
| **Instansi Pemerintah** | Dinas Pendidikan dan Kebudayaan Aceh |

---

## 5. Fitur Utama

### Modul Pembelajaran

| Fitur | Deskripsi | Status |
|-------|-----------|--------|
| **Learning Path** | 6 unit, 30 topik dengan progress unlock bertahap | ✅ Live |
| **AI Lesson Generation** | Soal pilihan ganda di-generate Gemini per topik | ✅ Live |
| **Bonus Quiz** | Soal isian (non-pilihan ganda) untuk double/triple XP | ✅ Live |
| **Pre-test Penempatan** | Tes awal untuk menentukan level | ✅ Live |
| **Latihan Pengucapan** | Rekam suara → AI evaluasi aksen dan skor | ✅ Live |

### Modul Kamus & Konten

| Fitur | Deskripsi | Status |
|-------|-----------|--------|
| **AI Dictionary** | Terjemahan Indonesia ↔ Aceh dengan nuansa budaya | ✅ Live |
| **Dictionary Cache** | Hemat quota AI dengan caching Firestore | ✅ Live |
| **Hikayat/Cerita** | Generate cerita pendek Aceh dengan AI | ✅ Live |
| **Gemini TTS** | Text-to-speech menggunakan model Gemini | ✅ Live |
| **Scan Teks** | OCR + terjemahan dari foto | ✅ Live |

### Modul Gamifikasi

| Fitur | Deskripsi | Status |
|-------|-----------|--------|
| **XP & Level** | 100 XP per level, tracking real-time | ✅ Live |
| **Streak** | Hitung hari berturut-turut belajar | ✅ Live |
| **Hearts** | 5 nyawa, berkurang saat jawab salah | ✅ Live |
| **Leaderboard** | Ranking mingguan dan sepanjang waktu (real) | ✅ Live |
| **Lencana** | 4 tier: Aneuk Miet, Ureung Muda, Ureung Chiek, Petuah | ✅ Live |

### Modul Komunitas & Layanan

| Fitur | Deskripsi | Status |
|-------|-----------|--------|
| **Kontribusi Kosakata** | User submit kata baru → admin moderasi | ✅ Live |
| **Paket Les** | Kelas anak, dewasa, privat via WhatsApp | ✅ Live |
| **Admin Panel** | Dashboard, kelola pengguna, moderasi kontribusi | ✅ Live |

---

## 6. Teknologi

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS |
| Backend | Node.js, Express 5, WebSocket |
| AI | Google Vertex AI / Gemini 2.5 Flash, Gemini TTS |
| Auth | Firebase Authentication (Email/Password + Google) |
| Database | Cloud Firestore |
| Hosting | Google Cloud Run (asia-southeast1) |
| CI/CD | Cloud Build + Dockerfile multi-stage |

---

## 7. Metrik Keberhasilan (KPI)

| Metrik | Target 3 Bulan | Target 6 Bulan |
|--------|---------------|---------------|
| Registered Users | 500 | 2.000 |
| Daily Active Users (DAU) | 50 | 200 |
| Lessons Completed/Day | 100 | 500 |
| Dictionary Searches/Day | 200 | 1.000 |
| Community Contributions | 100 kata | 500 kata |
| Pendaftar Les | 20 | 50 |
| User Retention (D7) | 30% | 40% |
| Average Session Duration | 5 menit | 8 menit |

---

## 8. Roadmap

### Q3 2026 (Juli - September)
- Spaced repetition untuk review kata
- Daily missions (3 misi harian)
- Admin panel real (Firestore data)
- Offline mode (Service Worker)
- PWA support (install di homescreen)

### Q4 2026 (Oktober - Desember)
- Native speaker audio library
- Multi-dialect support (Banda Aceh, Pidie, Aceh Utara)
- Payment integration untuk paket les
- Advanced admin analytics
- Content moderation AI-assisted

### Q1 2027 (Januari - Maret)
- Mobile app (React Native atau Flutter)
- AI Chat Tutor (percakapan bebas)
- Sertifikat digital penyelesaian level
- Partnership dengan Dinas Pendidikan Aceh
- Monetisasi premium features

---

## 9. Tim & Peran

| Peran | Tanggung Jawab |
|-------|---------------|
| Product Owner | Visi produk, prioritas fitur, stakeholder management |
| Full-stack Developer | Frontend, backend, deployment, AI integration |
| UI/UX Designer | Desain interface, user research, prototyping |
| Content Creator | Materi Bahasa Aceh, validasi linguistik |
| Community Manager | Moderasi kontribusi, engagement pengguna |

---

## 10. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Biaya AI membengkak | Tinggi | Rate limit, daily quota, caching, budget alert |
| Konten AI tidak akurat | Sedang | Moderasi komunitas, validasi penutur asli |
| User retention rendah | Tinggi | Gamifikasi, streak, daily missions, notifikasi |
| Keterbatasan trial credits | Tinggi | Optimasi caching, max-instances, monitoring |
| Kompetitor muncul | Rendah | First-mover advantage, komunitas loyal |

---

## 11. URL & Akses

| Item | Detail |
|------|--------|
| Production URL | https://habaget-944212261019.asia-southeast1.run.app |
| GCP Project | probable-force-311023 |
| Admin Email | yudhae@gmail.com |
| Firebase Console | https://console.firebase.google.com/project/probable-force-311023 |
| Cloud Run Console | https://console.cloud.google.com/run?project=probable-force-311023 |
