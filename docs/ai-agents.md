# Instruksi AI Agent

Baseline 2026-11-25. Baca [PRD](prd.md), [design](design.md), dan [architecture](architecture.md) sebelum pekerjaan terkait. Arsip hanya konteks historis; kode aktual membuktikan status implementasi, PRD menentukan target produk. Jika bertentangan, nyatakan konflik dan perbarui keputusan pada dokumen pemiliknya.

## Aturan /plan

Command `/plan` **otomatis menghasilkan file** `docs/plan/YYYY-MM-DD-<nama-plan>.md`, memakai tanggal lokal aktif dan slug kebab-case yang menjelaskan tugas. Jangan hanya memberi rencana di chat. Gunakan [template](plan/template.md); isi konteks, cakupan, bukti kode, langkah, acceptance criteria, pengujian, risiko, dan rollback. Jika nama sudah ada, perbarui plan yang sama hanya untuk tugas yang sama; untuk tugas lain gunakan slug unik tanpa menimpa. Tautkan file pada balasan. Ini merupakan instruksi workflow agent, bukan command runtime aplikasi atau integrasi slash-command yang sudah dipasang.

## Konvensi kode

- Jalankan command npm dari project/; pertahankan root dengan docs/ dan project/ serta metadata Git.
- TypeScript ketat, komponen React bernama PascalCase, hook useCamelCase, CSS Modules bersebelahan dengan komponen. Ikuti format dan ESLint repo.
- Dokumentasi baru memakai kebab-case. Jangan mengganti nama sumber lama yang memakai PascalCase hanya demi menyamakan nama dokumen.
- Sumber tunggal metadata game adalah `project/src/games/catalog.ts` dengan kontrak `project/src/games/types.ts` (plan §3.3); telusuri seluruh pemanggil sebelum mengubah kontrak.
- Spesifikasi rinci game, konten, audio, aset, dan teks UI berada di docs/specs/. Saat mengeksekusi plan PAUD v2, ikuti aturan §0 plan tersebut.
- Data belajar dan locale dipisahkan dari UI ketika diimplementasikan; jangan mengklaim ID/EN lengkap jika teks masih hardcoded.
- Gunakan token desain; kontrol native dengan accessible name, focus-visible, dan target sentuh sesuai design.md.
- Bersihkan effect, timer, listener, pointer capture, dan audio; validasi parameter URL dan data storage.
- Jangan menambah dependensi/engine/backend tanpa kebutuhan yang jelas. Jangan simpan secret atau identitas anak di klien/log.
- Supabase (CMS admin) adalah satu-satunya backend. Aturannya:
  - pakai anon key + RLS; `service_role` dilarang di repo/klien;
  - `@supabase/supabase-js` hanya di `src/admin/**` dan `src/lib/supabase/**`;
  - migrasi SQL di `project/supabase/migrations/` bersifat append-only (jangan edit migrasi yang sudah dijalankan);
  - aksi ke proyek Supabase nyata (MCP/CLI/dashboard) hanya dengan izin eksplisit pengguna.
- Konten belajar dan media dibaca lewat `useContent()`; `src/content/*` hanyalah konten bawaan dan seed CMS.

## Workflow

1. Periksa git status dan instruksi repo; pertahankan perubahan pengguna.
2. Baca dokumen pemilik kebutuhan serta kode terkait; pisahkan kondisi aktual dari target.
3. Untuk /plan, tulis file plan otomatis sebelum implementasi. Permintaan rencana saja tidak mengizinkan implementasi.
4. Implementasikan lingkup yang diminta dengan diff terkecil yang lengkap. Game belum siap tidak ditampilkan seolah dapat dimainkan.
5. Jalankan lint/build untuk perubahan aplikasi; uji perilaku yang terdampak sesuai risiko. Perubahan dokumentasi diverifikasi melalui tautan, konsistensi istilah, dan struktur, tanpa klaim tes aplikasi baru.
6. Sinkronkan dokumen yang terdampak; laporkan hasil konkret, pemeriksaan, dan keterbatasan.

Keputusan produk berada di prd.md; token/interaksi di design.md; struktur/kontrak/data di architecture.md; workflow di file ini. Plan tidak boleh diam-diam mengubah keputusan inti. Pindahkan dokumen usang ke archive/, jangan hapus permanen. Jangan commit/push/deploy tanpa instruksi yang mengizinkan tindakan tersebut.
