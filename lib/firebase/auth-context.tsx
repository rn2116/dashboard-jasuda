"use client"

/**
 * Sesi Auth untuk seluruh app (dipasang di root layout, di atas /login dan
 * /dashboard). Firebase Auth menyimpan sesi di browser (local persistence)
 * secara otomatis — reload halaman tetap login selama token masih valid.
 *
 * `login()` juga memverifikasi bahwa akun benar-benar terdaftar sebagai
 * operator: Security Rules RTDB menolak baca (`PERMISSION_DENIED`) untuk UID
 * yang tidak ada di `/admins`. Firebase Auth sendiri tidak tahu soal itu —
 * baru ketahuan saat mencoba membaca data — jadi kita cek sekali di sini
 * dan langsung sign-out + tampilkan pesan jelas, bukan membiarkan error itu
 * muncul belakangan sebagai layar kosong yang membingungkan.
 */
import * as React from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth"
import { get, ref } from "firebase/database"
import { getFirebaseAuth, getFirebaseDb, isFirebaseConfigured } from "./client"
import { mapAuthError, firebaseErrorCode } from "./auth-errors"

const CONFIG_ERROR_MESSAGE =
  "Konfigurasi Firebase belum lengkap. Periksa variabel NEXT_PUBLIC_FIREBASE_* di .env."

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  /** Terisi bila konfigurasi Firebase (.env) tidak valid/belum diisi. */
  configError: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Dicek dari env var secara langsung (bukan dengan memanggil Firebase SDK)
  // supaya pengecekan ini murni sinkron dan tidak perlu setState di dalam
  // effect bila konfigurasi tidak lengkap — effect di bawah jadi tidak
  // pernah perlu dijalankan sama sekali untuk kasus itu.
  const [configError] = React.useState<string | null>(() =>
    isFirebaseConfigured() ? null : CONFIG_ERROR_MESSAGE
  )
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(() => isFirebaseConfigured())

  React.useEffect(() => {
    if (configError) return

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
      setUser(nextUser)
      setIsLoading(false)
    })
    return unsubscribe
  }, [configError])

  const login = React.useCallback(async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password)
    } catch (error) {
      throw new Error(mapAuthError(firebaseErrorCode(error)))
    }

    try {
      // Probe ringan: siapa pun yang berhasil login tapi tidak terdaftar
      // sebagai operator akan ditolak Security Rules di sini.
      await get(ref(getFirebaseDb(), "devices"))
    } catch (error) {
      await firebaseSignOut(getFirebaseAuth())
      throw new Error(mapAuthError(firebaseErrorCode(error)))
    }
  }, [])

  const logout = React.useCallback(async () => {
    await firebaseSignOut(getFirebaseAuth())
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, configError, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>")
  return ctx
}
