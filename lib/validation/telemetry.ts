/**
 * Skema validasi (Zod) untuk semua data yang masuk dari ESP32 / client.
 * Dipakai oleh route API — satu sumber kebenaran untuk bentuk data.
 */
import { z } from "zod"
import type { MachineId } from "@/lib/monitoring/machines"

export const MACHINE_IDS = ["mesin-1", "mesin-2", "mesin-3"] as const satisfies readonly MachineId[]

export function isValidMachineId(id: string): id is MachineId {
  return (MACHINE_IDS as readonly string[]).includes(id)
}

/** Batas wajar sensor supaya data sampah tidak masuk database. */
const machineFields = {
  timestamp: z.number().int().positive().optional(),
  suhu: z.number().min(-100).max(1000),
  tekanan: z.number().min(0).max(1000).optional(),
  timer: z.number().min(0).max(86400).optional(),
  kecepatan: z.number().min(0).max(100000).optional(),
  pouchMasuk: z.number().int().min(0).optional(),
  pouchKeluar: z.number().int().min(0).optional(),
}

/** Satu pembacaan telemetry dari ESP32. */
export const telemetrySchema = z.object({
  machineId: z.enum(MACHINE_IDS),
  ...machineFields,
})

/** Payload `POST /api/telemetry`: satu reading ATAU array (batch, maks 100). */
export const telemetryIngestSchema = z.union([
  telemetrySchema,
  z.array(telemetrySchema).min(1).max(100),
])

/** Payload `POST /api/cycle-log/[machineId]` (machineId di path, bukan body). */
export const cycleLogSchema = z.object({
  ...machineFields,
  status: z.string().min(1).max(32).optional(),
})

export type TelemetryInput = z.infer<typeof telemetrySchema>
export type TelemetryIngest = z.infer<typeof telemetryIngestSchema>
export type CycleLogInput = z.infer<typeof cycleLogSchema>
