/**
 * GET /api/telemetry/[machineId] — riwayat pembacaan sensor.
 *
 * Query:
 *   ?limit=60     jumlah data maks (default 60, maks 500)
 *   ?since=<key>  (opsional) hanya data SETELAH kunci RTDB ini
 *                 → dipakai polling inkremental dashboard (payload kecil)
 */
import { NextResponse } from "next/server"
import { apiHandler, param, queryInt, queryKey } from "@/lib/api/handler"
import { isValidMachineId } from "@/lib/validation/telemetry"
import { readTelemetry } from "@/lib/firebase/telemetry"
import { ApiError } from "@/lib/api/handler"

/** Kunci push RTDB: base36 + acak. */
const KEY_PATTERN = /^[A-Za-z0-9_-]{1,64}$/

export const GET = apiHandler(async (req, ctx) => {
  const machineId = await param(ctx, "machineId")
  if (!isValidMachineId(machineId)) {
    throw new ApiError(400, "machineId tidak dikenal (mesin-1 | mesin-2 | mesin-3)")
  }

  const limit = queryInt(req, "limit", 60, 1, 500)
  const since = queryKey(req, "since", KEY_PATTERN)

  const data = await readTelemetry(machineId, { limit, since })

  return NextResponse.json({ success: true, data })
})
