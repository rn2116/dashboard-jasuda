"use client"

/**
 * Reading TERAKHIR sebuah mesin (untuk stat cards / halaman overview).
 *
 * Hanya mengambil 1 baris per poll lewat `/api/telemetry/[id]/latest`
 * — jauh lebih hemat daripada menarik 60 baris riwayat.
 */
import * as React from "react"

import type { MachineId } from "@/lib/monitoring/machines"
import type { TelemetryReading, ApiResponse } from "@/lib/monitoring/types"

const DEFAULT_POLL_MS = 3000

export function useMachineLatest(machineId: MachineId, pollMs: number = DEFAULT_POLL_MS) {
  const [latest, setLatest] = React.useState<TelemetryReading | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true
    const controller = new AbortController()

    async function load() {
      try {
        const res = await fetch(`/api/telemetry/${machineId}/latest`, {
          signal: controller.signal,
          cache: "no-store",
        })
        const json = (await res.json()) as ApiResponse<TelemetryReading | null>
        if (!res.ok || !json.success) throw new Error(json.error ?? `HTTP ${res.status}`)
        if (active) {
          setLatest(json.data ?? null)
          setError(null)
        }
      } catch (err) {
        if (controller.signal.aborted) return
        console.error("[useMachineLatest]", err)
        if (active) setError(err instanceof Error ? err.message : "Gagal memuat data")
      } finally {
        if (active) setIsLoading(false)
      }
    }

    load()
    const id = setInterval(load, pollMs)

    return () => {
      active = false
      controller.abort()
      clearInterval(id)
    }
  }, [machineId, pollMs])

  return { latest, isLoading, error }
}
