export interface ContextData {
  type: string // concept_update | formula_detected | topic_changed | ...
  concept: string
  summary: string
  keywords: string[]
  formula?: string
}

export interface ContextUpdateEvent {
  event: string
  sessionId: string
  sequence: number // sequence transkrip yang memicu konteks ini
  timestamp: string
  data: ContextData
}

export interface ContextItem extends ContextUpdateEvent {
  id: string
  source?: string // kalimat pemicu, disalin saat catatan dibuat (caption lama boleh terhapus)
}

export interface CaptionLine {
  id: string
  seq: number
  text: string
  at: number
}

export type ConnStatus = 'idle' | 'connecting' | 'online' | 'reconnecting' | 'demo'
