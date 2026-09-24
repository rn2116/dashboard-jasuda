/**
 * POST /api/telemetry — endpoint ingesti data dari ESP32.
 *
 * Menerima SATU reading atau ARRAY (batch, maks 100) dalam satu request:
 *   { "machineId": "mesin-3", "suhu": 192.5, "kecepatan": 120 }
 *   [{ "machineId": "mesin-1", ... }, { "machineId": "mesin-1", ... }]
 *
 * Batch diteruskan ke Firebase dengan SATU multi-path update (hemat HTTP).
 */
import { NextResponse } from "next/server"
import { apiHandler, readJson } from "@/lib/api/handler"
import { telemetryIngestSchema } from "@/lib/validation/telemetry"
import { saveTelemetryBatch } from "@/lib/firebase/telemetry"

export const POST = apiHandler(async (req) => {
  const body = await readJson(req)
  const payload = telemetryIngestSchema.parse(body)
  const items = Array.isArray(payload) ? payload : [payload]

  const count = await saveTelemetryBatch(items)

  return NextResponse.json({ success: true, count })
})
