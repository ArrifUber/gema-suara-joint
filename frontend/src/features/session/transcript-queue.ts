import { ApiError, sessionApi } from './api'

const tunggu = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Antrean kirim chunk STT: dikirim satu per satu supaya urutan sequence di server terjaga.
 * Status 409 (sudah tercatat) diabaikan, error 4xx lain tidak di-retry.
 */
export class TranscriptQueue {
  private chain: Promise<void> = Promise.resolve()

  constructor(
    private sessionId: string,
    private onLatency: (ms: number) => void,
    private onError: () => void,
  ) {}

  /** Sequence ditentukan pemanggil supaya cocok dengan nomor baris caption. */
  push(sequence: number, text: string) {
    this.chain = this.chain.then(() => this.send(sequence, text))
  }

  idle() {
    return this.chain
  }

  private async send(sequence: number, text: string) {
    for (let percobaan = 0; percobaan < 3; percobaan++) {
      try {
        const t0 = performance.now()
        await sessionApi.sendTranscript(this.sessionId, sequence, text)
        this.onLatency(Math.round(performance.now() - t0))
        return
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.status === 409) return
          if (e.status >= 400 && e.status < 500) break // salah di sisi klien, retry percuma
        }
        await tunggu(500 * (percobaan + 1))
      }
    }
    this.onError()
  }
}
