/**
 * Repository telemetry & cycle log — jembatan antara API → Firebase RTDB.
 *
 * Struktur data di RTDB:
 *   telemetry/{machineId}/{key}  → pembacaan sensor (time-series)
 *   cycleLogs/{machineId}/{key}  → riwayat siklus selesai
 */
import { rtdb, pushKey } from "./rtdb"
import type { MachineId } from "@/lib/monitoring/machines"
import type { TelemetryReading, CycleLogEntry } from "@/lib/monitoring/types"
import type { TelemetryInput, CycleLogInput } from "@/lib/validation/telemetry"

type ReadingValue = Omit<TelemetryReading, "key">

export interface ReadTelemetryOptions {
  /** Maksimal jumlah reading yang dikembalikan (default 60). */
  limit?: number
  /** Kunci RTDB — hanya kembalikan data setelah kunci ini (sinkronisasi inkremental). */
  since?: string
}

/** Hilangkan field yang undefined/null (JSON.stringify sudah, tapi eksplisit aman). */
function compact(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null))
}

/**
 * Tulis batch pembacaan telemetry. Dikelompokkan per mesin → SATU request
 * HTTP per mesin (POST object berisi banyak push key = merge children).
 */
export async function saveTelemetryBatch(items: TelemetryInput[]): Promise<number> {
  const now = Date.now()
  const byMachine = new Map<MachineId, Record<string, unknown>>()

  for (const item of items) {
    const { machineId, timestamp, ...fields } = item
    const entries = byMachine.get(machineId) ?? {}
    // Prefix key = timestamp pembacaan → urutan key = urutan waktu asli
    // meskipun ESP32 mengirim data buffer sekaligus dalam satu batch.
    entries[pushKey(timestamp ?? now)] = compact({ timestamp: timestamp ?? now, ...fields })
    byMachine.set(machineId, entries)
  }

  await Promise.all(
    [...byMachine.entries()].map(([machineId, entries]) =>
      rtdb.merge(`telemetry/${machineId}`, entries)
    )
  )
  return items.length
}

/**
 * Baca riwayat pembacaan, terurut menaik (lama → baru).
 *
 * - Tanpa `since`  → `limit` data terakhir (initial load).
 * - Dengan `since` → hanya data SETELAH kunci tersebut (polling inkremental,
 *   payload polling jadi sangat kecil).
 */
export async function readTelemetry(
  machineId: MachineId,
  { limit = 60, since }: ReadTelemetryOptions = {}
): Promise<TelemetryReading[]> {
  const params: Record<string, string | number> = { orderBy: '"$key"', limitToLast: limit }
  // Quirk Firebase REST: nilai startAt untuk orderBy=$key HARUS dikutip
  // seperti string JSON, mis. startAt="abc123" — tanpa kutip → 400.
  if (since) params.startAt = JSON.stringify(since)

  const json = await rtdb.get<Record<string, ReadingValue> | null>(
    `telemetry/${machineId}`,
    params
  )
  if (!json) return []

  return Object.entries(json)
    .map(([key, value]) => ({ key, ...value }))
    .sort((a, b) => (a.key < b.key ? -1 : 1))
}

/** Baca SATU pembacaan terakhir (untuk stat cards / overview — payload minimal). */
export async function readLatestTelemetry(
  machineId: MachineId
): Promise<TelemetryReading | null> {
  const json = await rtdb.get<Record<string, ReadingValue> | null>(`telemetry/${machineId}`, {
    orderBy: '"$key"',
    limitToLast: 1,
  })
  const entry = Object.entries(json ?? {})[0]
  if (!entry) return null
  return { key: entry[0], ...entry[1] }
}

/** Tulis satu riwayat siklus selesai. */
export async function saveCycleLog(machineId: MachineId, input: CycleLogInput): Promise<void> {
  const { timestamp, status, ...fields } = input
  await rtdb.post(`cycleLogs/${machineId}`, compact({
    timestamp: timestamp ?? Date.now(),
    status: status ?? "Selesai",
    ...fields,
  }))
}

/** Baca riwayat siklus (terurut menaik, `id` = nomor siklus dalam jendela ini). */
export async function readCycleLogs(machineId: MachineId, limit = 20): Promise<CycleLogEntry[]> {
  const json = await rtdb.get<Record<string, Omit<CycleLogEntry, "id">> | null>(
    `cycleLogs/${machineId}`,
    { orderBy: '"$key"', limitToLast: limit }
  )
  if (!json) return []

  // Firebase mengembalikan terurut kunci (asc) → id naik dari yang terlama,
  // lalu dibalik supaya baris terbaru tampil di atas tabel.
  return Object.entries(json)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([, value]) => value)
    .map((entry, index) => ({ id: index + 1, ...entry }))
    .reverse()
}
