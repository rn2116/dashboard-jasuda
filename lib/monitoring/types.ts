/**
 * Tipe data bersama untuk monitoring mesin.
 * Sumber pembacaan: ESP32 → API → Firebase RTDB.
 */

/** Satu pembacaan sensor dari mesin (sudah terhubung dengan RTDB). */
export interface TelemetryReading {
  /** Kunci unik di Firebase RTDB — dipakai sinkronisasi inkremental (`?since=`). */
  key: string
  /** Waktu pembacaan (Unix ms). */
  timestamp: number
  /** Heater temperature °C (MAX31856 + PT100). */
  suhu: number
  /** Tekanan sealing bar — hanya cup sealer. */
  tekanan?: number
  /** Seal dwell time detik — hanya cup sealer. */
  timer?: number
  /** Kecepatan RPM — hanya conveyor. */
  kecepatan?: number
  /** Counter pouch masuk — hanya conveyor. */
  pouchMasuk?: number
  /** Counter pouch keluar — hanya conveyor. */
  pouchKeluar?: number
}

/** Satu baris riwayat siklus yang sudah selesai. */
export interface CycleLogEntry {
  id: number
  timestamp: number
  suhu: number
  tekanan?: number
  timer?: number
  kecepatan?: number
  pouchMasuk?: number
  pouchKeluar?: number
  status: string
}

/** Respons standar semua endpoint API: `{ success: boolean, ... }`. */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: unknown
}
