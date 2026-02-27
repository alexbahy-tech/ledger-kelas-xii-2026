/**
 * ============================================================
 * SISTEM MANAJEMEN AKADEMIK SMK - LEDGER NILAI XII
 * File     : Code.gs
 * Version  : 2.0.1
 * Author   : Wakasek Kurikulum / Senior GAS Engineer
 * Desc     : Backend controller untuk Web App GAS
 *            Terhubung ke Google Spreadsheet Ledger Nilai XII
 * ============================================================
 */

// ─── KONFIGURASI SPREADSHEET ─────────────────────────────────
const CONFIG = {
  SPREADSHEET_ID : '1y6mLBymxnmzP9khH1ZLU5V3eOWmXc-X8lp9cBNf0Raw', // ← Ganti dengan ID spreadsheet Anda
  SHEET_NAME     : 'LEDGER',
  DATA_START_ROW : 3,          // Baris pertama data (baris 1-2 = header)
  HEADER_ROW1    : 1,
  HEADER_ROW2    : 2,
  COL_NO         : 1,  // A
  COL_NIS        : 2,  // B
  COL_NISN       : 3,  // C
  COL_NAMA       : 4,  // D
  COL_PRODI      : 5,  // E
  COL_KELAS      : 6,  // F
  // Kolom G kosong / pemisah
  // Semester dimulai kolom H (8) sampai CU (99)
  COL_SEM1_START : 7,   // H  — Semester 1: 13 mapel (H–T)
  COL_SEM1_END   : 19,  // T
  COL_SEM2_START : 20,  // U  — Semester 2: 13 mapel (U–AG) identik Sem1
  COL_SEM2_END   : 32,  // AG
  COL_SEM3_START : 33,  // AH — Semester 3: 12 mapel (AH–AS)
  COL_SEM3_END   : 44,  // AS
  COL_SEM4_START : 45,  // AT — Semester 4: 12 mapel (AT–AE)
  COL_SEM4_END   : 54,  // AE
  COL_SEM5_START : 55,  // BN — Semester 5: 10 mapel
  COL_SEM5_END   : 64,  // CC
  COL_SEM6_START : 65,  // CD — Semester 6: 12 mapel
  COL_SEM6_END   : 76,  // CR
};

// Mata pelajaran per semester (sesuai header sheet)
const MAPEL_SEM1  = ['Pend. Agama','Pend. Pancasila','Bhs. Indonesia','PJOK','Sejarah','Mulok','Seni Budaya','Matematika','Bhs. Inggris','Informatika','Projek IPAS','DPK','Rata-Rata'];
const MAPEL_SEM2  = ['Pend. Agama','Pend. Pancasila','Bhs. Indonesia','PJOK','Sejarah','Mulok','Seni Budaya','Matematika','Bhs. Inggris','Informatika','Projek IPAS','DPK','Rata-Rata'];
const MAPEL_SEM3  = ['Pend. Agama','Pend. Pancasila','Bhs. Indonesia','PJOK','Sejarah','Mulok','Matematika','Bhs. Inggris','KK','PKK','Mapel Pilihan','Rata-Rata'];
const MAPEL_SEM4  = ['Pend. Agama','Pend. Pancasila','Bhs. Indonesia','PJOK','Sejarah','Mulok','Matematika','Bhs. Inggris','KK','PKK','Mapel Pilihan','Rata-Rata'];
const MAPEL_SEM5  = ['Pend. Agama','Pend. Pancasila','Bhs. Indonesia','Mulok','Matematika','Bhs. Inggris','KK','PKK','Mapel Pilihan','Rata-Rata'];
const MAPEL_SEM6  = ['Pend. Agama','Pend. Pancasila','Bhs. Indonesia','Mulok','Matematika','Bhs. Inggris','KK','PKK','Mapel Pilihan','Rata-Rata'];

// ─── ENTRY POINT WEB APP ─────────────────────────────────────
/**
 * Titik masuk Web App — render halaman utama
 * @returns {HtmlOutput}
 */
function doGet() {
  return HtmlService
    .createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Dashboard Ledger Nilai XII — SMK')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Helper include() untuk modular HTML templating
 * @param {string} filename - nama file HTML tanpa ekstensi
 * @returns {string} konten HTML
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}


// ─── HELPER: BUKA SHEET ──────────────────────────────────────
/**
 * Buka sheet aktif dari spreadsheet yang dikonfigurasi
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function _getSheet() {
  const ss    = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME)
              || ss.getSheets()[0];
  if (!sheet) throw new Error('Sheet tidak ditemukan di spreadsheet.');
  return sheet;
}

/**
 * Wrapper error handler standar untuk semua fungsi publik
 * @param {Function} fn - fungsi yang dieksekusi
 * @returns {Object} { success, data, error }
 */
function _safeExec(fn) {
  try {
    return { success: true, data: fn() };
  } catch (e) {
    console.error('[GAS ERROR]', e.message, e.stack);
    return { success: false, error: e.message };
  }
}

/**
 * ─── PEMBULATAN NILAI ─────────────────────────────────────────
 * Bulatkan angka ke 2 desimal dengan aman.
 * - Jika null/undefined/string kosong  → kembalikan null
 * - Jika bukan angka (teks, dll)       → kembalikan nilai aslinya
 * - Jika angka valid                   → bulatkan 2 desimal
 *
 * @param {*} val - nilai mentah dari sel spreadsheet
 * @returns {number|string|null}
 */
function _roundNilai(val) {
  if (val === '' || val === null || val === undefined) return null;
  const n = parseFloat(val);
  if (isNaN(n)) return val;
  return parseFloat(n.toFixed(2));
}


// ─── GET HEADERS ─────────────────────────────────────────────
/**
 * Ambil struktur header kolom dari spreadsheet
 * @returns {Object} { success, data: { identity, semesters } }
 */
function getHeaders() {
  return _safeExec(() => {
    return {
      identity: ['No', 'NIS', 'NISN', 'Nama Siswa', 'Program Keahlian', 'Kelas'],
      semesters: [
        { label: 'Semester 1', mapel: MAPEL_SEM1 },
        { label: 'Semester 2', mapel: MAPEL_SEM2 },
        { label: 'Semester 3', mapel: MAPEL_SEM3 },
        { label: 'Semester 4', mapel: MAPEL_SEM4 },
        { label: 'Semester 5', mapel: MAPEL_SEM5 },
        { label: 'Semester 6', mapel: MAPEL_SEM6 },
      ]
    };
  });
}


// ─── GET ALL DATA ─────────────────────────────────────────────
/**
 * Ambil semua data siswa dari spreadsheet
 * @returns {Object} { success, data: Array<SiswaRecord> }
 */
function getAllData() {
  return _safeExec(() => {
    const sheet    = _getSheet();
    const lastRow  = sheet.getLastRow();
    const lastCol  = sheet.getLastColumn();

    if (lastRow < CONFIG.DATA_START_ROW) return [];

    const numRows = lastRow - CONFIG.DATA_START_ROW + 1;
    const rawData = sheet.getRange(CONFIG.DATA_START_ROW, 1, numRows, lastCol).getValues();

    return rawData
      .filter(row => {
        const no   = row[CONFIG.COL_NO   - 1];
        const nama = row[CONFIG.COL_NAMA - 1];
        return (no !== '' && no !== null && no !== undefined) &&
               (nama !== '' && nama !== null && nama !== undefined);
      })
      .map((row, idx) => _rowToObject(row, CONFIG.DATA_START_ROW + idx));
  });
}

/**
 * Konversi satu baris spreadsheet ke object terstruktur
 * @param {Array}  row      - array nilai dari getValues()
 * @param {number} rowIndex - nomor baris aktual di sheet (1-based)
 * @returns {SiswaRecord}
 */
function _rowToObject(row, rowIndex) {
  const getValue = (colIdx) => {
    const val = row[colIdx - 1];
    return (val === '' || val === null || val === undefined) ? null : val;
  };

  const getNilaiSemester = (startCol, mapel) => {
    const obj = {};
    mapel.forEach((m, i) => {
      const raw = row[startCol - 1 + i];
      obj[m] = _roundNilai(raw);
    });
    return obj;
  };

  return {
    _rowIndex : rowIndex,
    no        : getValue(CONFIG.COL_NO),
    nis       : String(getValue(CONFIG.COL_NIS)   || ''),
    nisn      : String(getValue(CONFIG.COL_NISN)  || ''),
    nama      : String(getValue(CONFIG.COL_NAMA)  || ''),
    prodi     : String(getValue(CONFIG.COL_PRODI) || ''),
    kelas     : String(getValue(CONFIG.COL_KELAS) || ''),
    semester1 : getNilaiSemester(CONFIG.COL_SEM1_START, MAPEL_SEM1),
    semester2 : getNilaiSemester(CONFIG.COL_SEM2_START, MAPEL_SEM2),
    semester3 : getNilaiSemester(CONFIG.COL_SEM3_START, MAPEL_SEM3),
    semester4 : getNilaiSemester(CONFIG.COL_SEM4_START, MAPEL_SEM4),
    semester5 : getNilaiSemester(CONFIG.COL_SEM5_START, MAPEL_SEM5),
    semester6 : getNilaiSemester(CONFIG.COL_SEM6_START, MAPEL_SEM6),
  };
}


// ─── ADD ROW ──────────────────────────────────────────────────
/**
 * Tambah satu baris siswa baru ke spreadsheet
 * @param {Object} payload - { nis, nisn, nama, prodi, kelas, semester1..6 }
 * @returns {Object} { success, data: { rowIndex, no } }
 */
function addRow(payload) {
  return _safeExec(() => {
    _validatePayload(payload);

    const sheet   = _getSheet();
    const lastRow = sheet.getLastRow();
    const newRow  = lastRow + 1;

    const lastNo = lastRow >= CONFIG.DATA_START_ROW
      ? sheet.getRange(lastRow, CONFIG.COL_NO).getValue()
      : 0;
    const newNo  = (Number(lastNo) || 0) + 1;

    const rowData = _objectToRow(payload, newNo);
    sheet.appendRow(rowData);

    _writeAuditLog('ADD', newRow, payload.nama);

    return { rowIndex: newRow, no: newNo };
  });
}


// ─── UPDATE ROW ───────────────────────────────────────────────
/**
 * Update data siswa berdasarkan rowIndex
 * @param {Object} payload - harus menyertakan _rowIndex
 * @returns {Object} { success, data: { rowIndex } }
 */
function updateRow(payload) {
  return _safeExec(() => {
    if (!payload._rowIndex) throw new Error('Row index tidak ditemukan.');
    _validatePayload(payload);

    const sheet   = _getSheet();
    const rowIdx  = Number(payload._rowIndex);
    const rowData = _objectToRow(payload, payload.no);

    sheet.getRange(rowIdx, 1, 1, rowData.length).setValues([rowData]);

    _writeAuditLog('UPDATE', rowIdx, payload.nama);

    return { rowIndex: rowIdx };
  });
}


// ─── DELETE ROW ───────────────────────────────────────────────
/**
 * Hapus baris data siswa dari spreadsheet
 * @param {number} rowIndex  - nomor baris di sheet (1-based)
 * @param {string} namaSiswa - untuk audit log
 * @returns {Object} { success, data: true }
 */
function deleteRow(rowIndex, namaSiswa) {
  return _safeExec(() => {
    if (!rowIndex) throw new Error('Row index wajib diisi.');

    const sheet = _getSheet();
    sheet.deleteRow(Number(rowIndex));

    _writeAuditLog('DELETE', rowIndex, namaSiswa || 'Unknown');

    _renumberRows(sheet);

    return true;
  });
}


// ─── GET SUMMARY STATS ────────────────────────────────────────
/**
 * Ambil statistik ringkasan untuk dashboard card
 * @returns {Object} { success, data: StatsObject }
 */
function getSummaryStats() {
  return _safeExec(() => {
    const result = getAllData();
    if (!result.success) throw new Error(result.error);

    const data     = result.data;
    const prodiMap = {};
    const kelasMap = {};

    data.forEach(s => {
      if (s.prodi) prodiMap[s.prodi] = (prodiMap[s.prodi] || 0) + 1;
      if (s.kelas) kelasMap[s.kelas] = (kelasMap[s.kelas] || 0) + 1;
    });

    return {
      totalSiswa    : data.length,
      totalProdi    : Object.keys(prodiMap).length,
      totalKelas    : Object.keys(kelasMap).length,
      prodiBreakdown: Object.entries(prodiMap).map(([k, v]) => ({ nama: k, jumlah: v })),
      kelasBreakdown: Object.entries(kelasMap).map(([k, v]) => ({ kelas: k, jumlah: v })),
    };
  });
}


// ─── GET AUDIT LOG ────────────────────────────────────────────
/**
 * Ambil 50 entri audit log terbaru
 * @returns {Object} { success, data: AuditEntry[] }
 */
function getAuditLog() {
  return _safeExec(() => {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const logSheet = ss.getSheetByName('AUDIT_LOG');
    if (!logSheet) return [];

    const lastRow = logSheet.getLastRow();
    if (lastRow < 2) return [];

    const startRow = Math.max(2, lastRow - 49);
    const numRows  = lastRow - startRow + 1;
    const data     = logSheet.getRange(startRow, 1, numRows, 5).getValues();

    return data.reverse().map(row => ({
      timestamp : row[0]
        ? Utilities.formatDate(new Date(row[0]), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss')
        : '',
      action    : row[1],
      rowRef    : row[2],
      user      : row[3],
      detail    : row[4],
    }));
  });
}


// ─── PRIVATE HELPERS ─────────────────────────────────────────

function _objectToRow(payload, no) {
  const totalCols = CONFIG.COL_SEM6_END;
  const row       = new Array(totalCols).fill('');

  row[CONFIG.COL_NO    - 1] = no            || '';
  row[CONFIG.COL_NIS   - 1] = payload.nis   || '';
  row[CONFIG.COL_NISN  - 1] = payload.nisn  || '';
  row[CONFIG.COL_NAMA  - 1] = payload.nama  || '';
  row[CONFIG.COL_PRODI - 1] = payload.prodi || '';
  row[CONFIG.COL_KELAS - 1] = payload.kelas || '';

  const fillSemester = (semKey, startCol, mapelArr) => {
    const semData = payload[semKey] || {};
    mapelArr.forEach((m, i) => {
      const val = semData[m];
      row[startCol - 1 + i] = (val !== null && val !== undefined && val !== '') ? val : '';
    });
  };

  fillSemester('semester1', CONFIG.COL_SEM1_START, MAPEL_SEM1);
  fillSemester('semester2', CONFIG.COL_SEM2_START, MAPEL_SEM2);
  fillSemester('semester3', CONFIG.COL_SEM3_START, MAPEL_SEM3);
  fillSemester('semester4', CONFIG.COL_SEM4_START, MAPEL_SEM4);
  fillSemester('semester5', CONFIG.COL_SEM5_START, MAPEL_SEM5);
  fillSemester('semester6', CONFIG.COL_SEM6_START, MAPEL_SEM6);

  return row;
}

function _validatePayload(payload) {
  if (!payload)               throw new Error('Data payload kosong.');
  if (!payload.nama?.trim())  throw new Error('Nama siswa wajib diisi.');
  if (!payload.nis?.trim())   throw new Error('NIS wajib diisi.');
  if (!payload.kelas?.trim()) throw new Error('Kelas wajib diisi.');
}

function _renumberRows(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < CONFIG.DATA_START_ROW) return;

  const numRows = lastRow - CONFIG.DATA_START_ROW + 1;
  const noArray = Array.from({ length: numRows }, (_, i) => [i + 1]);
  sheet.getRange(CONFIG.DATA_START_ROW, CONFIG.COL_NO, numRows, 1).setValues(noArray);
}

function _writeAuditLog(action, rowRef, detail) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let logSheet = ss.getSheetByName('AUDIT_LOG');

    if (!logSheet) {
      logSheet = ss.insertSheet('AUDIT_LOG');
      logSheet.getRange(1, 1, 1, 5).setValues([
        ['Timestamp', 'Action', 'Row Ref', 'User', 'Detail']
      ]);
    }

    const user = Session.getActiveUser().getEmail() || 'anonymous';
    logSheet.appendRow([new Date(), action, rowRef, user, detail]);
  } catch (e) {
    console.warn('Audit log gagal:', e.message);
  }
}
