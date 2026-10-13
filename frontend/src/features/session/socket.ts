import type { ConnStatus, ContextUpdateEvent } from './types'

interface Handlers {
  onEvent: (e: ContextUpdateEvent) => void
  onStatus: (s: ConnStatus) => void
}

/** WebSocket dengan sambung ulang otomatis (exponential backoff + jitter). */
export class SessionSocket {
  private ws: WebSocket | null = null
  private percobaan = 0
  private timer: ReturnType<typeof setTimeout> | null = null
  private ditutup = false

  constructor(private url: string, private h: Handlers) {}

  connect() {
    this.ditutup = false
    this.h.onStatus(this.percobaan === 0 ? 'connecting' : 'reconnecting')
    const ws = new WebSocket(this.url)
    this.ws = ws

    ws.onopen = () => {
      this.percobaan = 0
      this.h.onStatus('online')
    }
    ws.onmessage = (msg) => {
      try {
        const payload = JSON.parse(msg.data) as ContextUpdateEvent
        if (payload.event === 'context_update' && payload.data) this.h.onEvent(payload)
      } catch {
        /* abaikan frame yang bukan JSON */
      }
    }
    ws.onclose = () => {
      if (this.ditutup) return
      this.h.onStatus('reconnecting')
      const jeda = Math.min(1000 * 2 ** this.percobaan++, 10000) + Math.random() * 400
      this.timer = setTimeout(() => this.connect(), jeda)
    }
    ws.onerror = () => ws.close()
  }

  close() {
    this.ditutup = true
    if (this.timer) clearTimeout(this.timer)
    this.ws?.close()
    this.ws = null
  }
}
