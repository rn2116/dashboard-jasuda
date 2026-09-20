import type { MachineId } from "./machines"

/**
 * Placeholder telemetry generator.
 *
 * There is no ESP32 firmware, backend, or transport wired up yet (see
 * CLAUDE.md). This simulates Suhu/Tekanan/Timer readings client-side so the
 * monitoring UI can be built and demoed ahead of that decision. Swap
 * `generateReading`/`generateCycleLog` for a real data source (HTTP
 * polling, WebSocket, MQTT bridge, or SSE) once the transport is chosen.
 */

export interface TelemetryReading {
  timestamp: number
  /** Heater temperature in degrees Celsius (MAX31856 + PT100). */
  suhu: number
  /** Sealing pressure in bar (load cell + HX711). */
  tekanan: number
  /** Seal dwell time for the current/last cycle, in seconds. */
  timer: number
}

export interface CycleLogEntry {
  id: number
  timestamp: number
  suhu: number
  tekanan: number
  timer: number
  status: "Selesai"
}

const BASELINE: Record<MachineId, { suhu: number; tekanan: number; timer: number }> = {
  "mesin-1": { suhu: 185, tekanan: 4.2, timer: 3.5 },
  "mesin-2": { suhu: 178, tekanan: 3.8, timer: 4.0 },
  "mesin-3": { suhu: 192, tekanan: 4.5, timer: 3.2 },
}

function seedFromId(machineId: MachineId): number {
  return machineId.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
}

export function generateReading(
  machineId: MachineId,
  timestamp: number = Date.now()
): TelemetryReading {
  const base = BASELINE[machineId]
  const seed = seedFromId(machineId)
  const wobble = Math.sin(timestamp / 4000 + seed)
  const noise = () => (Math.random() - 0.5)

  return {
    timestamp,
    suhu: Number((base.suhu + wobble * 3 + noise() * 1.5).toFixed(1)),
    tekanan: Number((base.tekanan + wobble * 0.3 + noise() * 0.15).toFixed(2)),
    timer: Number((base.timer + wobble * 0.2 + noise() * 0.1).toFixed(2)),
  }
}

export function generateCycleLog(
  machineId: MachineId,
  count = 15
): CycleLogEntry[] {
  const now = Date.now()
  return Array.from({ length: count }, (_, i) => {
    const timestamp = now - (count - i) * 45_000
    const reading = generateReading(machineId, timestamp)
    return {
      id: count - i,
      ...reading,
      status: "Selesai" as const,
    }
  })
}
