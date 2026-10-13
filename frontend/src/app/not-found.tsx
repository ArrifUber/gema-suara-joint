import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <h1 className="text-2xl font-bold">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-base text-mute">Alamat yang kamu buka tidak ada atau sudah dipindahkan.</p>
        <Link href="/" className="mt-5 inline-flex h-12 items-center rounded-lg bg-gold px-6 text-base font-semibold text-ink">Kembali ke Beranda</Link>
      </div>
    </div>
  )
}
