# Prompt untuk Claude Code: Penyesuaian Dashboard Smart Cup Sealer

# PROMPT

Kamu membantu saya menyesuaikan kode website dashboard untuk skripsi saya: "Pengembangan Smart Cup Sealer Berbasis Embedded Intelligent Control dengan Monitoring dan Anomaly Detection Menggunakan Robust Z-Score". Dashboard ini memantau beberapa mesin cup sealer secara real-time dan menampilkan riwayat serta anomali. Arsitektur sistem sudah berubah, jadi kode dashboard yang ada perlu disesuaikan.

## 1. Konteks arsitektur (target akhir)

- ESP32 di tiap mesin membaca suhu heater (RTD via MAX31865) dan berat (load cell via HX711), mengontrol heater lewat SSR dengan hysteresis, lalu mengirim data lewat HTTPS ke API backend Python di hosting Rumahweb. ESP32 tidak berkomunikasi langsung dengan Firebase.
- API backend memvalidasi data, menghitung Robust Z-Score (median dan MAD), mengklasifikasikan status (Normal, Warning, Critical, Sensor Error), lalu menulis ke Firebase Realtime Database memakai Firebase Admin SDK.
- Dashboard (proyek yang sedang kamu kerjakan) adalah klien murni. Dashboard hanya membaca Firebase Realtime Database langsung dari browser memakai Firebase JS SDK (modular, v9 ke atas) dengan login Email/Password. Dashboard tidak pernah menulis ke database dan tidak memanggil API Python.
- Ada beberapa mesin (saat ini 3) dalam satu database yang sama, dibedakan oleh `device_id`.
- Stack dashboard saat ini: `[ISI jika tahu, kalau tidak, deteksi sendiri]`.
- Target deploy: hosting statis Rumahweb (cPanel) pada subdomain sendiri, bukan server Node permanen.

## 2. Kontrak data Firebase Realtime Database

Ini struktur data yang akan ditulis oleh backend. Jadikan ini sumber kebenaran. Jika kode dashboard yang ada memakai path atau bentuk data yang berbeda, laporkan selisihnya, jangan menebak.

```json
{
  "admins": { "UID_OPERATOR": true },

  "devices": {
    "sealer-01": { "name": "Cup Sealer 1", "type": "cup_sealer" }
  },

  "machine_types": {
    "cup_sealer": {
      "label": "Cup Sealer",
      "live_fields": {
        "temp":   { "label": "Suhu heater", "unit": "°C" },
        "weight": { "label": "Berat / tekanan", "unit": "kg" }
      },
      "parameters": {
        "temp_stable":  { "label": "Suhu stabil",    "unit": "°C", "min": 0, "max": 250, "z_threshold": 3.5 },
        "pressure_max": { "label": "Tekanan maks",   "unit": "kg", "min": 0, "max": 50,  "z_threshold": 3.5 },
        "duration_s":   { "label": "Durasi sealing", "unit": "s",  "min": 0, "max": 30,  "z_threshold": 3.5 }
      },
      "decision": { "warning_min_anomalies": 1, "critical_min_anomalies": 2 }
    }
  },

  "live": {
    "sealer-01": {
      "timestamp": 1760000000,
      "heater_status": "ON",
      "values": { "temp": 142.3, "weight": 0.2 }
    }
  },

  "results": {
    "sealer-01": {
      "-NxPUSHID1": {
        "timestamp": 1760000123,
        "params": { "temp_stable": 142.1, "pressure_max": 8.4, "duration_s": 1.6 },
        "z": { "temp_stable": 0.4, "pressure_max": 4.1, "duration_s": -0.2 },
        "anomalies": ["pressure_max"],
        "status": "Warning"
      }
    }
  },

  "baseline": {
    "sealer-01": {
      "temp_stable": { "median": 142.0, "mad": 0.8, "n": 50, "values": { "-Nx1": 141.9 } }
    }
  }
}
```

Catatan kontrak:

- `timestamp` adalah epoch detik UTC (angka). Tulis helper normalisasi yang juga menerima milidetik, dan tampilkan waktu dalam zona waktu `Asia/Makassar` (jadikan konstanta yang mudah diganti).
- `heater_status` bernilai `"ON"` atau `"OFF"`. `ON` berarti heater memanaskan (indikator merah di mesin). `OFF` berarti setpoint tercapai dan heater mati (indikator hijau di mesin).
- `status` hanya salah satu dari: `Normal`, `Warning`, `Critical`, `Sensor Error`. Untuk `Sensor Error`, `params` dan `z` bisa kosong atau sebagian `null`, dan mungkin ada field `reason`. Tangani tanpa error.
- `/live/{device_id}` hanya berisi kondisi terkini (selalu ditimpa). Riwayat grafik real-time harus dibangun di sisi klien dari setiap pembaruan listener.
- `/baseline`: jika `median` dan `mad` ada, pakai itu. Jika hanya ada `values`, hitung median dan MAD di klien. Struktur baseline belum final, jadi buat adaptor tipis supaya perubahan mudah.
- Nama parameter dan live field tidak boleh ditulis permanen di komponen UI. Semuanya dibaca dari `machine_types[type]` (label, satuan, batas). Jika definisi tidak ditemukan, tampilkan nama key apa adanya.
- `device_id` tidak mengandung karakter `. $ # [ ] /`.

## 3. Aturan keamanan dan batasan (wajib)

- Dashboard tidak boleh menulis ke Firebase. Hapus atau nonaktifkan semua kode `set`, `update`, `push`, `remove` dari klien. Security Rules menolak tulis dari klien.
- Jangan pernah menaruh service account key, API key perangkat (`X-API-Key`), atau rahasia lain di kode dashboard, `.env`, maupun repositori. Hanya konfigurasi web Firebase (`apiKey`, `authDomain`, `databaseURL`, `projectId`, `appId`) yang boleh ada, lewat environment variable build, dengan file `.env.example` tanpa nilai asli.
- Jangan mengubah backend, firmware, atau Firebase Security Rules. Jika perlu perubahan rules, tulis usulannya di `docs/` saja.
- Jangan menambah dependensi berat tanpa alasan. Pakai library chart yang sudah ada di proyek. Jika belum ada, usulkan satu yang ringan dan tunggu persetujuan saya.
- Jangan commit atau push apa pun kecuali saya minta.
- Jangan menjalankan perintah yang menyentuh database produksi. Untuk pengujian, pakai data uji (lihat tugas T10).
- Hemat kuota Firebase Spark (download 10 GB per bulan, 100 koneksi simultan): jangan memasang listener pada seluruh `/results`; selalu batasi dengan `orderByChild("timestamp")` dan `limitToLast(N)`; lepas listener (unsubscribe) saat komponen dilepas atau pindah halaman.

## 4. Cara kerja

**Fase 0, tanpa mengubah file.** Jelajahi repositori dan tulis laporan singkat: stack dan struktur folder, library chart dan UI yang dipakai, bagaimana dashboard sekarang membaca Firebase, path dan bentuk data yang dipakai sekarang, bagian yang tidak sesuai dengan kontrak di atas (termasuk referensi lama seperti `raw_data`, Cloud Functions, limit switch, status tuas, LED kuning, atau tulis langsung dari perangkat), dan risiko atau hal yang belum jelas. Lalu ajukan rencana bertahap per tugas (T1 sampai T11) dan **berhenti menunggu persetujuan saya**.

**Fase 1 dan seterusnya.** Kerjakan satu tugas dalam satu waktu sesuai urutan yang saya setujui. Setelah tiap tugas: jalankan lint dan build, ringkas perubahan (file apa, mengapa), dan sebutkan hal yang perlu saya putuskan. Jangan lanjut ke tugas berikutnya sebelum saya bilang lanjut.

## 5. Tugas

**T1. Inisialisasi Firebase dan autentikasi.** Satu modul inisialisasi (nama bebas, mengikuti konvensi proyek) yang membaca konfigurasi dari environment variable. Buat halaman login Email/Password, proteksi seluruh halaman dashboard, tombol logout, dan penanganan error `permission-denied` (tampilkan pesan jelas bahwa akun tidak terdaftar sebagai operator, jangan crash). Pertahankan sesi login saat halaman dimuat ulang.

**T2. Lapisan data.** Buat hook atau service terpisah dari komponen UI: daftar `devices`, `machine_types`, `live` untuk semua mesin (satu listener di `/live`), `results` per mesin dengan `limitToLast(N)` dan "muat lebih banyak" (paginasi mundur memakai `endBefore`), dan `baseline` per mesin yang hanya dibaca saat halaman detail dibuka. Semua hook mengembalikan state `loading`, `error`, dan `data`, serta melepas listener saat unmount. Buat tipe TypeScript untuk seluruh skema jika proyek memakai TypeScript.

**T3. Halaman ringkasan multi-mesin.** Satu kartu per mesin dari satu listener `/live`: nama mesin, jenis, status koneksi, status heater (`ON` tampil "Memanaskan", `OFF` tampil "Setpoint tercapai / heater mati"), nilai live (label dan satuan dari `live_fields`), dan badge status siklus sealing terakhir dari `/results`. Warna badge: Normal hijau, Warning kuning, Critical merah, Sensor Error abu gelap dengan ikon berbeda (jangan hanya mengandalkan warna). Mesin dianggap offline jika `timestamp` live lebih lama dari ambang yang bisa diatur (default 15 detik), tampilkan "Offline" beserta waktu terakhir terlihat. Klik kartu membuka halaman detail.

**T4. Halaman detail mesin.** Pemilih mesin (dropdown atau tab). Grafik real-time suhu dan berat yang dibangun di klien dari pembaruan `/live` (simpan jendela bergulir, default 120 titik, bersihkan saat pindah mesin). Panel status terkini. Grafik tren per parameter siklus (dari `/results`) dengan garis median baseline, dan penanda titik anomali. Tabel riwayat siklus: waktu, nilai tiap parameter, skor Z, status, dengan filter status dan rentang tanggal, dan baris anomali ditandai jelas.

**T5. Parameter dinamis per jenis mesin.** Semua label, satuan, dan batas dibaca dari `machine_types`. Tidak ada nama parameter atau live field yang ditulis permanen di komponen. Menambah jenis mesin baru cukup dengan menambah data di database, tanpa mengubah kode. Sediakan fallback yang rapi jika definisi jenis mesin tidak ada atau tidak lengkap.

**T6. Daftar anomali.** Halaman atau panel yang menampilkan siklus berstatus selain Normal dari semua mesin, terbaru di atas, dengan parameter mana yang anomali (dari `anomalies` dan `z`) dan ambang `z_threshold`. Batasi jumlah data yang diambil (N siklus terbaru per mesin) dan jelaskan batas itu di UI.

**T7. State UI dan aksesibilitas.** Setiap tampilan punya state loading, kosong, dan error. Tampilan responsif (ponsel hingga desktop). Semua teks UI berbahasa Indonesia dan dikumpulkan di satu tempat. Kontras warna memadai dan status tidak hanya dibedakan lewat warna.

**T8. Pembersihan.** Hapus atau perbarui semua referensi yang sudah tidak sesuai arsitektur: path `raw_data`, ketergantungan Cloud Functions, limit switch dan status tuas, LED kuning (indikator hanya merah dan hijau), kode tulis ke Firebase dari klien, dan kunci atau konfigurasi lama. Perbarui README agar sesuai.

**T9. Konfigurasi dan deploy statis.** Sediakan `.env.example` (nama variabel mengikuti konvensi stack, awalan `VITE_` untuk Vite atau `NEXT_PUBLIC_` untuk Next.js). Atur build menjadi keluaran statis yang bisa diunggah ke `public_html` subdomain Rumahweb. Jika proyek Next.js, gunakan static export bila fitur yang dipakai memungkinkan dan jelaskan jika ada yang tidak kompatibel (seperti SSR atau API route). Untuk aplikasi satu halaman, sediakan contoh `.htaccess` dengan fallback ke `index.html`. Tulis `docs/DEPLOY.md` berisi: perintah build, apa yang diunggah, cara mengatur subdomain, menambahkan domain ke Firebase Authentication → Settings → Authorized domains, dan checklist keamanan. Jangan melakukan deploy apa pun.

**T10. Data uji.** Buat `seed/seed.json` sesuai kontrak (3 mesin, campuran siklus Normal, Warning, Critical, dan Sensor Error, serta satu mesin dengan `/live` yang sudah kedaluwarsa untuk menguji status offline). Tulis petunjuk memakainya pada project Firebase uji atau Firebase Emulator Suite, bukan produksi. Jika memungkinkan, sediakan skrip kecil yang memperbarui `/live` seolah-olah mesin aktif agar grafik real-time bisa diuji tanpa perangkat.

**T11. Kualitas.** Lint dan build harus lolos tanpa peringatan baru. Tambahkan pengujian untuk fungsi murni yang penting (normalisasi timestamp, hitung median dan MAD, pemetaan status ke label dan warna). Tidak ada `console.log` sisa atau kode mati.

## 6. Kriteria selesai

- Dashboard membaca hanya path pada kontrak, tidak pernah menulis ke database.
- Menambah mesin atau jenis mesin baru cukup lewat data di Firebase, tanpa ubah kode.
- Satu listener `/live` melayani seluruh kartu ringkasan, dan `/results` selalu dibatasi.
- Tidak ada rahasia di repositori maupun bundle hasil build (periksa dengan mencari `serviceAccount`, `X-API-Key`, dan `private_key`).
- Build statis berhasil dan petunjuk deploy lengkap.
- Ringkasan akhir berisi: daftar perubahan, hal yang belum selesai atau asumsi yang kamu buat, dan hal yang perlu saya lakukan sendiri (seperti mengimpor data awal dan menambahkan Authorized domain).

Mulai dengan Fase 0 sekarang.

---

# AKHIR PROMPT
