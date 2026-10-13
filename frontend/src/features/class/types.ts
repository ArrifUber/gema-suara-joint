export interface ClassItem {
  id: string
  name: string
  lecturer: string
  day: number // 0 = Minggu … 6 = Sabtu (sama dengan Date.getDay)
  start: string // "08:00"
  end: string
  topic: string
  accent: string
  liveSessionId: string | null // terisi selama murid menjalankan sesi untuk kelas ini
  createdAt: number
}

export type NewClass = Pick<ClassItem, 'name' | 'lecturer' | 'day' | 'start' | 'end' | 'topic'>
