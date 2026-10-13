import type { ClassItem } from './types'

export function namaHari(day: number) {
  // 7 Jan 2024 adalah hari Minggu, jadi 7 + day cocok dengan Date.getDay()
  return new Date(2024, 0, 7 + day).toLocaleDateString('id-ID', { weekday: 'long' })
}

const titik = (t: string) => t.replace(':', '.')

export function formatJadwal(c: Pick<ClassItem, 'day' | 'start' | 'end'>) {
  return `${namaHari(c.day)} · ${titik(c.start)}–${titik(c.end)}`
}
