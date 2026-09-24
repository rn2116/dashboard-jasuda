"use client"

/**
 * Telemetry live per mesin dengan SINKRONISASI INKREMENTAL.
 *
 * - Initial load : tarik `MAX_HISTORY` data terakhir (1 request).
 * - Polling tiap : hanya tarik data BARU via `?since=<key>` — payload
 *                  beberapa ratus byte, bukan 60 baris penuh.
 * - Anti-overlap : polling berikutnya dilewati bila request masih jalan.
 * - Abort-safe   : request dibatalkan saat unmount / machineId berubah.
 */
import * as React from "react"

import type { MachineId } from "@/lib/monitoring/machines"
import type { TelemetryReading, ApiResponse } from "@/lib/monitoring/types"

const MAX_HISTORY = 60
const POLL_INTERVAL_MS = 5000

export function useMachineTelemetry(machineId: MachineId) {
  const [history, setHistory] = React.useState<TelemetryReading[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const lastKeyRef = React.useRef<string | null>(null)
  const inFlightRef = React.useRef(false)

  React.useEffect(() => {
    let active = true
    const controller = new AbortController()

    // Reset state saat pindah mesin (ref boleh di-reset langsung di effect;
    // riwayat lama akan tergantikan oleh load pertama yang tanpa `since`).
    lastKeyRef.current = null
    inFlightRef.current = false

    async function load() {
      if (inFlightRef.current) return
      inFlightRef.current = true

      try {
        const since = lastKeyRef.current
        const query = since ? `?limit=${MAX_HISTORY}&since=${encodeURIComponent(since)}` : `?limit=${MAX_HISTORY}`
        const res = await fetch(`/api/telemetry/${machineId}${query}`, {
          signal: controller.signal,
          cache: "no-store",
        })
        const json = (await res.json()) as ApiResponse<TelemetryReading[]>
        if (!res.ok || !json.success || !json.data) {
          throw new Error(json.error ?? `HTTP ${res.status}`)
        }

        const fresh = json.data
        if (active && fresh.length > 0) {
          const prevKey = lastKeyRef.current
          lastKeyRef.current = fresh[fresh.length - 1].key

          setHistory((prev) => {
            if (!prevKey) return fresh.slice(-MAX_HISTORY)
            // `since` bersifat inklusif → buang duplikat kunci terakhir.
            const additions = fresh.filter((r) => r.key !== prevKey)
            return [...prev, ...additions].slice(-MAX_HISTORY)
          })
        }
        if (active) setError(null)
      } catch (err) {
        if (controller.signal.aborted) return
        console.error("[useMachineTelemetry]", err)
        if (active) setError(err instanceof Error ? err.message : "Gagal memuat telemetry")
      } finally {
        inFlightRef.current = false
        if (active) setIsLoading(false)
      }
    }

    load()
    const id = setInterval(load, POLL_INTERVAL_MS)

    return () => {
      active = false
      controller.abort()
      clearInterval(id)
    }
  }, [machineId])

  const latest = history.length > 0 ? history[history.length - 1] : null

  return { latest, history, isLoading, error }
}
