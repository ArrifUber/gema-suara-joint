# GemaSuara — Frontend (Next.js)

Caption langsung + catatan konsep untuk mahasiswa tunarungu. Next.js (App Router) · React 19 · TypeScript · Tailwind v4 · Zustand.
Seluruh teks antarmuka ditulis langsung dalam bahasa Indonesia.

## Menjalankan
```bash
npm install
cp .env.example .env.local   # sesuaikan URL backend
npm run dev                  # http://localhost:3000
npm run build && npm start   # mode produksi
```
Web Speech API paling stabil di **Chrome / Edge** dan butuh internet. Mikrofon hanya jalan di `https://` atau `localhost`.

## Struktur (per domain, App Router)
```
src/
  app/                    # hanya routing; tiap page memanggil layar dari features/
    (main)/               #   Beranda, Kelas, Profil (sidebar di desktop / navigasi bawah di mobile)
    (sesi)/kelas/[id]/live#   layar sesi penuh
    masuk/
    error.tsx, not-found.tsx, layout.tsx   # konvensi App Router (metadata, batas error, 404)
  features/
    home/                 # HomeScreen, TodayClassItem
    class/                # ClassScreen, ClassCard, ClassFormDialog, store, api (data kelas), format, types
    session/              # SessionScreen, CaptionFeed, NotesPanel, use-live-session, store, api, socket,
                          # transcript-queue, snapshot, local-context, demo-scripts, use-speech-recognition
    profile/              # ProfileScreen, store
    welcome/              # WelcomeScreen
  shared/                 # hanya yang dipakai lintas domain: Shell, Nav, Icons, SearchField, AppGate, config
```

## Skala tipografi
Ukuran teks memakai kelas Tailwind di tiap komponen (tidak ada `font-size` global di `html`). Pakai skala ini agar tetap konsisten:

| Peran | Kelas |
|---|---|
| Sapaan (display) | `text-4xl font-bold lg:text-5xl` |
| H1 — judul layar | `text-2xl font-bold` |
| H2 — judul bagian / dialog | `text-xl font-semibold` |
| H3 — judul kartu / item | `text-lg font-semibold` |
| Isi, tombol, input | `text-base` |
| Keterangan (meta) | `text-sm text-mute` |
| Badge & label kapital | `text-xs` (LIVE, jenis catatan, "CAPTION LANGSUNG") |
| Caption | `.caption-text` — ukurannya diatur murid di halaman Profil |

## Alur data (searah: dosen → murid)
```
Mic → Web Speech API → caption langsung (teks sementara tampil seketika)
        └─ kalimat final → POST /sessions/:id/transcripts (sequence naik berurutan)
Backend (LLM) → WebSocket context_update → "Catatan penting" (append-only, tidak hilang)
```
- **Caption terbatas**: hanya `MAX_CAPTION_LINES` kalimat terbaru yang disimpan di memori dan salinan lokal (`features/session/store.ts`). Server tetap menyimpan seluruh transkrip.
- **Catatan permanen**: tiap `context_update` ditambahkan sebagai kartu baru dan menyimpan kalimat pemicunya (tombol *Lihat kalimat*), jadi tetap utuh walau caption lamanya sudah hilang. Penanda di caption membuka kartu catatannya.
- **Tahan muat ulang**: sesi per kelas disimpan di localStorage (caption terbaru + semua catatan) dan disinkronkan dari `GET …/transcripts` dan `…/contexts` bila server tersedia. Sesi baru dibuat saat murid menekan *Mulai mendengarkan*.
- **Mode demo**: bila server tidak terjangkau (atau `NEXT_PUBLIC_DEMO_MODE=true`), konteks dibuat lokal oleh `features/session/local-context.ts` dengan bentuk data yang sama dengan payload WebSocket. Tombol *Putar demo* memutar skenario kelas tanpa mikrofon.
- **Kelas**: dibuat sendiri oleh murid lewat `features/class/api.ts` (saat ini localStorage). Untuk pindah ke backend, ganti isi 4 fungsi di file itu dengan `fetch`; UI tidak berubah.

## Environment
| Variable | Contoh | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.contoh.com/api/v1` | Wajib `https` di production |
| `NEXT_PUBLIC_WS_URL` | `wss://api.contoh.com/ws` | Wajib `wss` di production |
| `NEXT_PUBLIC_DEMO_MODE` | `false` | `true` = tanpa server |

Variabel `NEXT_PUBLIC_*` ditanam saat build, jadi **redeploy** setelah mengubahnya.

## Deploy ke Vercel
Import repo → Framework Preset otomatis *Next.js* → isi tiga variabel di atas → Deploy. Tidak perlu `vercel.json`.
Server Go + WebSocket **tidak** cocok di Vercel serverless: deploy di Railway / Render / Fly.io / VPS, lalu pastikan
CORS mengizinkan `POST` JSON (termasuk preflight `OPTIONS`) dan `CheckOrigin` WebSocket mengizinkan domain frontend.

## Transparansi AI
Context engine di backend memakai LLM. Frontend ini dibuat dengan bantuan Claude.
