# 📚 SMK Ledger Nilai XII — Sistem Manajemen Akademik

Dashboard manajemen ledger nilai siswa kelas XII berbasis **Google Apps Script** yang terhubung langsung ke **Google Spreadsheet**.

---

## ✨ Fitur Utama

| Fitur | Keterangan |
|---|---|
| 📊 **Dashboard** | Statistik total siswa, prodi, kelas, dan grafik distribusi |
| 👥 **Data Siswa** | CRUD lengkap dengan search, filter, sort & pagination |
| 📝 **Nilai Semester** | Tampil nilai per kelas per semester (Sem. 1–6) |
| 📈 **Rekap Prodi** | Rekap jumlah siswa per program keahlian |
| 🔍 **Audit Log** | Riwayat 50 perubahan data terakhir |
| 🌙 **Dark Mode** | Toggle mode gelap, tersimpan di localStorage |
| 📤 **Export CSV** | Export data siswa yang sedang ditampilkan |

---

## 🗂️ Struktur Proyek

```
smk-ledger-nilai/
├── src/
│   ├── Code.gs           # Backend — Google Apps Script controller
│   ├── Index.html        # Template HTML utama
│   ├── Style.html        # CSS (di-include via <?!= include() ?>)
│   ├── Script.html       # JavaScript client-side
│   └── appsscript.json   # Manifest GAS project
├── .clasp.json           # Konfigurasi clasp (deploy tool)
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Cara Deploy ke Google Apps Script

### Prasyarat

- Akun Google
- Node.js ≥ 14.x
- `clasp` (Google Apps Script CLI)

---

### Langkah 1 — Install Clasp

```bash
npm install -g @google/clasp
```

---

### Langkah 2 — Login ke Google

```bash
clasp login
```

Browser akan terbuka untuk autentikasi. Setelah selesai, credentials disimpan di `~/.clasprc.json`.

---

### Langkah 3 — Clone Repositori Ini

```bash
git clone https://github.com/USERNAME/smk-ledger-nilai.git
cd smk-ledger-nilai
npm install
```

---

### Langkah 4 — Buat Project GAS Baru (Opsional)

Jika belum punya project GAS:

```bash
clasp create --title "SMK Ledger Nilai XII" --type webapp --rootDir ./src
```

Clasp akan otomatis mengisi `scriptId` di `.clasp.json`.

**Atau**, jika sudah punya project GAS yang ada:

1. Buka [script.google.com](https://script.google.com)
2. Buka project Anda → **Project Settings** → salin **Script ID**
3. Edit `.clasp.json`:

```json
{
  "scriptId": "PASTE_SCRIPT_ID_ANDA_DI_SINI",
  "rootDir": "./src"
}
```

---

### Langkah 5 — Konfigurasi Spreadsheet

Edit file `src/Code.gs`, ganti `SPREADSHEET_ID` dengan ID spreadsheet Anda:

```js
const CONFIG = {
  SPREADSHEET_ID : 'PASTE_ID_SPREADSHEET_ANDA',  // ← ganti ini
  SHEET_NAME     : 'LEDGER',
  // ...
};
```

**Cara mendapatkan Spreadsheet ID:**
Buka spreadsheet di browser → salin bagian dari URL:
```
https://docs.google.com/spreadsheets/d/[INI_SPREADSHEET_ID]/edit
```

---

### Langkah 6 — Push ke GAS

```bash
clasp push
```

---

### Langkah 7 — Deploy sebagai Web App

```bash
clasp deploy --description "v2.0.1"
```

Atau via UI:
1. Buka [script.google.com](https://script.google.com) → project Anda
2. Klik **Deploy** → **New deployment**
3. Tipe: **Web app**
4. Execute as: **User accessing the web app**
5. Who has access: sesuaikan kebutuhan sekolah
6. Klik **Deploy** → salin URL Web App

---

## 📋 Struktur Spreadsheet yang Diharapkan

Sheet bernama `LEDGER` dengan layout kolom sebagai berikut:

| Kolom | Huruf | Isi |
|---|---|---|
| 1 | A | No. Urut |
| 2 | B | NIS |
| 3 | C | NISN |
| 4 | D | Nama Siswa |
| 5 | E | Program Keahlian |
| 6 | F | Kelas |
| 7–19 | H–T | Nilai Semester 1 (13 mapel) |
| 20–32 | U–AG | Nilai Semester 2 (13 mapel) |
| 33–44 | AH–AS | Nilai Semester 3 (12 mapel) |
| 45–54 | AT–AE | Nilai Semester 4 (12 mapel) |
| 55–64 | BN–CC | Nilai Semester 5 (10 mapel) |
| 65–76 | CD–CR | Nilai Semester 6 (10 mapel) |

Baris 1–2 digunakan untuk **header**, data dimulai dari **baris 3**.

Sheet kedua bernama `AUDIT_LOG` akan dibuat otomatis saat pertama kali ada perubahan data.

---

## 🏫 Program Keahlian & Kelas

| Program Keahlian | Kelas |
|---|---|
| Akuntansi dan Keuangan Lembaga | XIIAKL |
| Pemasaran | XIIPMS |
| Manajemen Perkantoran dan Layanan Bisnis | XIIMPLB |
| Teknik Jaringan Komputer dan Telekomunikasi | XIITJKT |
| Teknik Ketenagalistrikan | XIITK |
| Usaha Layanan Pariwisata | XIIULP |

---

## 🛠️ Perintah Clasp Berguna

```bash
clasp push          # Upload semua file ke GAS
clasp pull          # Download file terbaru dari GAS
clasp deploy        # Buat deployment baru
clasp open          # Buka project di browser
clasp logs          # Lihat log eksekusi terbaru
clasp versions      # Daftar versi yang ada
```

---

## 🔐 Keamanan

- **Jangan commit** file `.clasprc.json` (berisi token Google Anda) — sudah ada di `.gitignore`
- Atur **access level** Web App sesuai kebijakan sekolah (domain saja atau publik)
- Pertimbangkan menggunakan **service account** untuk deployment otomatis di CI/CD

---

## 📄 Lisensi

MIT License — bebas digunakan dan dimodifikasi untuk keperluan sekolah.

---

## 🤝 Kontribusi

Pull request dan issue sangat disambut! Pastikan:
1. Fork repositori ini
2. Buat branch fitur: `git checkout -b fitur/nama-fitur`
3. Commit perubahan: `git commit -m 'feat: deskripsi fitur'`
4. Push ke branch: `git push origin fitur/nama-fitur`
5. Buat Pull Request
