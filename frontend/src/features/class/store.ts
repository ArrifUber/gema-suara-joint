import { create } from 'zustand'
import { classApi } from './api'
import type { ClassItem, NewClass } from './types'

interface ClassState {
  classes: ClassItem[]
  ready: boolean
  load: () => Promise<void>
  add: (input: NewClass) => Promise<ClassItem>
  remove: (id: string) => Promise<void>
  setLive: (id: string, sessionId: string | null) => void
}

export const useClassStore = create<ClassState>((set) => ({
  classes: [],
  ready: false,
  load: async () => set({ classes: await classApi.list(), ready: true }),
  add: async (input) => {
    const item = await classApi.create(input)
    set((s) => ({ classes: [...s.classes, item] }))
    return item
  },
  remove: async (id) => {
    await classApi.remove(id)
    set((s) => ({ classes: s.classes.filter((c) => c.id !== id) }))
  },
  setLive: (id, sessionId) => {
    void classApi.setLive(id, sessionId)
    set((s) => ({ classes: s.classes.map((c) => (c.id === id ? { ...c, liveSessionId: sessionId } : c)) }))
  },
}))
