"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/firebase/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const { user, isLoading: isSessionLoading, configError, login } = useAuth()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!isSessionLoading && user) {
      router.replace("/dashboard")
    }
  }, [isSessionLoading, user, router])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await login(email, password)
      router.replace("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal masuk. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (configError) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/40 p-4">
        <div className="max-w-sm rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-sm text-destructive">
          {configError}
        </div>
      </div>
    )
  }

  if (isSessionLoading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/40">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Masuk</CardTitle>
          <CardDescription>
            Masukkan email dan password operator untuk mengakses dashboard.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-4">
            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="grid gap-2">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@jasuda.local"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Memeriksa..." : "Masuk"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
