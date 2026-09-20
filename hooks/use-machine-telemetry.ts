"use client"

import * as React from "react"

import type { MachineId } from "@/lib/monitoring/machines"
import { generateReading, type TelemetryReading } from "@/lib/monitoring/mock-telemetry"

const MAX_HISTORY = 30
const POLL_INTERVAL_MS = 3000

/**
 * Simulates live Suhu/Tekanan/Timer telemetry for a machine by polling the
 * placeholder generator on an interval. Replace the interval body with a
 * real fetch/WebSocket/MQTT subscription once the ESP32 transport is
 * decided (see CLAUDE.md).
 */
export function useMachineTelemetry(machineId: MachineId) {
  const [history, setHistory] = React.useState<TelemetryReading[]>(() => {
    const now = Date.now()
    return Array.from({ length: MAX_HISTORY }, (_, i) =>
      generateReading(machineId, now - (MAX_HISTORY - i) * POLL_INTERVAL_MS)
    )
  })

  React.useEffect(() => {
    const id = setInterval(() => {
      setHistory((prev) => [...prev.slice(-(MAX_HISTORY - 1)), generateReading(machineId)])
    }, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [machineId])

  return {
    latest: history[history.length - 1],
    history,
  }
}
