# 📚 SMK Ledger Nilai XII — Sistem Manajemen Akademik

Dashboard manajemen ledger nilai siswa kelas XII berbasis **Google Apps Script** yang terhubung langsung ke **Google Spreadsheet**.

> 🌐 **Web App URL:** https://script.google.com/macros/s/AKfycbyTvu1Y5kc4jxbdC5HAHb3-pKip0-xOSiek5xDBeywdsgt_9xLkPUbZzC21c2yWDqu1/exec

---

## ⚠️ Penting: GitHub Hanya Menyimpan Kode

Repositori GitHub ini hanya menyimpan **kode sumber**. Aplikasi berjalan di **Google Apps Script**, bukan di GitHub Pages. Jangan buka link GitHub sebagai web app — gunakan URL di atas.

---

## ✨ Fitur Utama

| Fitur | Keterangan |
|---|---|
| 📊 **Dashboard** | Statistik total siswa, prodi, kelas, dan grafik distribusi |
| 👥 **Data Siswa** | CRUD lengkap dengan search, filter, sort & pagination |
| 📝 **Nilai Semester** | Tampil nilai per kelas per semester (Sem. 1–6) |
| 📈 **Rekap Prodi** | Rekap jumlah siswa per program keahlian |
| 🔍 **Audit Log** | Riwayat 50 perubahan data terakhir |
| 🌙 **Dark Mode** | Toggle mode gelap |
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
├── .clasp.json           # Konfigurasi clasp (rootDir harus ./src)
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Cara Deploy Ulang / Setup di Komputer Baru

### Prasyarat
- Node.js ≥ 14.x
- Akun Google yang sama dengan pemilik project GAS

### Langkah 1 — Install Clasp
```bash
npm install -g @google/clasp
```

### Langkah 2 — Login
```bash
clasp login
```

### Langkah 3 — Clone & Install
```bash
git clone https://github.com/USERNAME/smk-ledger-nilai.git
cd smk-ledger-nilai
npm install
```

### Langkah 4 — Isi Script ID yang Benar

Script ID berbeda dari Deployment ID. Cara mendapatkannya:

1. Buka https://script.google.com
2. Buka project **SMK Ledger Nilai XII**
3. Klik ikon ⚙️ **Project Settings** (kiri bawah)
4. Salin **Script ID** (format: `1BxABC123...` panjang ~57 karakter)

Edit file `.clasp.json`:
```json
{
  "scriptId": "PASTE_SCRIPT_ID_ASLI_DI_SINI",
  "rootDir": "./src"
}
```

### Langkah 5 — Push Kode
```bash
clasp push
```

### Langkah 6 — Deploy (jika perlu update)
```bash
clasp deploy --description "v2.0.1"
```

---

## 📋 Struktur Spreadsheet

Sheet bernama `LEDGER`, data mulai baris 3 (baris 1–2 = header):

| Kolom | Isi |
|---|---|
| A | No. Urut |
| B | NIS |
| C | NISN |
| D | Nama Siswa |
| E | Program Keahlian |
| F | Kelas |
| H–T | Nilai Semester 1 (13 mapel) |
| U–AG | Nilai Semester 2 (13 mapel) |
| AH–AS | Nilai Semester 3 (12 mapel) |
| AT–AE | Nilai Semester 4 (12 mapel) |
| BN–CC | Nilai Semester 5 (10 mapel) |
| CD–CR | Nilai Semester 6 (10 mapel) |

Sheet `AUDIT_LOG` dibuat otomatis saat pertama ada perubahan.

---

## 🛠️ Perintah Clasp

```bash
clasp push     # Upload kode ke GAS
clasp pull     # Download kode dari GAS
clasp deploy   # Buat deployment baru
clasp open     # Buka project di browser
clasp logs     # Lihat log eksekusi
```

---

## 🔐 Keamanan

- **Jangan commit** `.clasprc.json` — sudah ada di `.gitignore`
- Atur access level Web App sesuai kebijakan sekolah

---

## 📄 Lisensi

MIT License — bebas digunakan untuk keperluan sekolah.
