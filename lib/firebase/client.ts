/**
 * Inisialisasi Firebase di sisi klien (browser only — jangan import dari
 * Server Component/Route Handler).
 *
 * Dashboard ini adalah klien MURNI: hanya membaca Realtime Database lewat
 * Firebase JS SDK, tidak pernah menulis, dan tidak memanggil backend lain.
 * Konfigurasi di bawah bukan rahasia — ini adalah config web Firebase yang
 * memang publik (dibatasi oleh Security Rules + Authorized domains, bukan
 * oleh kerahasiaan key-nya).
 *
 * `getFirebaseAuth`/`getFirebaseDb` sengaja LAZY (bukan konstanta modul):
 * `getAuth()` memvalidasi config segera saat dipanggil, dan Next.js
 * me-render ulang semua halaman sekali di server/build time (static export)
 * meski komponennya "use client". Modul ini hanya boleh benar-benar
 * dipanggil dari dalam effect/handler di browser (lihat `auth-context.tsx`),
 * supaya proses build tidak ikut mencoba menghubungi Firebase.
 */
import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getDatabase, type Database } from "firebase/database"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

/** True bila semua variabel NEXT_PUBLIC_FIREBASE_* wajib sudah diisi. */
export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.databaseURL &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
  )
}

let appInstance: FirebaseApp | null = null
let authInstance: Auth | null = null
let dbInstance: Database | null = null

function getFirebaseApp(): FirebaseApp {
  if (!appInstance) {
    appInstance = getApps()[0] ?? initializeApp(firebaseConfig)
  }
  return appInstance
}

export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp())
  }
  return authInstance
}

export function getFirebaseDb(): Database {
  if (!dbInstance) {
    dbInstance = getDatabase(getFirebaseApp())
  }
  return dbInstance
}
