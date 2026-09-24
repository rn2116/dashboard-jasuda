/**
 * GET /api/telemetry/[machineId]/latest — pembacaan TERAKHIR saja.
 *
 * Untuk stat cards & halaman overview: payload ±1 reading per mesin
 * (jauh lebih kecil daripada menarik 60 baris riwayat).
 */
import { NextResponse } from "next/server"
import { apiHandler, param, ApiError } from "@/lib/api/handler"
import { isValidMachineId } from "@/lib/validation/telemetry"
import { readLatestTelemetry } from "@/lib/firebase/telemetry"

export const GET = apiHandler(async (_req, ctx) => {
  const machineId = await param(ctx, "machineId")
  if (!isValidMachineId(machineId)) {
    throw new ApiError(400, "machineId tidak dikenal (mesin-1 | mesin-2 | mesin-3)")
  }

  const data = await readLatestTelemetry(machineId)

  return NextResponse.json({ success: true, data })
})
