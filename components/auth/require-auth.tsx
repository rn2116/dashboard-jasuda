"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/lib/firebase/auth-context"

/** Bungkus halaman yang wajib login; redirect ke /login bila belum. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading, configError } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!isLoading && !user && !configError) {
      router.replace("/login")
    }
  }, [isLoading, user, configError, router])

  if (configError) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-4">
        <div className="max-w-sm rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-sm text-destructive">
          {configError}
        </div>
      </div>
    )
  }

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm">Memeriksa sesi...</span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
