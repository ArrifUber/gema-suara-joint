import { API_URL } from '@/shared/lib/config'
import type { ContextData } from './types'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

interface Envelope<T> {
  meta: { success: boolean; message: string }
  data: T
  errors?: unknown
}

async function request<T>(path: string, init?: RequestInit, timeoutMs = 8000): Promise<T> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      signal: ctrl.signal,
    })
    const json = (await res.json().catch(() => null)) as Envelope<T> | null
    if (!res.ok) throw new ApiError(res.status, json?.meta?.message ?? `HTTP ${res.status}`)
    return json?.data as T
  } finally {
    clearTimeout(timer)
  }
}

export interface SessionDto {
  id: string
  subject: string
  topic: string
  subtopic: string
  status: string
}

export interface TranscriptDto {
  id: string
  sessionId: string
  sequence: number
  text: string
  status: string
  createdAt?: string
}

export interface ContextDto {
  id: string
  sessionId: string
  sequence: number
  type: string
  data: ContextData
  createdAt: string
}

export const sessionApi = {
  create: (body: { subject: string; topic: string; subtopic: string }) =>
    request<SessionDto>('/sessions', { method: 'POST', body: JSON.stringify(body) }),
  get: (id: string) => request<SessionDto>(`/sessions/${id}`),
  complete: (id: string) => request<SessionDto>(`/sessions/${id}/complete`, { method: 'POST' }),
  getTranscripts: (id: string) => request<TranscriptDto[]>(`/sessions/${id}/transcripts`),
  getContexts: (id: string) => request<ContextDto[]>(`/sessions/${id}/contexts`),
  sendTranscript: (id: string, sequence: number, text: string) =>
    request<{ accepted: boolean; sequence: number }>(`/sessions/${id}/transcripts`, {
      method: 'POST',
      body: JSON.stringify({ sequence, text }),
    }),
}
