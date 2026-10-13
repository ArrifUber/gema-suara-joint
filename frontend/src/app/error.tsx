'use client'

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <h1 className="text-2xl font-bold">Terjadi kesalahan</h1>
        <p className="mt-2 text-base text-mute">Halaman gagal dimuat. Caption dan catatan yang sudah tersimpan tidak hilang.</p>
        <button onClick={reset} className="mt-5 h-12 rounded-lg bg-gold px-6 text-base font-semibold text-ink">Coba lagi</button>
      </div>
    </div>
  )
}
