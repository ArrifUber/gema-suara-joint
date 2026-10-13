'use client'

import { useRouter } from 'next/navigation'
import { CAPTION_SIZES, useProfileStore } from './store'

export default function ProfileScreen() {
  const router = useRouter()
  const { name, captionSize, setName, setCaptionSize } = useProfileStore()

  return (
    <div className="mx-auto max-w-xl">
      <div className="flex flex-col items-center pt-6">
        <div className="grid h-24 w-24 place-items-center rounded-full bg-gold text-4xl font-bold text-ink" aria-hidden>{name.slice(0, 1).toUpperCase()}</div>
        <p className="mt-2 text-base text-mute">@{name.toLowerCase().replace(/\s+/g, '')}</p>
      </div>

      <h2 className="mb-2 mt-8 text-xl font-semibold">Akun</h2>
      <label className="flex items-center justify-between border-b border-line py-3 text-base">
        <span className="text-mute">Nama</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-48 bg-transparent text-right outline-none focus:text-gold" />
      </label>

      <h2 className="mb-2 mt-7 text-xl font-semibold">Tampilan</h2>
      <div className="border-b border-line py-3">
        <p className="mb-2 text-base text-mute" id="ukuran-caption">Ukuran teks caption</p>
        <div role="radiogroup" aria-labelledby="ukuran-caption" className="grid grid-cols-4 gap-2">
          {CAPTION_SIZES.map((_, i) => (
            <button key={i} role="radio" aria-checked={captionSize === i} aria-label={`Ukuran ${i + 1}`} onClick={() => setCaptionSize(i)}
              className={`h-11 rounded-lg border font-semibold ${captionSize === i ? 'border-gold bg-gold text-ink' : 'border-line bg-panel'}`} style={{ fontSize: 12 + i * 4 }}>A</button>
          ))}
        </div>
      </div>

      <button onClick={() => { setName(''); router.replace('/masuk') }} className="mt-8 h-12 w-full rounded-xl bg-line text-base font-semibold">Keluar</button>
    </div>
  )
}
