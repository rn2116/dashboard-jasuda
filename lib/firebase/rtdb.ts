/**
 * Klien rendah-level untuk Firebase Realtime Database (REST API).
 *
 * Hanya dipakai di sisi server (Route Handler). Keuntungan pendekatan ini:
 * - Tanpa SDK Firebase → bundle web jauh lebih ringan.
 * - Koneksi keep-alive antar request (global fetch/undici) → hemat latency.
 * - Timeout bawaan supaya request ke Firebase tidak menggantung.
 * - Multi-path update: banyak data ditulis dengan SATU request HTTP.
 */
import { ApiError } from "@/lib/api/handler"

const REQUEST_TIMEOUT_MS = 8000

function baseUrl(): string {
  const url = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
  if (!url) throw new Error("NEXT_PUBLIC_FIREBASE_DATABASE_URL belum di-set di .env")
  return url.replace(/\/+$/, "")
}

function buildUrl(path: string, params?: Record<string, string | number>): string {
  const url = new URL(`${baseUrl()}/${path}.json`)
  const secret = process.env.FIREBASE_DB_SECRET
  if (secret) url.searchParams.set("auth", secret)
  for (const [key, value] of Object.entries(params ?? {})) {
    url.searchParams.set(key, String(value))
  }
  return url.toString()
}

async function request<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
  params?: Record<string, string | number>
): Promise<T> {
  let res: Response
  try {
    res = await fetch(buildUrl(path, params), {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    })
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new ApiError(502, "Firebase tidak dapat dihubungi", reason)
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new ApiError(502, `Firebase menolak permintaan (${res.status})`, text)
  }

  return (await res.json()) as T
}

/**
 * Kunci ala Firebase push: prefix timestamp (base36, lebar tetap → terurut
 * secara leksikografis) + acak 10 karakter.
 */
const PUSH_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

export function pushKey(now: number = Date.now()): string {
  const time = now.toString(36).padStart(9, "0")
  let random = ""
  for (let i = 0; i < 10; i++) {
    random += PUSH_ALPHABET[Math.floor(Math.random() * PUSH_ALPHABET.length)]
  }
  return time + random
}

export const rtdb = {
  /** Baca satu path (opsional dengan query `orderBy`/`limitToLast`/`startAt`). */
  get<T>(path: string, params?: Record<string, string | number>): Promise<T> {
    return request<T>("GET", path, undefined, params)
  },

  /** Tulis satu node (push key otomatis dari Firebase). */
  post<T>(path: string, value: unknown): Promise<T> {
    return request<T>("POST", path, value)
  },

  /**
   * Tulis BANYAK child sekaligus dalam SATU request (PATCH = merge children
   * di lokasi, child lama tidak tersentuh).
   * `entries` berbentuk { "<pushKey>": {...}, "<pushKey>": {...} }.
   *
   * Catatan: REST Firebase tidak mendukung multi-path update lintas node
   * (fitur SDK), jadi kelompokkan entry per node lalu panggil ini sekali.
   * Jangan pakai POST di sini — POST membuat SATU child auto-key baru,
   * sehingga seluruh object jadi bersarang di bawah satu kunci.
   */
  merge<T>(path: string, entries: Record<string, unknown>): Promise<T> {
    if (Object.keys(entries).length === 0) return Promise.resolve(null as T)
    return request<T>("PATCH", path, entries)
  },
}
