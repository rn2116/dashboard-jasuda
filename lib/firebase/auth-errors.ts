/** Pesan ramah Bahasa Indonesia untuk kode error Firebase Auth/Database. */
export function mapAuthError(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "Format email tidak valid."
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email atau password salah."
    case "auth/too-many-requests":
      return "Terlalu banyak percobaan masuk. Coba lagi beberapa saat lagi."
    case "auth/user-disabled":
      return "Akun ini telah dinonaktifkan. Hubungi administrator."
    case "auth/network-request-failed":
      return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
    case "PERMISSION_DENIED":
      return "Akun ini belum terdaftar sebagai operator. Hubungi administrator untuk mendapatkan akses."
    default:
      return "Gagal masuk. Silakan coba lagi."
  }
}

/** Ambil `code` dari error Firebase (Auth memakai `error.code`, Database REST error lain-lain). */
export function firebaseErrorCode(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    return String((error as { code: unknown }).code)
  }
  return "unknown"
}
