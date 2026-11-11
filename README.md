# Sistem Informasi Asisten Bisnis Kedai Kopi

Sistem Informasi Asisten Bisnis Kedai Kopi merupakan aplikasi berbasis web yang dirancang untuk membantu proses operasional dan pengelolaan bisnis kedai kopi. Sistem ini menyediakan pengelolaan produk, kategori, transaksi penjualan, pengguna, dashboard, serta laporan penjualan.

Proyek ini dikembangkan menggunakan teknologi web dengan arsitektur frontend, backend, dan database yang terpisah.

## 1. Teknologi yang Digunakan

| Bagian | Teknologi |
|---|---|
| Frontend | HTML, CSS, Vanilla JavaScript |
| CSS Framework | Bootstrap 5 |
| Backend | Node.js |
| Backend Framework | Express.js |
| Database | MariaDB 11.4 |
| Database Management | phpMyAdmin |
| Containerization | Docker & Docker Compose |
| Authentication | JWT dan HttpOnly Cookie |
| Version Control | Git & GitHub |

## 2. Struktur Project

```text
kedai-kopi/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── app.js
│   │
│   └── server.js
│
├── frontend/
│   ├── index.html
│   ├── pages/
│   ├── assets/
│   ├── css/
│   └── js/
│
├── docker-compose.yml
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
└── README.md
```

## 3. Persyaratan Instalasi

Pastikan perangkat sudah memiliki:

- Node.js dan npm.
- Docker Desktop.
- Visual Studio Code.
- Git.
- Browser seperti Google Chrome atau Microsoft Edge.
- Extension Live Server pada VS Code.

## 4. Cara Mendapatkan Project

Clone repository GitHub:

```bash
git clone URL_REPOSITORY
```

Masuk ke direktori project:

```bash
cd kedai-kopi
```

Ganti `URL_REPOSITORY` dengan URL repository GitHub tim.

## 5. Konfigurasi Environment

Buat file `.env` berdasarkan `.env.example`.

Pada Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Sesuaikan nilai konfigurasi di dalam `.env` dengan environment lokal.

Pastikan konfigurasi mencakup:

- PORT backend.
- Konfigurasi koneksi MariaDB.
- JWT_SECRET minimal 32 karakter.
- Kredensial database sesuai konfigurasi Docker.

**Penting:** Jangan pernah mengunggah file `.env` yang berisi kredensial asli ke GitHub.

## 6. Menjalankan Database

Pastikan Docker Desktop sudah berjalan.

Jalankan container menggunakan:

```bash
docker compose up -d
```

Periksa status container:

```bash
docker compose ps
```

Konfigurasi port development:

| Komponen | Alamat |
|---|---|
| MariaDB | localhost:3307 |
| phpMyAdmin | http://localhost:8081 |

Buka phpMyAdmin untuk memeriksa database:

```text
http://localhost:8081
```

Database yang digunakan:

```text
kedai_kopi_db
```

Pastikan database dan tabel sudah tersedia sebelum menjalankan backend.

## 7. Instalasi Dependency Backend

Dari direktori utama project, jalankan:

```bash
npm install
```

Perintah tersebut akan memasang dependency yang tercantum dalam `package.json`.

## 8. Menjalankan Backend

Jalankan backend dalam mode development:

```bash
npm run dev
```

Atau mode biasa:

```bash
npm start
```

Jika berhasil, terminal akan menampilkan informasi bahwa koneksi MariaDB berhasil dan server berjalan.

Alamat backend:

```text
http://localhost:3000
```

Untuk memeriksa server, buka:

```text
http://localhost:3000/
```

Backend akan mengembalikan respons status API.

## 9. Menjalankan Frontend

Frontend menggunakan HTML, CSS, dan Vanilla JavaScript sehingga tidak membutuhkan proses build khusus.

Langkah menjalankan:

1. Buka project melalui Visual Studio Code.
2. Pastikan extension Live Server sudah terpasang.
3. Buka folder `frontend`.
4. Klik kanan file `index.html`.
5. Pilih **Open with Live Server**.

Gunakan alamat berikut jika Live Server berjalan pada port 5500:

```text
http://localhost:5500/frontend/
```

Halaman awal akan memeriksa sesi pengguna dan mengarahkan pengguna ke halaman login atau dashboard.

## 10. Konfigurasi Koneksi Frontend dan Backend

File konfigurasi API:

```text
frontend/js/config/apiConfig.js
```

Konfigurasi development:

```javascript
const API_CONFIG = {
    BASE_URL: "http://localhost:3000",
    API_PREFIX: "/api",
    TIMEOUT: 15000,
    CREDENTIALS: "include"
};
```

Frontend berkomunikasi dengan backend menggunakan HTTP API.

Autentikasi menggunakan HttpOnly Cookie, sehingga request yang membutuhkan sesi harus menyertakan:

```javascript
credentials: "include"
```

Backend juga harus mengizinkan origin frontend melalui konfigurasi CORS.

Origin frontend development yang digunakan:

```text
http://localhost:5500
```

Jika port Live Server berubah, konfigurasi CORS backend perlu disesuaikan.

## 11. Hak Akses Pengguna

Sistem memiliki dua jenis pengguna:

### Admin

Admin memiliki akses untuk:

- Melihat dashboard.
- Mengelola produk.
- Mengelola kategori.
- Melihat dan mengelola transaksi.
- Mengelola akun pengguna.
- Melihat laporan penjualan.
- Mengekspor laporan.

### Kasir

Kasir memiliki akses untuk:

- Melihat dashboard.
- Melihat produk.
- Melihat kategori.
- Melakukan transaksi penjualan.
- Melihat riwayat transaksi miliknya.

Pembatasan akses diterapkan melalui autentikasi dan otorisasi backend.

## 12. Modul Aplikasi

| Modul | Fungsi |
|---|---|
| Login | Autentikasi pengguna |
| Dashboard | Menampilkan ringkasan informasi bisnis |
| Produk | Pengelolaan data produk |
| Kategori | Pengelolaan kategori produk |
| Transaksi | Proses penjualan |
| Riwayat Transaksi | Melihat catatan transaksi |
| Pengguna | Pengelolaan akun Admin dan Kasir |
| Laporan | Ringkasan dan ekspor laporan penjualan |

## 13. Alur Menjalankan Project

Setiap anggota tim dapat mengikuti urutan berikut ketika ingin menjalankan aplikasi:

1. Buka Docker Desktop.
2. Jalankan database menggunakan `docker compose up -d`.
3. Pastikan database berjalan melalui `docker compose ps`.
4. Jalankan backend menggunakan `npm run dev`.
5. Buka folder frontend melalui VS Code.
6. Jalankan `frontend/index.html` menggunakan Live Server.
7. Login menggunakan akun yang sudah terdaftar.
8. Gunakan aplikasi sesuai hak akses pengguna.

## 14. Troubleshooting

### A. Failed to Fetch

Kemungkinan penyebab:

- Backend belum berjalan.
- URL API salah.
- Port backend tidak sesuai.
- Konfigurasi CORS belum sesuai.

Periksa backend pada:

```text
http://localhost:3000
```

### B. CORS Error

Pastikan backend mengizinkan origin frontend:

```text
http://localhost:5500
```

Pastikan juga konfigurasi credentials aktif karena sistem menggunakan cookie autentikasi.

### C. Login Gagal

Periksa:

- Username dan password.
- Apakah akun sudah terdaftar.
- Apakah backend dan database berjalan.
- Apakah request login berhasil.
- Apakah cookie autentikasi diterima browser.

### D. Database Tidak Terhubung

Periksa status container:

```bash
docker compose ps
```

Pastikan port database, username, password, dan nama database pada `.env` sudah sesuai.

### E. Halaman Tidak Menampilkan Data

Periksa Developer Tools browser:

```text
F12 → Console
F12 → Network → Fetch/XHR
```

Perhatikan status request API dan pesan error yang muncul.

## 15. Git Workflow untuk Anggota Tim

Sebelum mulai mengerjakan perubahan:

```bash
git pull origin main
```

Setelah menyelesaikan pekerjaan:

```bash
git status
git add .
git commit -m "deskripsi perubahan"
git push origin main
```

Jika tim menggunakan branch terpisah, gunakan branch masing-masing dan ajukan Pull Request sebelum menggabungkan perubahan ke branch utama.

**Perhatian:**

- Jangan mengunggah `.env`.
- Jangan mengunggah `node_modules`.
- Jangan mengubah struktur folder tanpa koordinasi tim.
- Jangan menimpa pekerjaan anggota lain tanpa komunikasi.
- Lakukan pengujian sebelum melakukan commit.

## 16. Alur Pengembangan Proyek

Pengembangan sistem mengikuti tahapan berikut:

1. Analisis kebutuhan sistem (SRS).
2. Use Case Diagram.
3. ERD dan rancangan database.
4. Wireframe dan UI/UX website.
5. Implementasi backend dan frontend.
6. Pengujian sistem.
7. Perencanaan integrasi AI.

Tahapan implementasi dan integrasi frontend-backend saat ini masih dalam proses penyempurnaan.

---

**Sistem Informasi Asisten Bisnis Kedai Kopi**

Dikembangkan sebagai proyek sistem informasi berbasis web.
