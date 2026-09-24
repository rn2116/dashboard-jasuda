"use client"

/**
 * Riwayat siklus per mesin — polling penuh (data kecil & jarang berubah),
 * request lama dibatalkan saat unmount / parameter berubah.
 */
import * as React from "react"

import type { MachineId } from "@/lib/monitoring/machines"
import type { CycleLogEntry, ApiResponse } from "@/lib/monitoring/types"

const POLL_INTERVAL_MS = 10_000

export function useCycleLog(machineId: MachineId, limit = 20) {
  const [logs, setLogs] = React.useState<CycleLogEntry[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true
    const controller = new AbortController()

    async function load() {
      try {
        const res = await fetch(`/api/cycle-log/${machineId}?limit=${limit}`, {
          signal: controller.signal,
          cache: "no-store",
        })
        const json = (await res.json()) as ApiResponse<CycleLogEntry[]>
        if (!res.ok || !json.success || !json.data) {
          throw new Error(json.error ?? `HTTP ${res.status}`)
        }
        if (active) {
          setLogs(json.data)
          setError(null)
        }
      } catch (err) {
        if (controller.signal.aborted) return
        console.error("[useCycleLog]", err)
        if (active) setError(err instanceof Error ? err.message : "Gagal memuat riwayat siklus")
      } finally {
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
  }, [machineId, limit])

  return { logs, isLoading, error }
}
