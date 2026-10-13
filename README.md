# GemaSuara — Platform Pembelajaran Inklusif

---

## 📑 Daftar Isi
1. [Arsitektur & Tech Stack](#-arsitektur--tech-stack)
2. [Prasyarat Sistem](#-prasyarat-sistem)
3. [Struktur Direktori](#-struktur-direktori)
4. [Langkah-Langkah Menjalankan](#-langkah-langkah-menjalankan)
   - [1. Menjalankan Database PostgreSQL](#1-menjalankan-database-postgresql)
   - [2. Menjalankan Backend (Go)](#2-menjalankan-backend-go)
   - [3. Menjalankan Frontend (Next.js)](#3-menjalankan-frontend-nextjs)
5. [Mode Demo (Uji Coba Tanpa Backend)](#-mode-demo-uji-coba-tanpa-backend)
6. [Daftar Endpoint API & Realtime](#-daftar-endpoint-api--realtime)
7. [Variabel Lingkungan (Environment Variables)](#-variabel-lingkungan-environment-variables)
8. [Troubleshooting & Catatan Penting](#-troubleshooting--catatan-penting)

---

## 🛠 Arsitektur & Tech Stack

- **Frontend (`/frontend`)**:
  - **Framework**: Next.js (App Router), React 19, TypeScript
  - **Styling**: Tailwind CSS v4
  - **State Management**: Zustand
  - **Audio & Speech**: Web Speech API (SpeechRecognition)
  - **Port Default**: `http://localhost:3000`

- **Backend (`/backend`)**:
  - **Bahasa & Framework**: Go 1.23+ / 1.26, Gin Web Framework
  - **Dependency Injection**: `github.com/samber/do`
  - **ORM**: GORM (dengan PostgreSQL driver)
  - **Realtime**: Gorilla WebSocket Hub
  - **AI Engine**: Google Gemini API (`AI_PROVIDER=gemini`) atau Mock Engine (`AI_PROVIDER=mock`)
  - **Port Default**: `http://localhost:8080`

- **Database**:
  - PostgreSQL 17 (dijalankan via Docker Compose)

---

## 📋 Prasyarat Sistem

Sebelum memulai, pastikan perangkat Anda telah terpasang:
- **Node.js**: Versi `18.x` atau `20.x+` dan **npm**
- **Go**: Versi `1.23+` (atau versi Go yang kompatibel)
- **Docker & Docker Compose**: Untuk menjalankan PostgreSQL dengan cepat
- **Browser**: **Google Chrome** atau **Microsoft Edge** (sangat direkomendasikan karena Web Speech API bekerja paling optimal pada browser berbasis Chromium)

---

## 📁 Struktur Direktori

```text
gema-suara-joints/
├── backend/                  # REST API & WebSocket Realtime Server (Go)
│   ├── cmd/main.go           # Entry point server backend
│   ├── config/               # Manajemen konfigurasi environment
│   ├── modules/              # Modul domain (session, transcript, context)
│   ├── pkg/                  # WebSocket hub, AI context engine, dsb.
│   ├── docker-compose.yaml   # Docker compose untuk PostgreSQL
│   ├── .env.example          # Template konfigurasi backend
│   └── go.mod
├── frontend/                 # Aplikasi Web Client (Next.js)
│   ├── src/
│   │   ├── app/              # Routing App Router
│   │   ├── features/         # Fitur utama (session, class, home, profile)
│   │   └── shared/           # Komponen & utilitas bersama
│   ├── .env.example          # Template konfigurasi frontend
│   └── package.json
└── README.md                 # Panduan utama proyek
```

---

## 🚀 Langkah-Langkah Menjalankan

Ikuti urutan di bawah ini untuk menjalankan sistem secara penuh:

### 1. Menjalankan Database PostgreSQL

Jalankan container PostgreSQL menggunakan Docker Compose:

```bash
# Dari root proyek, jalankan:
docker compose -f backend/docker-compose.yaml up -d
```

> **Verifikasi**: Pastikan database berjalan dengan mengecek:
> ```bash
> docker ps
> ```
> Container `joints-database` seharusnya aktif di port `5432`.

---

### 2. Menjalankan Backend (Go)

Buka terminal baru dan masuk ke direktori `backend`:

```bash
cd backend
```

#### A. Siapkan File Konfigurasi `.env`
Salin template konfigurasi:
- **Linux / macOS**:
  ```bash
  cp .env.example .env
  ```
- **Windows (PowerShell)**:
  ```powershell
  Copy-Item .env.example .env
  ```

Isi konfigurasi `.env` sesuai kebutuhan:
```env
APP_ENV=development
APP_PORT=8080

# Koneksi ke PostgreSQL
DATABASE_URL=postgres://postgres:password@localhost:5432/joints_be?sslmode=disable

DB_PORT=5432
DB_USER=postgres
DB_PASS=password
DB_NAME=joints_be

# Interval pemrosesan AI worker
CONTEXT_RECENT_CHUNKS=5
CONTEXT_WORKER_INTERVAL=1s

# Pilihan AI: "mock" (tanpa API key) atau "gemini"
AI_PROVIDER=mock
AI_API_KEY=your_gemini_api_key_here
AI_MODEL=gemini-3.5-flash

WEBSOCKET_MAX_CONNECTIONS=100
```
> 💡 *Tip*: Jika belum memiliki Google Gemini API Key, Anda dapat menyetel `AI_PROVIDER=mock`. Backend akan mensimulasikan catatan konsep otomatis tanpa memanggil API eksternal.

#### B. Unduh Dependencies & Jalankan Server
```bash
# Unduh dependency modul Go
go mod download

# Jalankan server
go run cmd/main.go
```

> Saat pertama kali dijalankan dalam mode `development`, GORM akan otomatis membuat tabel database (*auto-migration*).
> Backend berhasil berjalan jika muncul log:
> `[main] server starting on port 8080 (env: development)`

Untuk mengecek kesehatan backend, buka: `http://localhost:8080/health` (menghasilkan `{"status":"ok"}`).

---

### 3. Menjalankan Frontend (Next.js)

Buka terminal terpisah dan masuk ke direktori `frontend`:

```bash
cd frontend
```

#### A. Siapkan File Konfigurasi `.env.local`
Salin template konfigurasi:
- **Linux / macOS**:
  ```bash
  cp .env.example .env.local
  ```
- **Windows (PowerShell)**:
  ```powershell
  Copy-Item .env.example .env.local
  ```

Isi `.env.local`:
```env
# URL API Backend & WebSocket
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws

# Set false agar terhubung ke backend Go
NEXT_PUBLIC_DEMO_MODE=false
```

#### B. Install Dependency & Jalankan Frontend
```bash
# Install paket Node.js
npm install

# Jalankan mode pengembangan
npm run dev
```

Buka aplikasi:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🎮 Mode Demo (Uji Coba Tanpa Backend)

Jika ingin mendemonstrasikan atau menguji tampilan frontend tanpa menyalakan backend dan database PostgreSQL:

1. Di file `frontend/.env.local`, ubah:
   ```env
   NEXT_PUBLIC_DEMO_MODE=true
   ```
2. Jalankan `npm run dev` di direktori `frontend`.
3. Buka halaman kelas, lalu klik tombol **"Putar demo"** untuk memutar skenario kelas interaktif dengan transkrip dan kartu konsep lokal tanpa memerlukan mikrofon atau server eksternal.

---

## 📡 Daftar Endpoint API & Realtime

| Protokol | Method | Endpoint | Deskripsi |
|---|---|---|---|
| **HTTP** | `GET` | `/health` | Pemeriksaan status server |
| **HTTP** | `POST` | `/api/v1/sessions` | Membuat sesi perkuliahan baru |
| **HTTP** | `GET` | `/api/v1/sessions/:id` | Mengambil detail status sesi |
| **HTTP** | `POST` | `/api/v1/sessions/:id/transcripts` | Mengirim kalimat transkrip STT |
| **HTTP** | `GET` | `/api/v1/sessions/:id/transcripts` | Mengambil riwayat transkrip sesi |
| **HTTP** | `GET` | `/api/v1/sessions/:id/contexts` | Mengambil riwayat catatan konsep |
| **WS** | `GET` | `/ws/sessions/:id` | Sambungan WebSocket event `context_update` |

---

## ⚙️ Variabel Lingkungan (Environment Variables)

### Backend (`backend/.env`)
| Variabel | Default | Penjelasan |
|---|---|---|
| `APP_ENV` | `development` | Mode aplikasi (`development` / `production`) |
| `APP_PORT` | `8080` | Port HTTP REST & WebSocket |
| `DATABASE_URL` | - | PostgreSQL Connection String |
| `CONTEXT_WORKER_INTERVAL` | `1s` | Frekuensi worker menganalisis transkrip baru |
| `CONTEXT_RECENT_CHUNKS` | `5` | Jumlah kalimat terakhir yang dikirim ke LLM |
| `AI_PROVIDER` | `mock` | Penyedia AI: `mock` atau `gemini` |
| `AI_API_KEY` | - | API Key Google Gemini (jika menggunakan `gemini`) |
| `AI_MODEL` | `gemini-3.5-flash` | Versi model AI yang digunakan |

### Frontend (`frontend/.env.local`)
| Variabel | Default | Penjelasan |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/api/v1` | URL base REST API |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:8080/ws` | URL endpoint WebSocket server |
| `NEXT_PUBLIC_DEMO_MODE` | `false` | `true` = mode offline/lokal tanpa server |