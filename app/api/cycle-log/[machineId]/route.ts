/**
 * Cycle log per mesin.
 *   GET  /api/cycle-log/[machineId]?limit=20 → riwayat siklus (terbaru di atas)
 *   POST /api/cycle-log/[machineId]          → catat satu siklus selesai
 *          body: { suhu, tekanan?, timer?, kecepatan?, pouchMasuk?, pouchKeluar?, status? }
 */
import { NextResponse } from "next/server"
import { apiHandler, param, queryInt, readJson, ApiError } from "@/lib/api/handler"
import { cycleLogSchema, isValidMachineId } from "@/lib/validation/telemetry"
import { readCycleLogs, saveCycleLog } from "@/lib/firebase/telemetry"
import type { MachineId } from "@/lib/monitoring/machines"

async function machineIdFrom(ctx: Parameters<typeof param>[0]): Promise<MachineId> {
  const machineId = await param(ctx, "machineId")
  if (!isValidMachineId(machineId)) {
    throw new ApiError(400, "machineId tidak dikenal (mesin-1 | mesin-2 | mesin-3)")
  }
  return machineId
}

export const GET = apiHandler(async (req, ctx) => {
  const machineId = await machineIdFrom(ctx)
  const limit = queryInt(req, "limit", 20, 1, 100)

  const data = await readCycleLogs(machineId, limit)

  return NextResponse.json({ success: true, data })
})

export const POST = apiHandler(async (req, ctx) => {
  const machineId = await machineIdFrom(ctx)
  const body = await readJson(req)
  const input = cycleLogSchema.parse(body)

  await saveCycleLog(machineId, input)

  return NextResponse.json({ success: true })
})
