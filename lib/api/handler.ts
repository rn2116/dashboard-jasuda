/**
 * Wrapper reusable untuk semua Route Handler.
 *
 * Menangani error terpusat (Zod → 400, ApiError → status-nya, lainnya → 500)
 * supaya setiap route cukup berisi logika bisnis saja.
 *
 * Contoh pemakaian:
 *   export const GET = apiHandler(async (req, ctx) => {
 *     const machineId = await param(ctx, "machineId")
 *     ...
 *     return NextResponse.json({ success: true, data })
 *   })
 */
import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"

/** Error dengan HTTP status — lempar dari dalam handler untuk respons 4xx/5xx. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }
}

interface RouteContext {
  params: Promise<Record<string, string>>
}

type RouteHandler = (req: NextRequest, ctx: RouteContext) => Promise<Response>

export function apiHandler(handler: RouteHandler) {
  return async (req: NextRequest, ctx: RouteContext): Promise<Response> => {
    try {
      return await handler(req, ctx)
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { success: false, error: "Data tidak valid", details: error.flatten() },
          { status: 400 }
        )
      }
      if (error instanceof ApiError) {
        return NextResponse.json(
          { success: false, error: error.message, ...(error.details ? { details: error.details } : {}) },
          { status: error.status }
        )
      }
      console.error("[API] Unhandled error:", error)
      return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  }
}

/** Baca & parse body JSON; lempar ApiError(400) bila bukan JSON valid. */
export async function readJson(req: NextRequest): Promise<unknown> {
  try {
    return await req.json()
  } catch {
    throw new ApiError(400, "Body bukan JSON valid")
  }
}

/** Ambil path parameter (`/api/x/[id]` → `id`); lempar ApiError(400) bila kosong. */
export async function param(ctx: RouteContext, name: string): Promise<string> {
  const params = await ctx.params
  const value = params[name]
  if (!value) throw new ApiError(400, `Parameter "${name}" wajib diisi`)
  return value
}

/** Baca query param berupa angka, di- clamp ke [min, max], dengan nilai default. */
export function queryInt(
  req: NextRequest,
  name: string,
  fallback: number,
  min: number,
  max: number
): number {
  const raw = req.nextUrl.searchParams.get(name)
  if (raw === null || raw === "") return fallback
  const parsed = Number.parseInt(raw, 10)
  if (Number.isNaN(parsed)) throw new ApiError(400, `Query "${name}" harus berupa angka`)
  return Math.min(Math.max(parsed, min), max)
}

/** Query param opsional dengan validasi pola (mis. kunci RTDB). */
export function queryKey(req: NextRequest, name: string, pattern: RegExp): string | undefined {
  const raw = req.nextUrl.searchParams.get(name)
  if (raw === null || raw === "") return undefined
  if (!pattern.test(raw)) throw new ApiError(400, `Query "${name}" tidak valid`)
  return raw
}
