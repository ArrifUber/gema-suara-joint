import type { ContextData, ContextUpdateEvent } from './types'

/**
 * Pengganti context engine di mode demo (tanpa server/LLM).
 * Bentuk keluarannya SAMA dengan payload WebSocket, jadi UI tidak perlu tahu bedanya.
 */
const aturan: { test: RegExp; data: ContextData }[] = [
  {
    test: /hukum (iii|3|tiga|ketiga)\b|aksi.*reaksi/i,
    data: { type: 'concept_update', concept: 'Hukum III Newton', summary: 'Setiap aksi menimbulkan reaksi yang sama besar dan berlawanan arah.', keywords: ['aksi', 'reaksi', 'gaya'], formula: 'F aksi = −F reaksi' },
  },
  {
    test: /hukum (ii|2|dua|kedua)\b|percepatan|f\s*=\s*m/i,
    data: { type: 'formula_detected', concept: 'Hukum II Newton', summary: 'Percepatan sebanding dengan gaya total dan berbanding terbalik dengan massa.', keywords: ['gaya', 'massa', 'percepatan'], formula: 'F = m × a' },
  },
  {
    test: /hukum (i|1|satu|pertama)\b|inersia|lembam/i,
    data: { type: 'concept_update', concept: 'Hukum I Newton', summary: 'Benda diam tetap diam dan benda bergerak tetap bergerak lurus beraturan bila tidak ada gaya total.', keywords: ['inersia', 'gaya total'], formula: 'ΣF = 0' },
  },
  {
    test: /dinamika/i,
    data: { type: 'topic_changed', concept: 'Dinamika Gerak', summary: 'Cabang fisika yang mempelajari penyebab benda bergerak atau berubah geraknya.', keywords: ['gerak', 'gaya'] },
  },
  {
    test: /rekam|persetujuan|izin/i,
    data: { type: 'concept_update', concept: 'Etika wawancara', summary: 'Wawancara perlu persetujuan narasumber sebelum direkam.', keywords: ['persetujuan', 'rekaman', 'narasumber'] },
  },
  {
    test: /catatan lapangan|nonverbal/i,
    data: { type: 'concept_update', concept: 'Catatan lapangan', summary: 'Catatan lapangan membantu menangkap situasi nonverbal yang tidak terekam.', keywords: ['catatan lapangan', 'nonverbal'] },
  },
  {
    test: /kualitatif|wawancara|konteks|pengalaman/i,
    data: { type: 'concept_update', concept: 'Penelitian kualitatif', summary: 'Menekankan pemahaman konteks dan pengalaman partisipan, bukan hanya pengumpulan data.', keywords: ['konteks', 'pengalaman', 'partisipan'] },
  },
]

export const contextKey = (d: ContextData) => d.concept + (d.formula ?? '')

export function localContext(text: string, sequence: number, lastKey: string): ContextUpdateEvent | null {
  const hit = aturan.find((r) => r.test.test(text))
  if (!hit) return null
  if (contextKey(hit.data) === lastKey) return null // setara "no_change" di server
  return { event: 'context_update', sessionId: 'demo', sequence, timestamp: new Date().toISOString(), data: hit.data }
}
