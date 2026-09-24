/**
 * GET /api/health — cek apakah server API hidup.
 * Berguna untuk smoke-test & monitoring deployment.
 */
import { NextResponse } from "next/server"
import { apiHandler } from "@/lib/api/handler"

export const dynamic = "force-dynamic"

export const GET = apiHandler(async () => {
  return NextResponse.json({
    success: true,
    data: { status: "ok", uptime: process.uptime(), time: Date.now() },
  })
})
